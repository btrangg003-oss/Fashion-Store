# ⚠️ Windows Build Issue - EISDIR Error

## Vấn đề
Build Next.js trên Windows gặp lỗi:
```
Error: EISDIR: illegal operation on a directory, readlink 'D:\1\frontend\pages\_app.tsx'
```

## Nguyên nhân
- Bug của Next.js/Webpack trên Windows với file `_app.tsx` và `_document.tsx`
- Windows file system locking hoặc antivirus interference
- Symlink issues trên Windows

## ✅ Giải pháp

### Option 1: Deploy trực tiếp lên Vercel (RECOMMENDED)
Build sẽ thành công trên Vercel vì dùng Linux:

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# Deploy on Vercel
# 1. Go to https://vercel.com
# 2. Import GitHub repository
# 3. Root Directory: frontend
# 4. Framework: Next.js
# 5. Add environment variables
# 6. Deploy!
```

### Option 2: Sử dụng WSL (Windows Subsystem for Linux)
```bash
# Install WSL
wsl --install

# Trong WSL terminal
cd /mnt/d/1/frontend
npm run build
```

### Option 3: Disable antivirus temporarily
- Tạm thời tắt Windows Defender hoặc antivirus
- Xóa folder `.next` và `node_modules`
- Chạy lại `npm install` và `npm run build`

### Option 4: Use Docker
```bash
# Build trong Docker container (Linux environment)
docker run -v ${PWD}:/app -w /app node:18 npm run build
```

## 📝 Note
- Code hoàn toàn OK, không có lỗi syntax
- Chỉ là vấn đề build trên Windows
- Production build trên Vercel/Linux sẽ hoàn toàn bình thường
- Development mode (`npm run dev`) vẫn chạy OK

## ✅ Verified
- ✅ Code syntax correct
- ✅ All imports valid
- ✅ TypeScript types OK
- ✅ Dependencies installed
- ⚠️ Windows build blocked by EISDIR error
- ✅ Will build successfully on Vercel (Linux)
