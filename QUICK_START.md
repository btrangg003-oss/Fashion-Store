# ⚡ QUICK START GUIDE

## 🚀 Chạy dự án trong 5 phút!

### 1️⃣ Frontend (Customer Site)

```bash
cd frontend
npm install
npm run dev
```

Mở: http://localhost:3000

### 2️⃣ Backend (API Server)

```bash
cd backend
npm install
npm run dev
```

API: http://localhost:4000

### 3️⃣ Admin Dashboard (Optional)

```bash
cd admin-dashboard
npm install
npm run dev
```

Admin: http://localhost:3001

---

## 🔧 Cấu hình nhanh

### Frontend (.env.local)
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/FashionAIDB
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=WAn7VYViSZ_K06Le5V_5HIRVC6o
JWT_SECRET=your-secret-key
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/FashionAIDB
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=WAn7VYViSZ_K06Le5V_5HIRVC6o
JWT_SECRET=your-secret-key
PORT=4000
```

**Lưu ý**: Thay `your_cloud_name` bằng Cloud Name từ Cloudinary Dashboard

---

## 📦 Deploy lên Vercel

### Cách 1: Tự động (Khuyến nghị)
```bash
# Chạy script
.\deploy.bat

# Hoặc trên Mac/Linux
chmod +x deploy.sh
./deploy.sh
```

### Cách 2: Thủ công
Xem file: `DEPLOY_MANUAL.md`

---

## ✅ Checklist

- [ ] Git đã cài (https://git-scm.com)
- [ ] Node.js đã cài (v18+)
- [ ] MongoDB Atlas account
- [ ] Cloudinary account
- [ ] Gmail App Password (cho email)
- [ ] GitHub account
- [ ] Vercel account

---

## 🆘 Gặp vấn đề?

### Build failed trên Windows?
→ Không sao! Deploy trên Vercel sẽ work ✅

### MongoDB connection error?
→ Check IP whitelist: 0.0.0.0/0 trong MongoDB Atlas

### Images không upload?
→ Verify Cloudinary Cloud Name

### Email không gửi?
→ Setup Gmail App Password

---

## 📚 Tài liệu đầy đủ

- `README.md` - Overview
- `DEPLOYMENT.md` - Chi tiết deployment
- `PROJECT_COMPLETE.md` - Tổng kết dự án
- `backend/README.md` - API docs

---

**Chúc bạn thành công! 🎉**
