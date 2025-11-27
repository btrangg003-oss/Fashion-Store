# Fashion Store - Tài Liệu Dự Án

## Mô Tả Dự Án
Website thương mại điện tử bán thời trang cao cấp với đầy đủ tính năng quản lý sản phẩm, đơn hàng, khách hàng và hệ thống loyalty.

## Công Nghệ Sử Dụng

### Backend
- Node.js + Express
- MongoDB (Local)
- JWT Authentication
- Nodemailer + Postmark (Email)

### Frontend
- Next.js 14
- React 18
- TypeScript
- Styled Components
- Framer Motion

### Admin Dashboard
- Next.js 14
- React 18
- Recharts (Biểu đồ)
- ExcelJS (Export)

## Cấu Trúc Dự Án

```
tshop/
├── backend/              ← API Server
│   ├── src/
│   │   ├── routes/       ← API endpoints
│   │   ├── services/     ← Business logic
│   │   └── models/       ← Data models
│   ├── data/            ← Database (JSON/MongoDB)
│   └── uploads/         ← Uploaded files
│
├── frontend/            ← Customer Website
│   ├── src/
│   │   ├── components/  ← UI Components
│   │   ├── contexts/    ← React Context
│   │   ├── hooks/       ← Custom Hooks
│   │   └── styles/      ← CSS/Styled Components
│   └── public/          ← Static files
│
├── admin-dashboard/     ← Admin Panel
│   └── src/
│       ├── components/  ← Admin UI
│       └── pages/       ← Admin pages
│
└── docs/               ← Documentation
    ├── api/            ← API docs
    ├── database/       ← Database schema
    └── features/       ← Feature list
```

## Tính Năng Chính

### Khách Hàng
- ✅ Đăng ký / Đăng nhập (Email verification)
- ✅ Xem sản phẩm, tìm kiếm, lọc
- ✅ Giỏ hàng, thanh toán
- ✅ Theo dõi đơn hàng
- ✅ Đánh giá sản phẩm
- ✅ Hệ thống điểm thưởng (Loyalty)
- ✅ Voucher / Coupon
- ✅ Wishlist

### Admin
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý đơn hàng
- ✅ Quản lý khách hàng
- ✅ Quản lý kho (Inventory)
- ✅ Thống kê doanh thu
- ✅ Quản lý voucher
- ✅ Email marketing
- ✅ Chatbot AI

## Cài Đặt

### 1. Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
```

## Cấu Hình

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/fashion_store
JWT_SECRET=your-secret-key
EMAIL_FROM=your-email@gmail.com
POSTMARK_API_TOKEN=your-token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Đăng ký
- POST `/api/auth/login` - Đăng nhập
- POST `/api/auth/verify` - Xác thực email

### Products
- GET `/api/products` - Lấy danh sách sản phẩm
- GET `/api/products/:id` - Chi tiết sản phẩm
- POST `/api/admin/products` - Tạo sản phẩm (Admin)
- PUT `/api/admin/products/:id` - Cập nhật (Admin)
- DELETE `/api/admin/products/:id` - Xóa (Admin)

### Orders
- POST `/api/orders` - Tạo đơn hàng
- GET `/api/orders/user/:userId` - Đơn hàng của user
- GET `/api/admin/orders` - Tất cả đơn hàng (Admin)
- PUT `/api/admin/orders/:id/status` - Cập nhật trạng thái (Admin)

## Database Schema

### Users
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  phone: String,
  loyaltyPoints: Number,
  tier: String,
  createdAt: Date
}
```

### Products
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  comparePrice: Number,
  category: String,
  images: [String],
  stock: Number,
  variants: [Object],
  createdAt: Date
}
```

### Orders
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [Object],
  total: Number,
  status: String,
  shippingAddress: Object,
  paymentMethod: String,
  createdAt: Date
}
```

## Tác Giả
Fashion Store Team - 2025

## License
MIT
