import { RegisterRequest, AuthErrorType } from '../models/auth'

export interface ValidationError {
  field: string
  message: string
  type: AuthErrorType
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Individual field validators
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || !email.trim()) {
    return {
      field: 'email',
      message: 'Email là bắt buộc',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return {
      field: 'email',
      message: 'Email không hợp lệ',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  return null
}

export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return {
      field: 'password',
      message: 'Mật khẩu là bắt buộc',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  if (password.length < 6) {
    return {
      field: 'password',
      message: 'Mật khẩu phải có ít nhất 6 ký tự',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  return null
}

export const validateName = (name: string, fieldName: string): ValidationError | null => {
  if (!name || !name.trim()) {
    return {
      field: fieldName,
      message: `${fieldName === 'firstName' ? 'Họ' : 'Tên'} là bắt buộc`,
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  if (name.trim().length < 2) {
    return {
      field: fieldName,
      message: `${fieldName === 'firstName' ? 'Họ' : 'Tên'} phải có ít nhất 2 ký tự`,
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  return null
}

export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone || !phone.trim()) {
    return {
      field: 'phone',
      message: 'Số điện thoại là bắt buộc',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  const phoneRegex = /^[0-9]{10,11}$/
  const cleanPhone = phone.replace(/\s/g, '')
  
  if (!phoneRegex.test(cleanPhone)) {
    return {
      field: 'phone',
      message: 'Số điện thoại không hợp lệ (10-11 chữ số)',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  return null
}

export const validateVerificationCode = (code: string): ValidationError | null => {
  if (!code || !code.trim()) {
    return {
      field: 'code',
      message: 'Mã xác thực là bắt buộc',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  const codeRegex = /^[0-9]{4}$/
  if (!codeRegex.test(code.trim())) {
    return {
      field: 'code',
      message: 'Mã xác thực phải là 4 chữ số',
      type: AuthErrorType.VALIDATION_ERROR
    }
  }
  
  return null
}

// Comprehensive registration validation
export const validateRegistrationData = (data: RegisterRequest): ValidationResult => {
  const errors: ValidationError[] = []
  
  // Validate first name
  const firstNameError = validateName(data.firstName, 'firstName')
  if (firstNameError) errors.push(firstNameError)
  
  // Validate last name
  const lastNameError = validateName(data.lastName, 'lastName')
  if (lastNameError) errors.push(lastNameError)
  
  // Validate email
  const emailError = validateEmail(data.email)
  if (emailError) errors.push(emailError)
  
  // Validate phone
  const phoneError = validatePhone(data.phone)
  if (phoneError) errors.push(phoneError)
  
  // Validate password
  const passwordError = validatePassword(data.password)
  if (passwordError) errors.push(passwordError)
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Login validation
export const validateLoginData = (email: string, password: string): ValidationResult => {
  const errors: ValidationError[] = []
  
  const emailError = validateEmail(email)
  if (emailError) errors.push(emailError)
  
  if (!password) {
    errors.push({
      field: 'password',
      message: 'Mật khẩu là bắt buộc',
      type: AuthErrorType.VALIDATION_ERROR
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Verification code validation
export const validateVerificationData = (email: string, code: string): ValidationResult => {
  const errors: ValidationError[] = []
  
  const emailError = validateEmail(email)
  if (emailError) errors.push(emailError)
  
  const codeError = validateVerificationCode(code)
  if (codeError) errors.push(codeError)
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Sanitize user input
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, '') // Remove < and > characters
    .substring(0, 255) // Limit length
}

export const sanitizeRegistrationData = (data: RegisterRequest): RegisterRequest => {
  return {
    firstName: sanitizeString(data.firstName),
    lastName: sanitizeString(data.lastName),
    email: sanitizeString(data.email).toLowerCase(),
    phone: sanitizeString(data.phone).replace(/\D/g, ''), // Keep only digits
    password: data.password // Don't sanitize password, just validate
  }
}