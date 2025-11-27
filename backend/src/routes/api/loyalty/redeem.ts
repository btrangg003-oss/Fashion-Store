import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { deductPoints, redeemPoints } from '@/services/loyaltyService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { points, rewardType, rewardId } = req.body;

    if (!points || !rewardType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate reward value
    const rewardResult = redeemPoints(points, rewardType);
    
    if (!rewardResult.success) {
      return res.status(400).json({ message: 'Invalid reward type' });
    }

    // Deduct points
    const transaction = deductPoints(
      decoded.userId,
      points,
      `Đổi ${rewardType === 'discount' ? 'mã giảm giá' : 'phần quà'} ${rewardResult.value.toLocaleString('vi-VN')} VNĐ`,
      rewardId
    );

    if (!transaction) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    res.status(200).json({
      success: true,
      transaction,
      reward: {
        type: rewardType,
        value: rewardResult.value,
        pointsUsed: rewardResult.pointsUsed
      }
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
