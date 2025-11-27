import { NextApiRequest, NextApiResponse } from 'next'
import { validateRegistrationData } from '../services/validation'
import { createTempUser, findTempUserByEmail } from '../services/database'
import { queueVerificationEmail } from '../services/emailQueue'
import { hashPassword, createTempUserData } from '../services/auth'
import { withSecurity, logSecurityEvent, createEmailRateLimit } from '../services/securityMiddleware'

const registerHandler = async (
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
    const { email, firstName, lastName, phone, password } = req.body

    // Validate input
    const validation = validateRegistrationData({
      email,
      firstName,
      lastName,
      phone,
      password
    })

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      })
    }

    // Check if user already has a pending verification
    const existingTempUser = await findTempUserByEmail(email)
    if (existingTempUser) {
      return res.status(409).json({
        success: false,
        message: 'Email đã được đăng ký và đang chờ xác thực. Vui lòng kiểm tra email của bạn.',
        code: 'EMAIL_PENDING_VERIFICATION'
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create temporary user data
    const tempUserData = createTempUserData({
      email,
      firstName,
      lastName,
      phone,
      passwordHash
    })

    // Save temporary user to database
    const tempUser = await createTempUser(tempUserData)

    // Queue verification email
    const emailJobId = await queueVerificationEmail(tempUser)

    // Log registration event
    logSecurityEvent('registration', req, { email, success: true })
    console.log(`Registration initiated for ${email}, email job: ${emailJobId}`)

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        email: tempUser.email,
        expiresAt: tempUser.expiresAt,
        emailJobId
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
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
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    keyGenerator: createEmailRateLimit
  },
  sanitizeInput: true,
  securityHeaders: true,
  logRequests: false
})(registerHandler)