import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  phone?: string
  isVerified: boolean
  verificationCode?: string
  verificationCodeExpires?: Date
  role: 'user' | 'admin' | 'staff'
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  resetPasswordToken?: string
  resetPasswordExpires?: Date
}

export interface AuthData {
  users: User[]
  tempUsers: TempUser[]
}

export interface TempUser {
  _id?: ObjectId
  id: string
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  phone?: string
  verificationCode: string
  verificationCodeExpires: Date
  createdAt: Date
}