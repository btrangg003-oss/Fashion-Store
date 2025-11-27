import { NextApiRequest, NextApiResponse } from 'next'
import { validatePassword, verifyResetToken, consumeResetToken, hashPassword } from '../../../lib/auth'
import { findUserByEmail, updateUser } from '../../../lib/database'
import { withSecurity } from '../../../lib/securityMiddleware'
import { sanitizeString } from '../../../lib/validation'

const resetPasswordHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { token, newPassword } = req.body

    // Sanitize inputs
    const sanitizedToken = sanitizeString(token || '').trim()
    const sanitizedNewPassword = sanitizeString(newPassword || '')

    // Validate inputs
    if (!sanitizedToken) {
      return res.status(400).json({
        success: false,
        message: 'Token không được để trống'
      })
    }

    if (!sanitizedNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới không được để trống'
      })
    }

    if (!validatePassword(sanitizedNewPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      })
    }

    // Verify reset token
    const tokenVerification = await verifyResetToken(sanitizedToken)
    if (!tokenVerification.valid) {
      return res.status(400).json({
        success: false,
        message: tokenVerification.error || 'Token không hợp lệ'
      })
    }

    const email = tokenVerification.email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ'
      })
    }

    // Find user by email
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng không tồn tại'
      })
    }

    // Hash new password
    const hashedPassword = await hashPassword(sanitizedNewPassword)

    // Update user password
    await updateUser(user.id, {
      passwordHash: hashedPassword,
      updatedAt: new Date().toISOString()
    })

    // Consume the reset token (remove it)
    await consumeResetToken(sanitizedToken)

    console.log(`Password reset successful for user: ${email}`)

    return res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.',
      data: {
        email: user.email
      }
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}

// Apply security middleware
export default withSecurity({
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  sanitizeInput: true,
  securityHeaders: true,
  logRequests: true
})(resetPasswordHandler)
