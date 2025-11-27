export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  passwordHash: string
  isVerified: boolean
  role?: 'user' | 'admin'
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  
  // Account status
  accountStatus?: 'active' | 'blocked' | 'banned' | 'restricted'
  
  // Profile fields
  displayName?: string
  avatar?: string
  gender?: 'male' | 'female' | 'other'
  dateOfBirth?: string
  phoneVerified?: boolean
  emailVerified?: boolean
  
  // Account stats
  accountLevel?: 'bronze' | 'silver' | 'gold'
  totalOrders?: number
  totalSpent?: number
  points?: number
  
  // Loyalty program
  loyaltyPoints?: number
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  
  // Customer segmentation
  segment?: 'new' | 'regular' | 'loyal' | 'vip'
}

export interface TempUser {
  email: string
  firstName: string
  lastName: string
  phone: string
  passwordHash: string
  verificationCode: string
  expiresAt: string
  attempts: number
  createdAt: string
}

export interface Session {
  userId: string
  token: string
  expiresAt: string
  createdAt: string
  lastAccessAt: string
}

export interface ResetToken {
  email: string
  token: string
  expiresAt: string
  createdAt: string
}

export interface AuthData {
  users: User[]
  tempUsers: TempUser[]
  sessions: Session[]
  resetTokens: ResetToken[]
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data?: {
    email: string
    expiresAt: string
  }
}

export interface VerifyRequest {
  email: string
  code: string
}

export interface VerifyResponse {
  success: boolean
  message: string
  data?: {
    userId: string
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data?: {
    user: Omit<User, 'passwordHash'>
    token: string
    expiresAt: string
  }
}

export interface ResendCodeRequest {
  email: string
}

export interface MeResponse {
  success: boolean
  data?: Omit<User, 'passwordHash'>
}

export interface LogoutResponse {
  success: boolean
  message: string
}

export enum AuthErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  USER_EXISTS = 'USER_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INVALID_CODE = 'INVALID_CODE',
  CODE_EXPIRED = 'CODE_EXPIRED',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED'
}

export interface AuthError {
  type: AuthErrorType
  message: string
  field?: string
}

export interface JWTPayload {
  userId: string
  id: string
  email: string
  role: 'user' | 'admin'
  firstName: string
  lastName: string
  iat: number
  exp: number
}