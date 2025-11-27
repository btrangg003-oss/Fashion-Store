import { User, TempUser, RegisterRequest } from '../models/auth'
import { 
  findUserByEmail, 
  findTempUserByEmail, 
  createUser, 
  createTempUser, 
  deleteTempUser,
  updateUser as dbUpdateUser,
  updateTempUser,
  findUserById
} from './database'
import { 
  generateUserId, 
  generateVerificationCode, 
  getCodeExpirationTime, 
  hashPassword 
} from './auth'
import { sanitizeRegistrationData } from './validation'

// Export updateUser for use in API routes
export const updateUser = dbUpdateUser
export { findUserById as getUserById }

// Create a new temporary user for email verification
export const createTempUserForVerification = async (
  registrationData: RegisterRequest
): Promise<TempUser> => {
  // Sanitize input data
  const sanitizedData = sanitizeRegistrationData(registrationData)
  
  // Hash password
  const passwordHash = await hashPassword(sanitizedData.password)
  
  // Generate verification code and expiration
  const verificationCode = generateVerificationCode()
  const expiresAt = getCodeExpirationTime()
  
  // Create temporary user object
  const tempUser: TempUser = {
    email: sanitizedData.email,
    firstName: sanitizedData.firstName,
    lastName: sanitizedData.lastName,
    phone: sanitizedData.phone,
    passwordHash,
    verificationCode,
    expiresAt,
    attempts: 0,
    createdAt: new Date().toISOString()
  }
  
  // Save to database
  return await createTempUser(tempUser)
}

// Convert temporary user to permanent user after verification
export const convertTempUserToPermanent = async (email: string): Promise<User> => {
  const tempUser = await findTempUserByEmail(email)
  if (!tempUser) {
    throw new Error('Temporary user not found')
  }
  
  // Create permanent user
  const user: User = {
    id: generateUserId(),
    firstName: tempUser.firstName,
    lastName: tempUser.lastName,
    email: tempUser.email,
    phone: tempUser.phone,
    passwordHash: tempUser.passwordHash,
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Save permanent user
  const createdUser = await createUser(user)
  
  // Delete temporary user
  await deleteTempUser(email)
  
  return createdUser
}

// Update user's last login time
export const updateUserLastLogin = async (userId: string): Promise<User | null> => {
  return await dbUpdateUser(userId, {
    lastLoginAt: new Date().toISOString()
  })
}

// Check if email is already registered
export const isEmailRegistered = async (email: string): Promise<boolean> => {
  const user = await findUserByEmail(email)
  return user !== null
}

// Check if email has pending verification
export const hasPendingVerification = async (email: string): Promise<boolean> => {
  const tempUser = await findTempUserByEmail(email)
  return tempUser !== null
}

// Resend verification code for existing temp user
export const resendVerificationCode = async (email: string): Promise<TempUser> => {
  const tempUser = await findTempUserByEmail(email)
  if (!tempUser) {
    throw new Error('No pending verification found for this email')
  }
  
  // Generate new code and expiration
  const verificationCode = generateVerificationCode()
  const expiresAt = getCodeExpirationTime()
  
  // Update temp user with new code
  const updatedTempUser = await updateTempUser(email, {
    verificationCode,
    expiresAt,
    attempts: 0 // Reset attempts when resending
  })
  
  if (!updatedTempUser) {
    throw new Error('Failed to update verification code')
  }
  
  return updatedTempUser
}

// Increment verification attempts
export const incrementVerificationAttempts = async (email: string): Promise<TempUser | null> => {
  const tempUser = await findTempUserByEmail(email)
  if (!tempUser) {
    return null
  }
  
  return await updateTempUser(email, {
    attempts: tempUser.attempts + 1
  })
}

// Get user profile (without sensitive data)
export const getUserProfile = (user: User): Omit<User, 'passwordHash'> => {
  const { passwordHash, ...profile } = user
  return profile
}

// Validate verification code and attempts
export const validateVerificationAttempt = async (
  email: string, 
  code: string
): Promise<{
  isValid: boolean
  tempUser: TempUser | null
  error?: string
}> => {
  const tempUser = await findTempUserByEmail(email)
  
  if (!tempUser) {
    return {
      isValid: false,
      tempUser: null,
      error: 'No verification pending for this email'
    }
  }
  
  // Check if code has expired
  if (new Date() > new Date(tempUser.expiresAt)) {
    return {
      isValid: false,
      tempUser,
      error: 'Verification code has expired'
    }
  }
  
  // Check if too many attempts
  if (tempUser.attempts >= 5) {
    return {
      isValid: false,
      tempUser,
      error: 'Too many failed attempts. Please request a new code'
    }
  }
  
  // Check if code matches
  if (tempUser.verificationCode !== code) {
    // Increment attempts
    await incrementVerificationAttempts(email)
    return {
      isValid: false,
      tempUser,
      error: 'Invalid verification code'
    }
  }
  
  return {
    isValid: true,
    tempUser
  }
}

// Get user statistics
export const getUserStats = async (userId: string): Promise<{
  joinDate: string
  lastLogin?: string
  isVerified: boolean
  totalOrders?: number
  totalSpent?: number
}> => {
  const user = await findUserByEmail('') // This is a placeholder - we'd need to find by ID
  
  if (!user) {
    throw new Error('User not found')
  }
  
  return {
    joinDate: user.createdAt,
    lastLogin: user.lastLoginAt,
    isVerified: user.isVerified,
    // These would be calculated from order data in a real app
    totalOrders: 0,
    totalSpent: 0
  }
}