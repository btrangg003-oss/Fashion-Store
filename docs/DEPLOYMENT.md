# 🚀 Fashion Store Authentication System - Deployment Guide

## 📋 Pre-deployment Checklist

### ✅ Environment Variables
Ensure all required environment variables are set:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# Database
DB_PATH=./data/auth.json
```

### ✅ Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Use this password as `EMAIL_PASS`

### ✅ Security Configuration

1. **JWT Secret**: Generate a strong secret key
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **CORS Settings**: Configure allowed origins
3. **Rate Limiting**: Verify rate limits are appropriate for production
4. **HTTPS**: Ensure SSL/TLS is enabled

## 🔧 Deployment Steps

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add JWT_SECRET
vercel env add EMAIL_USER
vercel env add EMAIL_PASS
# ... add all other env vars
```

### 2. Netlify Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify
# Set environment variables in Netlify dashboard
```

### 3. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t fashion-store .
docker run -p 3000:3000 --env-file .env.production fashion-store
```

## 📧 Email Service Configuration

### Gmail Configuration
```javascript
// Recommended settings for production
const emailConfig = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // App password, not regular password
  },
  tls: {
    rejectUnauthorized: false
  }
}
```

### Alternative SMTP Providers

#### SendGrid
```bash
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun
```bash
EMAIL_SERVICE=mailgun
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASS=your-mailgun-password
```

#### AWS SES
```bash
EMAIL_SERVICE=ses
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-access-key
EMAIL_PASS=your-ses-secret-key
```

## 🗄️ Database Configuration

### File-based Database (Current)
```bash
# Ensure data directory exists and has proper permissions
mkdir -p data
chmod 755 data
```

### PostgreSQL Migration (Recommended for Production)
```sql
-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Create temp_users table
CREATE TABLE temp_users (
  email VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  verification_code VARCHAR(4) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_access_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_temp_users_email ON temp_users(email);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files to version control
- Use different secrets for different environments
- Rotate secrets regularly

### 2. Rate Limiting
```javascript
// Production rate limits
const rateLimits = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  register: { maxAttempts: 3, windowMs: 10 * 60 * 1000 }, // 3 attempts per 10 min
  verify: { maxAttempts: 10, windowMs: 15 * 60 * 1000 }, // 10 attempts per 15 min
  resend: { maxAttempts: 3, windowMs: 5 * 60 * 1000 } // 3 attempts per 5 min
}
```

### 3. HTTPS Configuration
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  }
}
```

## 📊 Monitoring & Logging

### 1. Error Tracking
```javascript
// Sentry integration
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

### 2. Analytics
```javascript
// Google Analytics
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Log authentication events
gtag('event', 'login', {
  method: 'email'
})
```

### 3. Health Checks
```javascript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  })
}
```

## 🧪 Testing in Production

### 1. Smoke Tests
```bash
# Test registration flow
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User","phone":"0123456789","password":"password123"}'

# Test login flow
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Email Testing
- Send test verification emails
- Check email delivery rates
- Monitor bounce rates

### 3. Performance Testing
- Load test authentication endpoints
- Monitor response times
- Check database performance

## 🔄 Backup & Recovery

### 1. Database Backup
```bash
# Backup auth data
cp data/auth.json backups/auth-$(date +%Y%m%d).json

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp data/auth.json "backups/auth-$DATE.json"
find backups/ -name "auth-*.json" -mtime +7 -delete
```

### 2. Recovery Procedures
1. Restore from backup
2. Verify data integrity
3. Test authentication flows
4. Monitor for issues

## 📈 Performance Optimization

### 1. Caching
```javascript
// Redis caching for rate limiting
const redis = require('redis')
const client = redis.createClient(process.env.REDIS_URL)
```

### 2. CDN Configuration
- Cache static assets
- Optimize images
- Enable compression

### 3. Database Optimization
- Add proper indexes
- Monitor query performance
- Implement connection pooling

## 🚨 Incident Response

### 1. Security Incidents
1. Identify the issue
2. Contain the threat
3. Assess the impact
4. Notify users if necessary
5. Implement fixes
6. Monitor for recurrence

### 2. Service Outages
1. Check health endpoints
2. Review error logs
3. Scale resources if needed
4. Communicate with users
5. Post-mortem analysis

## ✅ Post-Deployment Verification

- [ ] All environment variables set correctly
- [ ] Email service working
- [ ] Registration flow functional
- [ ] Login flow functional
- [ ] Email verification working
- [ ] Rate limiting active
- [ ] Security headers present
- [ ] HTTPS enabled
- [ ] Monitoring configured
- [ ] Backups scheduled

## 📞 Support & Maintenance

### Regular Tasks
- Monitor error rates
- Review security logs
- Update dependencies
- Rotate secrets
- Clean up expired data
- Performance monitoring

### Emergency Contacts
- Development team
- Infrastructure team
- Email service provider
- Domain registrar

---

**🎉 Congratulations! Your Fashion Store Authentication System is now ready for production!**