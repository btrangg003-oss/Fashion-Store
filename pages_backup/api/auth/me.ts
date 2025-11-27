import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import { findUserById } from '../../../lib/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // Get token from cookie or Authorization header
    const cookieToken = req.cookies['auth-token']
    const headerToken = req.headers.authorization?.replace('Bearer ', '')
    const token = cookieToken || headerToken

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không được cung cấp.',
        code: 'TOKEN_MISSING'
      })
    }

    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn.',
        code: 'TOKEN_INVALID'
      })
    }

    // Find user by ID from token
    const user = await findUserById(payload.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại.',
        code: 'USER_NOT_FOUND'
      })
    }

    // Check if user is still verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được xác thực.',
        code: 'ACCOUNT_NOT_VERIFIED'
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          isVerified: user.isVerified,
          role: user.role || 'user',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
          // Profile fields
          displayName: user.displayName,
          avatar: user.avatar,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          // Account stats
          accountLevel: user.accountLevel,
          totalOrders: user.totalOrders,
          totalSpent: user.totalSpent,
          points: user.points,
          // Loyalty program
          loyaltyPoints: user.loyaltyPoints,
          loyaltyTier: user.loyaltyTier
        }
      }
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}