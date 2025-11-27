import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from './auth'
import { findUserById, updateSessionAccess } from './database'
import { AuthErrorType } from '../types/auth'

export interface AuthenticatedRequest extends NextApiRequest {
    user?: {
        id: string
        email: string
        firstName: string
        lastName: string
        phone: string
        isVerified: boolean
        createdAt: string
        updatedAt: string
        lastLoginAt?: string
    }
}

export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    type: AuthErrorType.TOKEN_INVALID,
                    message: 'Token không hợp lệ'
                }
            })
        }

        const payload = verifyToken(token)
        if (!payload) {
            return res.status(401).json({
                success: false,
                error: {
                    type: AuthErrorType.TOKEN_INVALID,
                    message: 'Token không hợp lệ'
                }
            })
        }

        const user = await findUserById(payload.userId)
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    type: AuthErrorType.USER_NOT_FOUND,
                    message: 'Người dùng không tồn tại'
                }
            })
        }

        // Update session access time
        await updateSessionAccess(token)

        // Attach user to request (without password hash)
        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLoginAt: user.lastLoginAt
        }

        next()
    } catch (error) {
        console.error('Authentication middleware error:', error)
        return res.status(500).json({
            success: false,
            error: {
                type: AuthErrorType.TOKEN_INVALID,
                message: 'Internal server error'
            }
        })
    }
}

export const requireAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
        await authenticateToken(req, res, () => handler(req, res))
    }
}

// CORS middleware
export const corsMiddleware = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    next()
}

// Input sanitization middleware
export const sanitizeInput = (input: any): any => {
    if (typeof input === 'string') {
        return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput)
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized: any = {}
        for (const key in input) {
            sanitized[key] = sanitizeInput(input[key])
        }
        return sanitized
    }

    return input
}

export const sanitizeMiddleware = (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    if (req.body) {
        req.body = sanitizeInput(req.body)
    }

    if (req.query) {
        req.query = sanitizeInput(req.query)
    }

    next()
}