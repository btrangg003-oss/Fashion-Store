# 🚀 Manual Deployment Guide

## Bước 1: Cài Git (nếu chưa có)

Download và cài Git từ: https://git-scm.com/downloads

## Bước 2: Mở Terminal/CMD và chạy các lệnh sau:

### 1. Initialize Git
```bash
git init
```

### 2. Add all files
```bash
git add .
```

### 3. Commit
```bash
git commit -m "feat: Complete Fashion Store - Production Ready

- Restructured to frontend/backend/admin-dashboard
- MongoDB Atlas integration
- Cloudinary for images
- All TypeScript errors fixed
- Ready for Vercel deployment"
```

### 4. Create GitHub Repository
1. Đi tới: https://github.com/new
2. Repository name: `fashion-store` (hoặc tên bạn muốn)
3. Description: "Modern Fashion E-commerce Platform"
4. Chọn Private hoặc Public
5. **KHÔNG** tick "Initialize with README"
6. Click "Create repository"

### 5. Push to GitHub
Thay `YOUR_USERNAME` và `YOUR_REPO` bằng thông tin của bạn:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Bước 3: Deploy lên Vercel

### 1. Đăng nhập Vercel
- Đi tới: https://vercel.com
- Đăng nhập bằng GitHub

### 2. Import Project
- Click "Add New" → "Project"
- Chọn repository vừa tạo
- Click "Import"

### 3. Configure Project
- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 4. Environment Variables
Click "Environment Variables" và thêm:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/FashionAIDB?retryWrites=true&w=majority

CLOUDINARY_CLOUD_NAME=your_cloud_name_from_dashboard
CLOUDINARY_API_KEY=383223934464156
CLOUDINARY_API_SECRET=WAn7VYViSZ_K06Le5V_5HIRVC6o

JWT_SECRET=your-super-secret-jwt-key-change-this

EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Fashion Store <noreply@fashionstore.com>

NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

**Lưu ý**: 
- `CLOUDINARY_CLOUD_NAME`: Lấy từ Cloudinary Dashboard
- `JWT_SECRET`: Tạo random string dài (ít nhất 32 ký tự)
- `EMAIL_USER` & `EMAIL_PASSWORD`: Gmail App Password

### 5. Deploy
- Click "Deploy"
- Đợi 2-3 phút
- ✅ Done!

## Bước 4: Kiểm tra

Sau khi deploy xong:
1. Click vào URL được tạo (vd: `https://your-project.vercel.app`)
2. Test các chức năng:
   - Đăng ký tài khoản
   - Xem sản phẩm
   - Thêm vào giỏ hàng
   - Checkout

## Troubleshooting

### Build Failed
- Check logs trong Vercel dashboard
- Verify environment variables đã đúng
- Ensure MongoDB Atlas IP whitelist: 0.0.0.0/0

### Can't connect to database
- Check MongoDB connection string
- Verify network access in MongoDB Atlas
- Check username/password

### Images not uploading
- Verify Cloudinary credentials
- Check API key permissions
- Ensure cloud name is correct

## 🎉 Hoàn thành!

Dự án của bạn đã live tại: `https://your-project.vercel.app`

Để update code sau này:
```bash
git add .
git commit -m "Update: your changes"
git push
```

Vercel sẽ tự động deploy lại!
