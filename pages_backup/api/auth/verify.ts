import { NextApiRequest, NextApiResponse } from 'next'
import { validateVerificationData } from '../../../lib/validation'
import { 
  findTempUserByEmail, 
  deleteTempUser, 
  createUser, 
  findUserByEmail,
  updateTempUser 
} from '../../../lib/database'
import { queueWelcomeEmail } from '../../../lib/emailQueue'
import { createUserFromTempUser, checkRateLimit } from '../../../lib/auth'
import { sanitizeString } from '../../../lib/validation'

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
    const { email, verificationCode } = req.body

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email || '').toLowerCase()
    const sanitizedCode = sanitizeString(verificationCode || '')

    // Validate input
    const validation = validateVerificationData(sanitizedEmail, sanitizedCode)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      })
    }

    // Rate limiting for verification attempts
    const rateLimitKey = `verify_${sanitizedEmail}`
    const rateLimit = checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000) // 10 attempts per 15 minutes
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Quá nhiều lần thử xác thực. Vui lòng thử lại sau.',
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

    // Check if code has expired
    if (new Date() > new Date(tempUser.expiresAt)) {
      // Clean up expired temp user
      await deleteTempUser(sanitizedEmail)
      return res.status(410).json({
        success: false,
        message: 'Mã xác thực đã hết hạn. Vui lòng đăng ký lại.',
        code: 'CODE_EXPIRED',
        expiredAt: tempUser.expiresAt
      })
    }

    // Check verification code
    if (tempUser.verificationCode !== sanitizedCode) {
      // Increment attempts in database
      const updatedAttempts = tempUser.attempts + 1
      
      if (updatedAttempts >= 5) {
        // Too many failed attempts, delete temp user
        await deleteTempUser(sanitizedEmail)
        return res.status(429).json({
          success: false,
          message: 'Quá nhiều lần nhập sai. Vui lòng đăng ký lại.',
          code: 'TOO_MANY_ATTEMPTS',
          maxAttempts: 5
        })
      }

      // Update attempts in database
      await updateTempUser(sanitizedEmail, { attempts: updatedAttempts })

      return res.status(400).json({
        success: false,
        message: `Mã xác thực không đúng. Còn lại ${5 - updatedAttempts} lần thử.`,
        code: 'INVALID_CODE',
        attemptsLeft: 5 - updatedAttempts,
        attemptsUsed: updatedAttempts,
        maxAttempts: 5
      })
    }

    // Check if user already exists (edge case)
    const existingUser = await findUserByEmail(sanitizedEmail)
    if (existingUser) {
      await deleteTempUser(sanitizedEmail)
      return res.status(409).json({
        success: false,
        message: 'Email này đã được đăng ký.',
        code: 'USER_ALREADY_EXISTS'
      })
    }

    // Create permanent user
    const userData = createUserFromTempUser(tempUser)
    const newUser = await createUser(userData)

    // Clean up temporary user
    await deleteTempUser(sanitizedEmail)

    // Queue welcome email
    const welcomeEmailJobId = await queueWelcomeEmail(newUser.email, newUser.firstName)

    console.log(`User verified and created: ${sanitizedEmail}, welcome email job: ${welcomeEmailJobId}`)

    return res.status(200).json({
      success: true,
      message: 'Xác thực thành công! Tài khoản của bạn đã được tạo.',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          phone: newUser.phone,
          createdAt: newUser.createdAt
        },
        welcomeEmailJobId
      }
    })

  } catch (error) {
    console.error('Verification error:', error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}