@echo off
echo.
echo 🚀 Fashion Store - Deployment Script
echo ======================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git is not installed. Please install Git first.
    echo    Download from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Initialize git if not already done
if not exist .git (
    echo 📦 Initializing Git repository...
    git init
    echo ✅ Git initialized
) else (
    echo ✅ Git repository already exists
)

echo.
echo 📝 Adding files to Git...
git add .

echo.
echo 💾 Committing changes...
git commit -m "feat: Complete Fashion Store with MongoDB Atlas & Cloudinary - Restructured project - Updated 304 files - Ready for deployment"

echo.
echo ✅ Files committed successfully!
echo.
echo 📤 Next steps:
echo 1. Create a new repository on GitHub: https://github.com/new
echo 2. Run these commands (replace YOUR_USERNAME and YOUR_REPO):
echo.
echo    git branch -M main
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git push -u origin main
echo.
echo 3. Then deploy to Vercel: https://vercel.com/new
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
echo.
pause
