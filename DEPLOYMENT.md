# 🚀 Deployment Guide - Fashion Store

## Prerequisites
- MongoDB Atlas account
- Cloudinary account  
- Vercel account
- GitHub repository

## 1. MongoDB Atlas Setup

**Connection String:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/FashionAIDB?retryWrites=true&w=majority
```

**Steps:**
1. Database already created: `FashionAIDB`
2. User already created: `trongg003_db_user`
3. Network Access: Allow from anywhere (0.0.0.0/0) for Vercel

## 2. Cloudinary Setup

**Credentials:**
- API Key: `383223934464156`
- API Secret: `WAn7VYViSZ_K06Le5V_5HIRVC6o`
- Cloud Name: Get from Cloudinary dashboard

**Usage:**
- Product images upload
- User avatars
- Campaign banners

## 3. Vercel Deployment

### A. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Fashion Store"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### B. Connect to Vercel
1. Go to https://vercel.com
2. Import your GitHub repository
3. Select `frontend` as root directory
4. Framework Preset: Next.js

### C. Environment Variables (Add in Vercel Dashboard)

**Required:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxYBI@cgodb.net/FashionAIDB?retryWrites=true&w=majority

CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=383223934464156
CLOUDINARY_API_SECRET=WAn7VYViSZ_K06Le5V_5HIRVC6o

JWT_SECRET=generate-a-strong-random-secret-here

EMAIL_USER=your-gmail@gmail.comg
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Fashion Store <noreply@fashionstore.com>

NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```
### D. Deploy
```bash
vercel --prod
```

## 4. Post-Deployment

### Update CORS Origins
In backend code, update allowed origins to include your Vercel domain.

### Test Features
- [ ] User registration & email verification
- [ ] Product browsing & search
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Admin dashboard
- [ ] Image uploads (Cloudinary)

## 5. Custom Domain (Optional)
1. Add custom domain in Vercel dashboard
2. Update DNS records
3. Update environment variables with new domain

## Troubleshooting

### Build Fails
- Check Next.js version compatibility
- Verify all dependencies installed
- Check TypeScript errors

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions

### Image Upload Issues
- Verify Cloudinary credentials
- Check API key permissions
- Ensure cloud name is correct

## Support
For issues, check logs in Vercel dashboard under Deployments > Function Logs
git add .
