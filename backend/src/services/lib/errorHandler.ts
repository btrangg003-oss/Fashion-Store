import { NextApiRequest, NextApiResponse } from 'next'

// Error types
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EMAIL_ERROR = 'EMAIL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: any

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error messages in Vietnamese
export const ErrorMessages: Record<ErrorType, Record<string, string>> = {
  [ErrorType.VALIDATION_ERROR]: {
    default: 'Thông tin không hợp lệ',
    email: 'Email không hợp lệ',
    password: 'Mật khẩu không đúng định dạng',
    required: 'Thông tin bắt buộc không được để trống',
    phone: 'Số điện thoại không hợp lệ'
  },
  [ErrorType.AUTHENTICATION_ERROR]: {
    default: 'Xác thực thất bại',
    invalid_credentials: 'Email hoặc mật khẩu không đúng',
    token_expired: 'Phiên đăng nhập đã hết hạn',
    token_invalid: 'Phiên đăng nhập không hợp lệ',
    account_not_verified: 'Tài khoản chưa được xác thực email'
  },
  [ErrorType.AUTHORIZATION_ERROR]: {
    default: 'Bạn không có quyền truy cập',
    insufficient_permissions: 'Không đủ quyền để thực hiện thao tác này'
  },
  [ErrorType.NOT_FOUND_ERROR]: {
    default: 'Không tìm thấy thông tin',
    user_not_found: 'Người dùng không tồn tại',
    resource_not_found: 'Tài nguyên không tồn tại'
  },
  [ErrorType.RATE_LIMIT_ERROR]: {
    default: 'Quá nhiều yêu cầu. Vui lòng thử lại sau',
    login_attempts: 'Quá nhiều lần đăng nhập thất bại',
    registration_attempts: 'Quá nhiều lần đăng ký'
  },
  [ErrorType.DATABASE_ERROR]: {
    default: 'Lỗi cơ sở dữ liệu',
    connection_failed: 'Không thể kết nối cơ sở dữ liệu',
    query_failed: 'Truy vấn thất bại'
  },
  [ErrorType.EMAIL_ERROR]: {
    default: 'Lỗi gửi email',
    send_failed: 'Không thể gửi email',
    template_error: 'Lỗi template email'
  },
  [ErrorType.NETWORK_ERROR]: {
    default: 'Lỗi kết nối mạng',
    timeout: 'Hết thời gian chờ',
    connection_refused: 'Kết nối bị từ chối'
  },
  [ErrorType.INTERNAL_ERROR]: {
    default: 'Lỗi hệ thống nội bộ',
    unexpected: 'Lỗi không mong muốn xảy ra'
  }
}

// Get user-friendly error message
export const getErrorMessage = (error: AppError | Error, subType?: string): string => {
  if (error instanceof AppError) {
    const messages = ErrorMessages[error.type] as Record<string, string>
    if (subType && messages[subType]) {
      return messages[subType]
    }
    return messages.default
  }
  
  // Handle common JavaScript errors
  if (error.name === 'ValidationError') {
    return ErrorMessages[ErrorType.VALIDATION_ERROR].default
  }
  
  if (error.name === 'UnauthorizedError') {
    return ErrorMessages[ErrorType.AUTHENTICATION_ERROR].default
  }
  
  return ErrorMessages[ErrorType.INTERNAL_ERROR].default
}

// Log error for monitoring
export const logError = (error: Error, context?: any) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    type: error instanceof AppError ? error.type : 'UNKNOWN',
    context
  }
  
  // In production, send to logging service (e.g., Sentry, LogRocket)
  console.error('Application Error:', JSON.stringify(errorLog, null, 2))
  
  // You can add external logging service here
  // Example: Sentry.captureException(error, { extra: context })
}

// API Error handler middleware
export const withErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      handleApiError(error, req, res)
    }
  }
}

// Handle API errors
export const handleApiError = (error: unknown, req: NextApiRequest, res: NextApiResponse) => {
  // Log the error
  logError(error as Error, {
    url: req.url,
    method: req.method,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  })

  // Handle different error types
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: getErrorMessage(error),
      code: error.type,
      details: process.env.NODE_ENV === 'development' ? error.details : undefined
    })
  }

  // Handle validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: getErrorMessage(error),
      code: ErrorType.VALIDATION_ERROR
    })
  }

  // Handle JWT errors
  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: ErrorMessages[ErrorType.AUTHENTICATION_ERROR].token_invalid,
      code: ErrorType.AUTHENTICATION_ERROR
    })
  }

  if (error instanceof Error && error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: ErrorMessages[ErrorType.AUTHENTICATION_ERROR].token_expired,
      code: ErrorType.AUTHENTICATION_ERROR
    })
  }

  // Handle unknown errors
  const message = process.env.NODE_ENV === 'development' 
    ? (error as Error).message 
    : ErrorMessages[ErrorType.INTERNAL_ERROR].default

  return res.status(500).json({
    success: false,
    message,
    code: ErrorType.INTERNAL_ERROR,
    stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
  })
}

// Retry mechanism for transient errors
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry for certain error types
      if (error instanceof AppError && !isRetryableError(error)) {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  throw lastError!
}

// Check if error is retryable
const isRetryableError = (error: AppError): boolean => {
  const retryableTypes = [
    ErrorType.NETWORK_ERROR,
    ErrorType.DATABASE_ERROR,
    ErrorType.EMAIL_ERROR
  ]
  
  return retryableTypes.includes(error.type)
}

// Create specific error types
export const createValidationError = (message: string, details?: any) => 
  new AppError(message, ErrorType.VALIDATION_ERROR, 400, true, details)

export const createAuthenticationError = (message: string, details?: any) => 
  new AppError(message, ErrorType.AUTHENTICATION_ERROR, 401, true, details)

export const createAuthorizationError = (message: string, details?: any) => 
  new AppError(message, ErrorType.AUTHORIZATION_ERROR, 403, true, details)

export const createNotFoundError = (message: string, details?: any) => 
  new AppError(message, ErrorType.NOT_FOUND_ERROR, 404, true, details)

export const createRateLimitError = (message: string, details?: any) => 
  new AppError(message, ErrorType.RATE_LIMIT_ERROR, 429, true, details)

export const createDatabaseError = (message: string, details?: any) => 
  new AppError(message, ErrorType.DATABASE_ERROR, 500, true, details)

export const createEmailError = (message: string, details?: any) => 
  new AppError(message, ErrorType.EMAIL_ERROR, 500, true, details)

export const createNetworkError = (message: string, details?: any) => 
  new AppError(message, ErrorType.NETWORK_ERROR, 500, true, details)

export const createInternalError = (message: string, details?: any) => 
  new AppError(message, ErrorType.INTERNAL_ERROR, 500, false, details)