import { NextApiRequest, NextApiResponse } from 'next'
import { validateLoginData } from '../services/validation'
import { findUserByEmail, updateUser } from '../services/database'
import { verifyPassword, generateToken } from '../services/auth'
import { sanitizeString } from '../services/validation'
import { withSecurity, logSecurityEvent, createEmailRateLimit } from '../services/securityMiddleware'

const loginHandler = async (
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
    const { email, password, rememberMe } = req.body

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email || '').toLowerCase()
    const sanitizedPassword = password || ''

    // Validate input
    const validation = validateLoginData(sanitizedEmail, sanitizedPassword)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      })
    }

    // Log login attempt
    logSecurityEvent('login_attempt', req, { email: sanitizedEmail, success: false })

    // Find user by email
    const user = await findUserByEmail(sanitizedEmail)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được xác thực email. Vui lòng kiểm tra email để xác thực.',
        code: 'ACCOUNT_NOT_VERIFIED',
        data: {
          email: user.email,
          needsVerification: true
        }
      })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(sanitizedPassword, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng.',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Update last login timestamp
    await updateUser(user.id, {
      lastLoginAt: new Date().toISOString()
    })

    // Generate JWT token
    const token = generateToken(user)

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 1 day
      path: '/'
    }

    // Set JWT token in cookie - set both 'token' and 'auth-token' for compatibility
    const cookieString = `HttpOnly; Secure=${cookieOptions.secure}; SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge / 1000}; Path=${cookieOptions.path}`;
    res.setHeader('Set-Cookie', [
      `token=${token}; ${cookieString}`,
      `auth-token=${token}; ${cookieString}`
    ])

    // Log successful login
    logSecurityEvent('login_attempt', req, { email: sanitizedEmail, success: true })
    console.log(`User logged in successfully: ${sanitizedEmail}`)

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công!',
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
        },
        token, // Also return token for client-side storage if needed
        expiresIn: rememberMe ? '30d' : '1d'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
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
    keyGenerator: createEmailRateLimit
  },
  sanitizeInput: true,
  securityHeaders: true,
  logRequests: false
})(loginHandler)