import { NextApiRequest, NextApiResponse } from 'next'
import { validateEmail, checkRateLimit, getErrorMessage } from '../../../lib/auth'
import { AuthErrorType } from '../../../types/auth'
import { findUserByEmail } from '../../../lib/database'
import { generateResetToken, storeResetToken } from '../../../lib/auth'
import { queueResetPasswordEmail } from '../../../lib/emailQueue'
import { withSecurity, createEmailRateLimit } from '../../../lib/securityMiddleware'
import { sanitizeString } from '../../../lib/validation'

const forgotPasswordHandler = async (
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
    const { email } = req.body

    // Sanitize input
    const sanitizedEmail = sanitizeString(email || '').toLowerCase().trim()

    // Validate email
    if (!sanitizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email không được để trống',
        code: AuthErrorType.VALIDATION_ERROR
      })
    }

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
        code: AuthErrorType.VALIDATION_ERROR
      })
    }

    // Check rate limit for forgot password requests
    const rateLimitKey = `forgot_password:${sanitizedEmail}`
    const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000, 60 * 60 * 1000) // 3 attempts per hour, block for 1 hour
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều yêu cầu khôi phục mật khẩu. Vui lòng thử lại sau.',
        code: AuthErrorType.TOO_MANY_ATTEMPTS,
        retryAfter: Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)
      })
    }

    // Find user by email
    const user = await findUserByEmail(sanitizedEmail)
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn khôi phục đến hộp thư của bạn.',
        data: {
          email: sanitizedEmail
        }
      })
    }

    // Generate reset token
    const token = generateResetToken()
    await storeResetToken(sanitizedEmail, token)

    // Generate reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`

    // Queue reset password email
    const jobId = await queueResetPasswordEmail({
      email: sanitizedEmail,
      firstName: user.firstName,
      resetLink
    })

    console.log(`Reset password email queued for ${sanitizedEmail} (Job ID: ${jobId})`)

    // Log security event
    // logSecurityEvent('forgot_password_request', req, { email: sanitizedEmail, success: true })

    return res.status(200).json({
      success: true,
      message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn khôi phục đến hộp thư của bạn.',
      data: {
        email: sanitizedEmail,
        jobId
      }
    })

  } catch (error) {
    console.error('Forgot password error:', error)
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
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyGenerator: createEmailRateLimit
  },
  sanitizeInput: true,
  securityHeaders: true,
  logRequests: true
})(forgotPasswordHandler)
