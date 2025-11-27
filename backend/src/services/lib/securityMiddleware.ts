import { NextApiRequest, NextApiResponse } from 'next'
import { checkRateLimit } from './auth'

// CSRF Token validation
export const validateCSRFToken = (req: NextApiRequest): boolean => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') return true
  
  const csrfToken = req.headers['x-csrf-token'] as string
  const sessionToken = req.cookies['csrf-token']
  
  // In production, implement proper CSRF token validation
  // For now, we'll skip this validation
  return true
}

// Input sanitization
export const sanitizeInput = (input: unknown): unknown => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/[<>]/g, '') // Remove < and > characters
      .substring(0, 1000) // Limit length
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: unknown = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Request logging for security monitoring
export const logSecurityEvent = (
  type: 'login_attempt' | 'registration' | 'verification' | 'rate_limit' | 'suspicious',
  req: NextApiRequest,
  details?: unknown
) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    url: req.url,
    method: req.method,
    details
  }
  
  // In production, send to logging service
  console.log('Security Event:', JSON.stringify(logEntry))
}

// Rate limiting middleware
export const withRateLimit = (
  maxAttempts: number = 10,
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  keyGenerator?: (req: NextApiRequest) => string
) => {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const key = keyGenerator ? keyGenerator(req) : 
        `${req.headers['x-forwarded-for'] || req.connection.remoteAddress}_${req.url}`
      
      const rateLimit = checkRateLimit(key, maxAttempts, windowMs)
      
      if (!rateLimit.allowed) {
        logSecurityEvent('rate_limit', req, { key, resetTime: rateLimit.resetTime })
        
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
          resetTime: rateLimit.resetTime
        })
      }
      
      return handler(req, res)
    }
  }
}

// Security headers middleware
export const withSecurityHeaders = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    
    return handler(req, res)
  }
}

// Input validation middleware
export const withInputSanitization = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeInput(req.body)
    }
    
    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeInput(req.query)
    }
    
    return handler(req, res)
  }
}

// Comprehensive security middleware
export const withSecurity = (
  options: {
    rateLimit?: { maxAttempts: number; windowMs: number; keyGenerator?: (req: NextApiRequest) => string }
    requireCSRF?: boolean
    sanitizeInput?: boolean
    securityHeaders?: boolean
    logRequests?: boolean
  } = {}
) => {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Log request if enabled
        if (options.logRequests) {
          logSecurityEvent('suspicious', req, { body: req.body, query: req.query })
        }
        
        // Apply security headers
        if (options.securityHeaders !== false) {
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('X-Frame-Options', 'DENY')
          res.setHeader('X-XSS-Protection', '1; mode=block')
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
          
          if (process.env.NODE_ENV === 'production') {
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
          }
        }
        
        // Validate CSRF token
        if (options.requireCSRF && !validateCSRFToken(req)) {
          return res.status(403).json({
            success: false,
            message: 'Invalid CSRF token',
            code: 'CSRF_INVALID'
          })
        }
        
        // Apply rate limiting
        if (options.rateLimit) {
          const { maxAttempts, windowMs, keyGenerator } = options.rateLimit
          const key = keyGenerator ? keyGenerator(req) : 
            `${req.headers['x-forwarded-for'] || req.connection.remoteAddress}_${req.url}`
          
          const rateLimit = checkRateLimit(key, maxAttempts, windowMs)
          
          if (!rateLimit.allowed) {
            logSecurityEvent('rate_limit', req, { key, resetTime: rateLimit.resetTime })
            
            return res.status(429).json({
              success: false,
              message: 'Too many requests. Please try again later.',
              code: 'RATE_LIMITED',
              resetTime: rateLimit.resetTime
            })
          }
        }
        
        // Sanitize inputs
        if (options.sanitizeInput !== false) {
          if (req.body) {
            req.body = sanitizeInput(req.body)
          }
          if (req.query) {
            req.query = sanitizeInput(req.query)
          }
        }
        
        return handler(req, res)
        
      } catch (error) {
        console.error('Security middleware error:', error)
        return res.status(500).json({
          success: false,
          message: 'Internal security error'
        })
      }
    }
  }
}

// Suspicious activity detection
export const detectSuspiciousActivity = (req: NextApiRequest): boolean => {
  const userAgent = req.headers['user-agent'] || ''
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  
  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i
  ]
  
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent('suspicious', req, { reason: 'bot_detected', userAgent })
    return true
  }
  
  // Check for suspicious request patterns
  if (req.body && typeof req.body === 'string' && req.body.length > 10000) {
    logSecurityEvent('suspicious', req, { reason: 'large_payload', size: req.body.length })
    return true
  }
  
  return false
}

// IP-based rate limiting
export const createIPRateLimit = (maxAttempts: number, windowMs: number) => {
  return (req: NextApiRequest) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    return `ip_${ip}`
  }
}

// Email-based rate limiting
export const createEmailRateLimit = (req: NextApiRequest) => {
  const email = req.body?.email || req.query?.email
  return email ? `email_${email}` : `ip_${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`
}