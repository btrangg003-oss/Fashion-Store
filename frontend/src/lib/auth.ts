import * as bcrypt from 'bcryptjs'
import { sign, verify, SignOptions } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { User, JWTPayload, AuthErrorType } from '../types/auth'

// Password utilities
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}

// JWT utilities
export const generateToken = (user: User): string => {
  const payload = {
    userId: user.id,
    id: user.id,  // Add id for compatibility
    email: user.email,
    role: user.role || 'user',  // ← THÊM ROLE VÀO TOKEN
    firstName: user.firstName,
    lastName: user.lastName
  }

  const secret = process.env.JWT_SECRET!

  return sign(payload, secret, { expiresIn: '7d' })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return verify(token, process.env.JWT_SECRET!) as JWTPayload
  } catch (error) {
    return null
  }
}

// Utility functions
export const generateUserId = (): string => {
  return uuidv4()
}

export const generateVerificationCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

export const isCodeExpired = (expiresAt: string): boolean => {
  return new Date() > new Date(expiresAt)
}

export const getCodeExpirationTime = (): string => {
  const expirationTime = new Date()
  expirationTime.setMinutes(expirationTime.getMinutes() + 10) // 10 minutes
  return expirationTime.toISOString()
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10,11}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Error messages in Vietnamese
export const getErrorMessage = (errorType: AuthErrorType): string => {
  const errorMessages = {
    [AuthErrorType.VALIDATION_ERROR]: 'Thông tin không hợp lệ',
    [AuthErrorType.USER_EXISTS]: 'Email đã được sử dụng',
    [AuthErrorType.USER_NOT_FOUND]: 'Tài khoản không tồn tại',
    [AuthErrorType.INVALID_CREDENTIALS]: 'Email hoặc mật khẩu không đúng',
    [AuthErrorType.INVALID_CODE]: 'Mã xác thực không đúng',
    [AuthErrorType.CODE_EXPIRED]: 'Mã xác thực đã hết hạn',
    [AuthErrorType.TOO_MANY_ATTEMPTS]: 'Quá nhiều lần thử. Vui lòng thử lại sau',
    [AuthErrorType.EMAIL_SEND_FAILED]: 'Không thể gửi email. Vui lòng thử lại',
    [AuthErrorType.TOKEN_INVALID]: 'Phiên đăng nhập không hợp lệ',
    [AuthErrorType.TOKEN_EXPIRED]: 'Phiên đăng nhập đã hết hạn',
    [AuthErrorType.ACCOUNT_NOT_VERIFIED]: 'Tài khoản chưa được xác thực email'
  }

  return errorMessages[errorType] || 'Có lỗi xảy ra'
}

// Rate limiting utilities
interface RateLimitEntry {
  attempts: number
  lastAttempt: number
  blockedUntil?: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export const checkRateLimit = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  blockDurationMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remainingAttempts: number; resetTime?: number } => {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry) {
    rateLimitStore.set(key, {
      attempts: 1,
      lastAttempt: now
    })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }

  // Check if still blocked
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: entry.blockedUntil
    }
  }

  // Reset if window has passed
  if (now - entry.lastAttempt > windowMs) {
    rateLimitStore.set(key, {
      attempts: 1,
      lastAttempt: now
    })
    return { allowed: true, remainingAttempts: maxAttempts - 1 }
  }

  // Increment attempts
  entry.attempts++
  entry.lastAttempt = now

  if (entry.attempts > maxAttempts) {
    entry.blockedUntil = now + blockDurationMs
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: entry.blockedUntil
    }
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - entry.attempts
  }
}

export const resetRateLimit = (key: string): void => {
  rateLimitStore.delete(key)
}

// TempUser creation utility
export const createTempUserData = (userData: {
  email: string
  firstName: string
  lastName: string
  phone: string
  passwordHash: string
}): import('../types/auth').TempUser => {
  return {
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone,
    passwordHash: userData.passwordHash,
    verificationCode: generateVerificationCode(),
    expiresAt: getCodeExpirationTime(),
    attempts: 0,
    createdAt: new Date().toISOString()
  }
}

// User creation utility from TempUser
export const createUserFromTempUser = (tempUser: import('../types/auth').TempUser): import('../types/auth').User => {
  return {
    id: generateUserId(),
    email: tempUser.email,
    firstName: tempUser.firstName,
    lastName: tempUser.lastName,
    phone: tempUser.phone,
    passwordHash: tempUser.passwordHash,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: undefined
  }
}

// Reset password token utilities
export const generateResetToken = (): string => {
  return uuidv4()
}

export const storeResetToken = async (email: string, token: string): Promise<void> => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  const resetToken = {
    email,
    token,
    expiresAt,
    createdAt: new Date().toISOString()
  }

  const { storeResetTokenInDb, cleanupExpiredResetTokens } = await import('./database')
  await cleanupExpiredResetTokens() // Cleanup expired tokens first
  await storeResetTokenInDb(resetToken)
}

export const verifyResetToken = async (token: string): Promise<{ valid: boolean; email?: string; error?: string }> => {
  const { findResetToken, deleteResetToken } = await import('./database')
  const tokenData = await findResetToken(token)

  if (!tokenData) {
    return { valid: false, error: 'Token không tồn tại' }
  }

  if (new Date() > new Date(tokenData.expiresAt)) {
    await deleteResetToken(token)
    return { valid: false, error: 'Token đã hết hạn' }
  }

  return { valid: true, email: tokenData.email }
}

export const consumeResetToken = async (token: string): Promise<boolean> => {
  const { deleteResetToken } = await import('./database')
  await deleteResetToken(token)
  return true
}
