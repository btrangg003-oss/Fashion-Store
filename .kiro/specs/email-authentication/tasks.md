# Implementation Plan - Email Authentication System

## Task Overview

Convert the email authentication design into a series of implementation tasks that build incrementally from basic infrastructure to complete user flows. Each task focuses on specific coding activities that can be executed by a development agent.

## Implementation Tasks

- [x] 1. Setup Authentication Infrastructure



  - Install required dependencies (bcryptjs, jsonwebtoken, nodemailer)
  - Create environment variables configuration
  - Setup data storage structure and utilities
  - Create authentication middleware and utilities




  - _Requirements: 4.1, 4.2, 5.5, 7.4_

- [ ] 2. Implement User Data Models and Storage
  - Create User, TempUser, and Session TypeScript interfaces
  - Implement JSON file-based database operations (CRUD)


  - Create password hashing and verification utilities
  - Write data validation functions for user inputs
  - Implement cleanup utilities for expired data
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.2_

- [x] 3. Build Email Service Integration




  - Configure Nodemailer with Gmail/SMTP settings
  - Create email template system with Vietnamese content
  - Implement verification code generation (4-digit random)
  - Build email sending functions with error handling
  - Create email template rendering with dynamic content




  - Add email queue system for reliable delivery


  - Create email testing utilities and admin endpoints

  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Create Registration API Endpoint
  - Implement POST /api/auth/register endpoint
  - Add input validation for registration data
  - Check for existing email addresses in database
  - Generate and store temporary user with verification code
  - Send verification email with 4-digit code
  - Return appropriate success/error responses
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Build Email Verification API
  - Implement POST /api/auth/verify endpoint
  - Validate verification code against stored temp user
  - Check code expiration (10 minutes timeout)
  - Handle attempt counting and rate limiting
  - Create permanent user account on successful verification
  - Clean up temporary user data after verification
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [ ] 6. Create Resend Verification Code API
  - Implement POST /api/auth/resend-code endpoint
  - Generate new 4-digit verification code
  - Update temporary user with new code and expiration
  - Send new verification email
  - Implement rate limiting for resend requests
  - _Requirements: 2.4, 2.5_

- [ ] 7. Implement Login Authentication API
  - Create POST /api/auth/login endpoint
  - Validate user credentials against database
  - Check if user account is email-verified
  - Generate JWT token for authenticated users


  - Handle various login error scenarios
  - Update user's last login timestamp
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Build Session Management APIs
  - Implement GET /api/auth/me endpoint for user profile
  - Create POST /api/auth/logout endpoint
  - Build JWT token validation middleware
  - Implement token refresh mechanism
  - Add session cleanup for expired tokens
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Create Registration Form Component
  - Build RegisterForm React component with form validation
  - Implement real-time input validation with error display
  - Add loading states during registration process
  - Handle API responses and error messages
  - Create form submission with proper error handling
  - Add terms and conditions checkbox validation
  - _Requirements: 1.1, 1.2, 1.3, 8.1, 8.2, 8.4_

- [ ] 10. Build Email Verification Component
  - Create EmailVerification React component
  - Implement 4-digit code input with auto-focus
  - Add countdown timer for code expiration (10 minutes)
  - Build resend code functionality with rate limiting
  - Handle verification success/error states
  - Add loading states and user feedback
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.1, 8.2, 8.3_

- [ ] 11. Update Login Form Component
  - Modify existing LoginForm to use new authentication API
  - Add proper error handling for different login scenarios
  - Implement "account not verified" flow with resend option
  - Add loading states and user feedback
  - Handle JWT token storage in cookies/localStorage
  - Add "remember me" functionality
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3_

- [ ] 12. Implement Authentication Context
  - Create React Context for authentication state management
  - Build useAuth hook for components to access auth state
  - Implement automatic token validation on app load
  - Add user profile data management
  - Handle token expiration and automatic logout
  - Create protected route wrapper component
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 13. Add Security and Rate Limiting
  - Implement rate limiting for login attempts
  - Add rate limiting for verification code requests
  - Create input sanitization for all user inputs
  - Add CSRF protection for authentication endpoints
  - Implement secure cookie settings for tokens
  - Add request logging for security monitoring
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 14. Create Authentication Pages
  - Build /auth/verify/[email] page for email verification
  - Update existing register and login pages to use new components
  - Add proper SEO meta tags for authentication pages
  - Implement proper routing and redirects
  - Add loading and error states for all pages
  - Create responsive design for mobile devices
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [ ] 15. Update Profile and Protected Routes
  - Modify profile page to use authentication context
  - Add authentication checks to protected routes
  - Implement automatic redirect to login for unauthenticated users
  - Update header component to show authenticated user state
  - Add logout functionality to user menu
  - Update cart and checkout flows to require authentication
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ] 16. Add Comprehensive Error Handling
  - Create centralized error handling for authentication flows
  - Implement user-friendly error messages in Vietnamese
  - Add error logging for debugging and monitoring
  - Create fallback UI for authentication failures
  - Add retry mechanisms for transient errors
  - Implement proper error boundaries for auth components
  - _Requirements: 8.2, 8.3, 7.4_

- [ ] 17. Write Authentication Tests
  - Create unit tests for password hashing utilities
  - Write tests for JWT token generation and validation
  - Add integration tests for all authentication API endpoints
  - Create tests for email verification flow
  - Write tests for rate limiting functionality
  - Add tests for authentication context and hooks
  - _Requirements: All requirements validation_

- [ ] 18. Setup Email Configuration and Deployment
  - Configure Gmail App Password or SMTP credentials
  - Set up environment variables for production
  - Test email delivery in staging environment
  - Configure proper CORS settings for authentication
  - Add database backup and recovery procedures
  - Create deployment checklist for authentication system
  - _Requirements: 5.4, 5.5, 4.2_