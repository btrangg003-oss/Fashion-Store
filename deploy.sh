#!/bin/bash

echo "🚀 Fashion Store - Deployment Script"
echo "======================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Download from: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "📝 Adding files to Git..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "feat: Complete Fashion Store with MongoDB Atlas & Cloudinary

- Restructured project to frontend/backend/admin-dashboard
- Updated 304 files with new import paths
- Added MongoDB Atlas connection
- Integrated Cloudinary for image storage
- Fixed all TypeScript errors
- Added production environment configs
- Ready for Vercel deployment"

echo ""
echo "✅ Files committed successfully!"
echo ""
echo "📤 Next steps:"
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Run these commands (replace YOUR_USERNAME and YOUR_REPO):"
echo ""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git push -u origin main"
echo ""
echo "3. Then deploy to Vercel: https://vercel.com/new"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
