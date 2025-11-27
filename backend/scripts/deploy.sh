#!/bin/bash

# Fashion Store - Production Deployment Script
# Usage: ./scripts/deploy.sh

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run as root${NC}"
    exit 1
fi

# Step 1: Pull latest code
echo -e "\n${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
}

# Step 2: Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install || {
    echo -e "${RED}❌ npm install failed${NC}"
    exit 1
}

# Step 3: Build
echo -e "\n${YELLOW}🔨 Building application...${NC}"
npm run build || {
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
}

# Step 4: Restart PM2
echo -e "\n${YELLOW}🔄 Restarting PM2...${NC}"
pm2 restart fashionstore || {
    echo -e "${YELLOW}⚠️  PM2 restart failed, trying to start...${NC}"
    pm2 start ecosystem.config.js
}

# Step 5: Save PM2 config
pm2 save

# Step 6: Reload Nginx
echo -e "\n${YELLOW}🔄 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx || {
    echo -e "${RED}❌ Nginx reload failed${NC}"
    exit 1
}

# Step 7: Check status
echo -e "\n${YELLOW}📊 Checking status...${NC}"
pm2 status

# Success
echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Website: https://fashionstore.wuaze.com${NC}"

# Show logs
echo -e "\n${YELLOW}📝 Recent logs:${NC}"
pm2 logs fashionstore --lines 20 --nostream
