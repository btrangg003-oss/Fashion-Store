# Technology Stack & Build System

## Core Framework
- **Next.js 14** with TypeScript - React framework with SSR/SSG capabilities
- **React 18** - UI library with hooks and context
- **TypeScript 5** - Type-safe JavaScript with strict mode enabled

## Styling & UI
- **Styled Components 6** - CSS-in-JS with theme support
- **Framer Motion 10** - Animation library for smooth transitions
- **React Icons 4** - Icon library for consistent iconography

## Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing with salt rounds
- **Custom middleware** - Rate limiting, input sanitization, CSRF protection

## Email Services
- **Nodemailer 6** - Primary email service with Gmail/SMTP support
- **Postmark 4** - Alternative email provider
- **Custom email queue** - Reliable delivery with retry mechanism

## Data & State Management
- **JSON file-based database** - Simple file storage (easily migrated to PostgreSQL)
- **SWR 2** - Data fetching with caching and revalidation
- **React Context** - Global state management for authentication

## Development Tools
- **ESLint** - Code linting with Next.js and TypeScript rules
- **Winston 3** - Logging system for monitoring and debugging
- **Custom test suite** - Authentication and API testing

## Common Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Testing
```bash
npm run test         # Run all tests
npm run test:auth    # Run authentication tests specifically
```

### Email & Setup
```bash
npm run setup:email  # Configure email service
npm run debug:email  # Open email testing interface
```

### Deployment
```bash
npm run deploy:vercel   # Deploy to Vercel
npm run deploy:netlify  # Deploy to Netlify
```

### Maintenance
```bash
npm run backup:data      # Backup user data
npm run cleanup:expired  # Clean expired verification codes
npm run health:check     # Health check endpoint
```

## Environment Configuration
- `.env.local` - Local development environment variables
- JWT secrets, email credentials, database paths
- Gmail app password setup required for email functionality

## Build Configuration
- **Next.js config** - Styled Components compiler, security headers, image optimization
- **TypeScript config** - Strict mode, path aliases (@/*), ES6+ target
- **Image domains** - Unsplash, placeholder images allowed