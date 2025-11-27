# 🔧 Fashion Store Backend API

Backend API for Fashion Store e-commerce platform using Node.js, Express, MongoDB Atlas, and Cloudinary.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update:
```env
MONGODB_URI=your_mongodb_atlas_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

### 3. Run Development Server
```bash
npm run dev
```

Server will start at: http://localhost:4000

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection
│   │   └── cloudinary.js # Cloudinary setup
│   ├── models/          # Mongoose models
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Category.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   └── products.js
│   └── app.js           # Main application
├── .env                 # Environment variables
└── package.json
```

## 🔌 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

## 🗄️ Database Models

### User
- Email, password (hashed)
- Name, phone, avatar
- Email verification
- Role (customer/admin/staff)
- Tier (bronze/silver/gold/platinum/diamond)
- Segment (new/regular/loyal/vip)
- Stats (orders, spending, points)

### Product
- Name, description, slug
- Price, comparePrice, cost
- SKU, barcode, stock
- Category, tags, vendor
- Images (Cloudinary)
- Variants (size, color, etc.)
- SEO fields

### Order
- Order number (auto-generated)
- User, items, pricing
- Status, payment, shipping
- Tracking, inventory integration

### Category
- Name, slug, description
- Image (Cloudinary)
- Parent category support
- SEO fields

## ☁️ Cloudinary Integration

Images are automatically uploaded to Cloudinary with:
- Automatic optimization
- Responsive transformations
- CDN delivery
- Organized in folders

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication
- CORS protection
- Rate limiting (TODO)
- Input validation (TODO)
- SQL injection prevention (MongoDB)

## 📝 Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret
JWT_EXPIRE=7d

# Email
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=Fashion Store <noreply@example.com>

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Vercel/Netlify Functions
Backend can be deployed as serverless functions.

### Traditional Hosting
Deploy to Heroku, Railway, or any Node.js hosting.

## 🛠️ Development

### Add New Route
1. Create route file in `src/routes/`
2. Import in `src/app.js`
3. Add to API documentation

### Add New Model
1. Create model file in `src/models/`
2. Define schema with Mongoose
3. Add indexes and methods

## 📚 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cloudinary** - Image storage
- **nodemailer** - Email service
- **cors** - CORS middleware
- **dotenv** - Environment variables

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Private and Proprietary
