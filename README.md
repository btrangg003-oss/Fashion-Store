# 👗 Fashion Store - E-commerce Platform

Modern, full-featured fashion e-commerce website with comprehensive authentication, shopping cart, and admin dashboard.

## ✨ Features

### Customer Features
- 🛍️ Product browsing with advanced search & filters
- 🛒 Shopping cart with real-time updates
- 💳 Multiple payment methods (COD, Bank Transfer, MoMo)
- 📧 Email verification system
- 👤 User profile management
- 📦 Order tracking
- ❤️ Wishlist
- 🎫 Voucher system
- 🔄 Return/refund requests

### Admin Features
- 📊 Analytics dashboard
- 📦 Product management
- 👥 Customer management
- 📋 Order management
- 🎯 Campaign management
- 🎫 Voucher management
- 📧 Email queue monitoring

## 🛠️ Tech Stack

### Frontend
- **Next.js 13.5.6** - React framework with SSR
- **TypeScript** - Type-safe JavaScript
- **Styled Components** - CSS-in-JS styling
- **Framer Motion** - Smooth animations
- **SWR** - Data fetching with caching

### Backend
- **MongoDB Atlas** - Cloud database
- **Cloudinary** - Image storage & optimization
- **JWT** - Authentication
- **Nodemailer** - Email service

## 📁 Project Structure

```
├── frontend/          # Next.js customer frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Next.js pages
│   │   ├── contexts/    # React contexts
│   │   ├── models/      # TypeScript types
│   │   ├── services/    # API services
│   │   └── lib/         # Utilities
│   └── public/          # Static assets
├── backend/           # Backend services (optional)
├── admin-dashboard/   # Admin interface (optional)
└── types/            # Shared TypeScript types
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone repository**
```bash
git clone <your-repo-url>
cd fashion-store
```

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Setup environment variables**

Create `frontend/.env.local`:
```env
MONGODB_URI=your_mongodb_atlas_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables
4. Deploy!

## 🔐 Environment Variables

### Required
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Optional
- `EMAIL_USER` - Gmail for sending emails
- `EMAIL_PASSWORD` - Gmail app password
- `NEXT_PUBLIC_SITE_URL` - Your site URL

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎨 Key Features Implementation

### Authentication
- Email verification with 4-digit codes
- JWT-based sessions
- Password hashing with bcrypt
- Rate limiting & security middleware

### Shopping Cart
- Real-time cart updates
- Persistent cart (localStorage)
- Voucher application
- Shipping calculation

### Payment Integration
- Cash on Delivery (COD)
- Bank Transfer
- MoMo wallet
- Payment verification

### Admin Dashboard
- Real-time analytics
- Product CRUD operations
- Order management
- Customer insights
- Campaign tracking

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is private and proprietary.

## 👥 Team

Developed by Fashion Store Team

## 📞 Support

For support, email support@fashionstore.com
