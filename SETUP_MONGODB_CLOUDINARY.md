# 🚀 Setup MongoDB Atlas & Cloudinary

## 📦 MongoDB Atlas Setup (5 phút)

### Bước 1: Tạo tài khoản
1. Truy cập: https://www.mongodb.com/cloud/atlas/register
2. Đăng ký FREE (không cần thẻ tín dụng)
3. Chọn **M0 FREE** tier

### Bước 2: Tạo Cluster
1. Chọn **AWS** hoặc **Google Cloud**
2. Region: **Singapore** (gần VN nhất)
3. Cluster Name: `Cluster0` (mặc định)
4. Click **Create Cluster** (đợi 3-5 phút)

### Bước 3: Tạo Database User
1. Vào **Database Access** (menu bên trái)
2. Click **Add New Database User**
3. Username: `fashionstore_user`
4. Password: **Auto-generate** (copy lại)
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### Bước 4: Whitelist IP
1. Vào **Network Access**
2. Click **Add IP Address**
3. Chọn **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Bước 5: Lấy Connection String
1. Vào **Database** → Click **Connect**
2. Chọn **Connect your application**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy connection string:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Thay `<username>` và `<password>` bằng thông tin ở Bước 3
6. Thêm database name: `/FashionAIDB` trước dấu `?`

**Ví dụ:**
```
mongodb+srv://fashionstore_user:MyP@ssw0rd123@cluster0.abc123.mongodb.net/FashionAIDB?retryWrites=true&w=majority
```

---

## ☁️ Cloudinary Setup (3 phút)

### Bước 1: Tạo tài khoản
1. Truy cập: https://cloudinary.com/users/register/free
2. Đăng ký FREE (không cần thẻ tín dụng)
3. Verify email

### Bước 2: Lấy thông tin
1. Vào **Dashboard**: https://cloudinary.com/console
2. Copy 3 thông tin:
   - **Cloud Name**: `dxxxxxx`
   - **API Key**: `123456789012345`
   - **API Secret**: `abcdefghijklmnopqrstuvwxyz`

### Bước 3: Tạo Upload Preset (Optional)
1. Vào **Settings** → **Upload**
2. Scroll xuống **Upload presets**
3. Click **Add upload preset**
4. Preset name: `fashion_store`
5. Signing Mode: **Unsigned**
6. Folder: `fashion-store`
7. Click **Save**

---

## 🔧 Update Backend .env

Sau khi có thông tin, update file `backend/.env`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://fashionstore_user:YourPassword@cluster0.xxxxx.mongodb.net/FashionAIDB?retryWrites=true&w=majority

# Cloudinary
CLOUDINARY_CLOUD_NAME=dxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

---

## ✅ Test Connection

```bash
cd backend
npm run dev
```

Nếu thành công, bạn sẽ thấy:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Cloudinary Connected: dxxxxxx
🚀 Server running on http://localhost:4000
```

---

## 📝 Notes

- **MongoDB FREE tier**: 512MB storage, đủ cho development
- **Cloudinary FREE tier**: 25GB storage, 25GB bandwidth/month
- Cả 2 đều không cần thẻ tín dụng
- Data được lưu trên cloud, không mất khi restart máy
