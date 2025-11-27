import { NextApiRequest, NextApiResponse } from 'next'
import { validateEmail as validateEmailField } from '../../../lib/validation'
import { findTempUserByEmail, findUserByEmail } from '../../../lib/database'

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
    const { email } = req.query

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      })
    }

    // Validate email
    const emailError = validateEmailField(email)
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
        errors: [emailError]
      })
    }

    // Check if user already exists (verified)
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(200).json({
        success: true,
        data: {
          status: 'verified',
          message: 'Email đã được xác thực',
          user: {
            id: existingUser.id,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            createdAt: existingUser.createdAt
          }
        }
      })
    }

    // Check if temp user exists (pending verification)
    const tempUser = await findTempUserByEmail(email)
    if (tempUser) {
      const now = new Date()
      const expiresAt = new Date(tempUser.expiresAt)
      const isExpired = now > expiresAt
      
      return res.status(200).json({
        success: true,
        data: {
          status: isExpired ? 'expired' : 'pending',
          message: isExpired ? 'Mã xác thực đã hết hạn' : 'Đang chờ xác thực email',
          email: tempUser.email,
          expiresAt: tempUser.expiresAt,
          attempts: tempUser.attempts,
          maxAttempts: 5,
          attemptsLeft: Math.max(0, 5 - tempUser.attempts),
          isExpired,
          timeRemaining: isExpired ? 0 : Math.max(0, expiresAt.getTime() - now.getTime())
        }
      })
    }

    // No user or temp user found
    return res.status(404).json({
      success: true,
      data: {
        status: 'not_found',
        message: 'Không tìm thấy thông tin đăng ký cho email này'
      }
    })

  } catch (error) {
    console.error('Verification status error:', error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}