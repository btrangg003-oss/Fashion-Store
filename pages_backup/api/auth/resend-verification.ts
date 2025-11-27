import { NextApiRequest, NextApiResponse } from 'next'
import { validateEmail as validateEmailField, sanitizeString } from '../../../lib/validation'
import { findTempUserByEmail, updateTempUser } from '../../../lib/database'
import { queueVerificationEmail } from '../../../lib/emailQueue'
import { generateVerificationCode, getCodeExpirationTime, checkRateLimit } from '../../../lib/auth'
import { isVerificationValid } from '../../../lib/verificationUtils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    const sanitizedEmail = sanitizeString(email || '').toLowerCase()

    // Validate email
    const emailError = validateEmailField(sanitizedEmail)
    if (emailError) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
        errors: [emailError]
      })
    }

    // Rate limiting for resend requests
    const rateLimitKey = `resend_${sanitizedEmail}`
    const rateLimit = checkRateLimit(rateLimitKey, 3, 5 * 60 * 1000) // 3 attempts per 5 minutes
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều yêu cầu gửi lại mã. Vui lòng thử lại sau.',
        code: 'RATE_LIMITED',
        resetTime: rateLimit.resetTime
      })
    }

    // Get temporary user
    const tempUser = await findTempUserByEmail(sanitizedEmail)
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy yêu cầu đăng ký cho email này.',
        code: 'TEMP_USER_NOT_FOUND'
      })
    }

    // Check if verification is still valid
    const validationResult = isVerificationValid(tempUser)
    
    if (!validationResult.valid) {
      if (validationResult.reason === 'too_many_attempts') {
        return res.status(429).json({
          success: false,
          message: 'Quá nhiều lần thử. Vui lòng đăng ký lại.',
          code: 'TOO_MANY_ATTEMPTS',
          attempts: tempUser.attempts,
          maxAttempts: 5
        })
      }
      // If expired, we can still resend
    }

    // Generate new verification code
    const newCode = generateVerificationCode()
    const newExpiresAt = getCodeExpirationTime()

    // Update temp user with new code
    const updatedTempUser = await updateTempUser(sanitizedEmail, {
      verificationCode: newCode,
      expiresAt: newExpiresAt,
      attempts: 0 // Reset attempts when resending
    })

    if (!updatedTempUser) {
      return res.status(500).json({
        success: false,
        message: 'Không thể cập nhật thông tin xác thực.',
        code: 'UPDATE_FAILED'
      })
    }

    // Queue new verification email
    const emailJobId = await queueVerificationEmail(updatedTempUser)

    console.log(`Verification code resent for ${sanitizedEmail}, email job: ${emailJobId}`)

    return res.status(200).json({
      success: true,
      message: 'Mã xác thực mới đã được gửi đến email của bạn.',
      data: {
        email: updatedTempUser.email,
        expiresAt: updatedTempUser.expiresAt,
        emailJobId
      }
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}