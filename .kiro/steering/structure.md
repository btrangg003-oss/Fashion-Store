# Project Structure & Organization

## Directory Layout

```
├── components/           # React components organized by feature
│   ├── Auth/            # Authentication components (LoginForm, RegisterForm, etc.)
│   ├── Layout/          # Layout components (Header, Footer, Layout)
│   ├── Home/            # Homepage components (Hero, FeaturedProducts, etc.)
│   ├── Products/        # Product-related components (ProductGrid, ProductDetail, etc.)
│   ├── Cart/            # Shopping cart components
│   ├── Checkout/        # Checkout flow components
│   ├── Admin/           # Admin interface components
│   └── Debug/           # Development/debugging components
├── pages/               # Next.js pages and API routes
│   ├── api/             # API endpoints
│   │   ├── auth/        # Authentication APIs (register, login, verify, etc.)
│   │   └── admin/       # Admin APIs (email-queue, database-status, etc.)
│   ├── auth/            # Authentication pages
│   └── [other pages]    # Product pages, cart, checkout, etc.
├── lib/                 # Core utilities and services
│   ├── auth.ts          # Authentication utilities
│   ├── database.ts      # Database operations
│   ├── emailService.ts  # Email service implementation
│   ├── validation.ts    # Input validation utilities
│   ├── securityMiddleware.ts # Security middleware
│   └── [other utilities] # Logger, error handler, etc.
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context provider
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # General utility functions
├── styles/              # Global styles and themes
├── data/                # JSON database files
├── tests/               # Test files
├── docs/                # Documentation
├── scripts/             # Build and setup scripts
└── logs/                # Application logs
```

## Component Organization

### Naming Conventions
- **Components**: PascalCase (e.g., `LoginForm.tsx`, `ProductGrid.tsx`)
- **Files**: camelCase for utilities (e.g., `emailService.ts`, `authMiddleware.ts`)
- **Directories**: PascalCase for component folders, camelCase for others

### Component Structure
- Each feature has its own directory under `components/`
- Related components grouped together (Auth, Products, Cart, etc.)
- Shared layout components in `Layout/` directory
- Admin and debug components separated from user-facing components

## API Structure

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/resend-verification` - Resend verification code

### Admin Routes
- `/api/admin/email-queue` - Email queue management
- `/api/admin/database-status` - Database inspection
- `/admin/auth-test` - Authentication testing interface

## Data Layer

### Database Files
- `data/auth.json` - User authentication data
- `data/orders.json` - Order data (if applicable)
- Backup files in `backups/` directory

### Service Layer
- `lib/database.ts` - Database operations abstraction
- `lib/userOperations.ts` - User-specific database operations
- `lib/ordersDatabase.ts` - Order-specific operations

## Configuration Files

### Root Level
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint rules
- `package.json` - Dependencies and scripts

### Environment
- `.env.local` - Local environment variables
- `.env` - Default environment template

## Import Patterns

### Path Aliases
- Use `@/` prefix for root-level imports
- Example: `import { AuthContext } from '@/contexts/AuthContext'`

### Import Organization
1. External libraries (React, Next.js, etc.)
2. Internal components and utilities
3. Type imports
4. Relative imports

## File Naming Patterns

### Components
- Feature-based naming: `LoginForm.tsx`, `ProductGrid.tsx`
- Index files for directory exports: `index.ts`

### Utilities
- Descriptive names: `emailService.ts`, `securityMiddleware.ts`
- Test files: `auth.test.js`, `email.test.js`

### Pages
- Follow Next.js conventions
- Dynamic routes: `[id].tsx`, `[...slug].tsx`
- API routes mirror the URL structure