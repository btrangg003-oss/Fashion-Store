import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from './auth'
import { findUserById } from './database'
import { JWTPayload, User } from '../types/auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: User
  token?: string
  isAdmin?: boolean
}

export type AuthMiddleware = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
) => Promise<void>

// Middleware to verify JWT token and attach user to request
export const requireAdmin: AuthMiddleware = async (req, res, next) => {
  try {
    // First verify authentication
    await requireAuth(req, res, async () => {
      // Check if user is admin
      if (!req.isAdmin) {
        res.status(403).json({ error: 'Unauthorized: Admin access required' })
        return
      }
      await next()
    })
  } catch (error) {
    console.error('Admin auth error:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}

export const requireAuth: AuthMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const authToken = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!authToken) {
      throw new Error('No token provided')
    }

    const decoded = await verifyToken(authToken)
    if (!decoded) {
      throw new Error('Invalid token')
    }

    const userData = await findUserById(decoded.userId)

    if (!userData) {
      throw new Error('User not found')
    }

    // Check account status - Block login for blocked/banned accounts
    if (userData.accountStatus === 'blocked' || userData.accountStatus === 'banned') {
      res.status(403).json({ 
        error: 'Tài khoản của bạn đã bị chặn. Vui lòng liên hệ admin.',
        accountStatus: userData.accountStatus
      })
      return
    }

    // Check if user is admin
    const isAdmin = userData.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

    // Attach user, token and admin status to request
    req.user = userData
    req.token = authToken
    req.isAdmin = isAdmin

    // Continue to next middleware/route handler
    await next()
  } catch (error) {
    console.error('Auth error:', error)
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth: AuthMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const authToken = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (!authToken) {
      return next() // Continue without user
    }

    const decoded = await verifyToken(authToken)
    if (!decoded) {
      return next() // Continue without user
    }

    const userData = await findUserById(decoded.userId)
    if (!userData || !userData.isVerified) {
      return next() // Continue without user
    }

    // Attach user and token to request
    req.user = userData
    req.token = authToken
    req.isAdmin = userData.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

    await next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    await next() // Continue without user on error
  }
}

// Helper function to create protected API handler
export const withAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise<void>((resolve, reject) => {
      requireAuth(req as AuthenticatedRequest, res, () => resolve())
        .catch(reject)
    })

    // If we get here, authentication was successful
    return handler(req as AuthenticatedRequest, res)
  }
}

// Helper function to create optionally protected API handler
export const withOptionalAuth = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise<void>((resolve) => {
      optionalAuth(req as AuthenticatedRequest, res, () => resolve())
        .catch(() => resolve()) // Don't fail on auth errors
    })

    return handler(req as AuthenticatedRequest, res)
  }
}


// Middleware to check if user can use vouchers (restricted accounts cannot)
export const canUseVouchers: AuthMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (req.user.accountStatus === 'restricted') {
      res.status(403).json({ 
        error: 'Tài khoản của bạn bị hạn chế không thể sử dụng mã giảm giá/voucher.',
        accountStatus: 'restricted',
        feature: 'voucher'
      })
      return
    }

    await next()
  } catch (error) {
    console.error('Voucher check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Middleware to check if user can earn points (restricted accounts cannot)
export const canEarnPoints: AuthMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (req.user.accountStatus === 'restricted') {
      res.status(403).json({ 
        error: 'Tài khoản của bạn bị hạn chế không thể tích điểm.',
        accountStatus: 'restricted',
        feature: 'points'
      })
      return
    }

    await next()
  } catch (error) {
    console.error('Points check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Middleware to check if user can use chatbot (restricted accounts cannot)
export const canUseChatbot: AuthMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (req.user.accountStatus === 'restricted') {
      res.status(403).json({ 
        error: 'Tài khoản của bạn bị hạn chế không thể sử dụng chatbot.',
        accountStatus: 'restricted',
        feature: 'chatbot'
      })
      return
    }

    await next()
  } catch (error) {
    console.error('Chatbot check error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper to create voucher-protected API handler
export const withVoucherAccess = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise<void>((resolve, reject) => {
      requireAuth(req as AuthenticatedRequest, res, () => {
        canUseVouchers(req as AuthenticatedRequest, res, () => resolve()).catch(reject)
      }).catch(reject)
    })

    return handler(req as AuthenticatedRequest, res)
  }
}

// Helper to create points-protected API handler
export const withPointsAccess = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise<void>((resolve, reject) => {
      requireAuth(req as AuthenticatedRequest, res, () => {
        canEarnPoints(req as AuthenticatedRequest, res, () => resolve()).catch(reject)
      }).catch(reject)
    })

    return handler(req as AuthenticatedRequest, res)
  }
}

// Helper to create chatbot-protected API handler
export const withChatbotAccess = (handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise<void>((resolve, reject) => {
      requireAuth(req as AuthenticatedRequest, res, () => {
        canUseChatbot(req as AuthenticatedRequest, res, () => resolve()).catch(reject)
      }).catch(reject)
    })

    return handler(req as AuthenticatedRequest, res)
  }
}
