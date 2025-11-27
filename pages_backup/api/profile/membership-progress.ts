import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const TIERS = [
  { name: 'Bronze', minPoints: 0, benefits: ['Tích điểm cơ bản', 'Ưu đãi sinh nhật'] },
  { name: 'Silver', minPoints: 1000, benefits: ['Tích điểm x1.5', 'Miễn phí vận chuyển', 'Ưu đãi sinh nhật'] },
  { name: 'Gold', minPoints: 5000, benefits: ['Tích điểm x2', 'Miễn phí vận chuyển', 'Ưu đãi đặc biệt', 'Hỗ trợ ưu tiên'] },
  { name: 'Platinum', minPoints: 10000, benefits: ['Tích điểm x3', 'Miễn phí vận chuyển', 'Ưu đãi VIP', 'Hỗ trợ 24/7', 'Quà tặng độc quyền'] }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Read loyalty points from auth.json
    const loyaltyPath = path.join(process.cwd(), 'data', 'loyalty.json');
    const authPath = path.join(process.cwd(), 'data', 'auth.json');
    let currentPoints = 0;

    try {
      // Try loyalty.json first
      if (fs.existsSync(loyaltyPath)) {
        const loyaltyData = JSON.parse(fs.readFileSync(loyaltyPath, 'utf-8'));
        const userLoyalty = loyaltyData.accounts?.find((a: any) => a.userId === decoded.userId);
        currentPoints = userLoyalty?.points || 0;
      }

      // Fallback to auth.json if no loyalty data
      if (currentPoints === 0) {
        const authData = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
        const user = authData.users?.find((u: any) => u.id === decoded.userId);
        currentPoints = user?.loyaltyPoints || user?.points || 0;
      }
    } catch (error) {
      console.error('Error reading loyalty points:', error);
    }

    // Tìm tier hiện tại
    let currentTierIndex = 0;
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (currentPoints >= TIERS[i].minPoints) {
        currentTierIndex = i;
        break;
      }
    }

    const currentTier = TIERS[currentTierIndex];
    const nextTier = TIERS[currentTierIndex + 1] || null;

    let progress = 100;
    let pointsToNext = 0;
    let pointsInCurrentTier = 0;

    if (nextTier) {
      const tierRange = nextTier.minPoints - currentTier.minPoints;
      pointsInCurrentTier = currentPoints - currentTier.minPoints;
      progress = (pointsInCurrentTier / tierRange) * 100;
      pointsToNext = nextTier.minPoints - currentPoints;
    }

    return res.status(200).json({
      currentTier: {
        name: currentTier.name,
        minPoints: currentTier.minPoints,
        benefits: currentTier.benefits
      },
      nextTier: nextTier ? {
        name: nextTier.name,
        minPoints: nextTier.minPoints,
        benefits: nextTier.benefits
      } : null,
      currentPoints,
      pointsToNext,
      progress: Math.min(progress, 100),
      allTiers: TIERS
    });
  } catch (error) {
    console.error('Error fetching membership progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
