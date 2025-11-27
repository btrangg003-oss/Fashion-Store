import { findTempUserByEmail, deleteTempUser, readDatabase, writeDatabase } from './database'
import { TempUser } from '../types/auth'

// Clean up expired temp users
export const cleanupExpiredTempUsers = async (): Promise<{
  cleaned: number
  errors: string[]
}> => {
  const errors: string[] = []
  let cleaned = 0

  try {
    const data = await readDatabase()
    const now = new Date()
    
    // Find expired temp users
    const expiredUsers = data.tempUsers.filter(user => 
      new Date(user.expiresAt) < now
    )

    if (expiredUsers.length === 0) {
      return { cleaned: 0, errors: [] }
    }

    // Remove expired users
    data.tempUsers = data.tempUsers.filter(user => 
      new Date(user.expiresAt) >= now
    )

    await writeDatabase(data)
    cleaned = expiredUsers.length

    console.log(`Cleaned up ${cleaned} expired temp users`)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Cleanup failed: ${errorMessage}`)
    console.error('Cleanup expired temp users error:', error)
  }

  return { cleaned, errors }
}

// Get verification statistics
export const getVerificationStats = async (): Promise<{
  total: number
  pending: number
  expired: number
  recentAttempts: Array<{
    email: string
    attempts: number
    maxAttempts: number
    expiresAt: string
    isExpired: boolean
  }>
}> => {
  try {
    const data = await readDatabase()
    const now = new Date()

    const pending = data.tempUsers.filter(user => 
      new Date(user.expiresAt) >= now
    ).length

    const expired = data.tempUsers.filter(user => 
      new Date(user.expiresAt) < now
    ).length

    const recentAttempts = data.tempUsers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(user => ({
        email: user.email,
        attempts: user.attempts,
        maxAttempts: 5,
        expiresAt: user.expiresAt,
        isExpired: new Date(user.expiresAt) < now
      }))

    return {
      total: data.tempUsers.length,
      pending,
      expired,
      recentAttempts
    }

  } catch (error) {
    console.error('Get verification stats error:', error)
    return {
      total: 0,
      pending: 0,
      expired: 0,
      recentAttempts: []
    }
  }
}

// Validate verification code format
export const isValidVerificationCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false
  }

  // Must be exactly 4 digits
  const codeRegex = /^[0-9]{4}$/
  return codeRegex.test(code.trim())
}

// Check if verification is still valid
export const isVerificationValid = (tempUser: TempUser): {
  valid: boolean
  reason?: string
  timeRemaining?: number
} => {
  const now = new Date()
  const expiresAt = new Date(tempUser.expiresAt)

  // Check if expired
  if (now > expiresAt) {
    return {
      valid: false,
      reason: 'expired',
      timeRemaining: 0
    }
  }

  // Check if too many attempts
  if (tempUser.attempts >= 5) {
    return {
      valid: false,
      reason: 'too_many_attempts'
    }
  }

  return {
    valid: true,
    timeRemaining: expiresAt.getTime() - now.getTime()
  }
}

// Generate verification summary for user
export const getVerificationSummary = async (email: string): Promise<{
  status: 'not_found' | 'pending' | 'expired' | 'blocked' | 'verified'
  message: string
  details?: unknown
}> => {
  try {
    // Check if already verified (permanent user exists)
    const { findUserByEmail } = await import('./database')
    const existingUser = await findUserByEmail(email)
    
    if (existingUser) {
      return {
        status: 'verified',
        message: 'Email đã được xác thực thành công',
        details: {
          userId: existingUser.id,
          verifiedAt: existingUser.createdAt
        }
      }
    }

    // Check temp user
    const tempUser = await findTempUserByEmail(email)
    if (!tempUser) {
      return {
        status: 'not_found',
        message: 'Không tìm thấy yêu cầu đăng ký cho email này'
      }
    }

    const validation = isVerificationValid(tempUser)
    
    if (!validation.valid) {
      if (validation.reason === 'expired') {
        return {
          status: 'expired',
          message: 'Mã xác thực đã hết hạn',
          details: {
            expiredAt: tempUser.expiresAt
          }
        }
      } else if (validation.reason === 'too_many_attempts') {
        return {
          status: 'blocked',
          message: 'Quá nhiều lần thử. Vui lòng đăng ký lại',
          details: {
            attempts: tempUser.attempts,
            maxAttempts: 5
          }
        }
      }
    }

    return {
      status: 'pending',
      message: 'Đang chờ xác thực email',
      details: {
        attempts: tempUser.attempts,
        maxAttempts: 5,
        attemptsLeft: 5 - tempUser.attempts,
        expiresAt: tempUser.expiresAt,
        timeRemaining: validation.timeRemaining
      }
    }

  } catch (error) {
    console.error('Get verification summary error:', error)
    return {
      status: 'not_found',
      message: 'Lỗi khi kiểm tra trạng thái xác thực'
    }
  }
}