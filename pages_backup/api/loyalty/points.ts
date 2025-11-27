import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { getUserPoints, getTierByPoints, getNextTier } from '@/lib/loyaltyService';

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

    const userPoints = getUserPoints(decoded.userId);
    const currentTier = getTierByPoints(userPoints.lifetimePoints);
    const nextTierInfo = getNextTier(userPoints.lifetimePoints);

    const response = {
      userId: decoded.userId,
      currentPoints: userPoints.currentPoints,
      lifetimePoints: userPoints.lifetimePoints,
      tier: currentTier.id,
      tierName: currentTier.name,
      tierProgress: nextTierInfo 
        ? Math.round(((userPoints.lifetimePoints - currentTier.minPoints) / (nextTierInfo.tier.minPoints - currentTier.minPoints)) * 100)
        : 100,
      nextTierPoints: nextTierInfo?.pointsNeeded || 0,
      nextTierName: nextTierInfo?.tier.name || null
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
