import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.userId;

    // Read loyalty.json
    const loyaltyPath = path.join(process.cwd(), 'data', 'loyalty.json');
    const loyaltyData = JSON.parse(fs.readFileSync(loyaltyPath, 'utf-8'));

    // Find user's loyalty account
    const account = loyaltyData.accounts?.find((a: any) => a.userId === userId);

    if (!account) {
      // Create new account if not exists
      const newAccount = {
        userId,
        points: 0,
        tier: 'Bronze',
        totalEarned: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        transactions: []
      };

      if (!loyaltyData.accounts) {
        loyaltyData.accounts = [];
      }
      loyaltyData.accounts.push(newAccount);
      fs.writeFileSync(loyaltyPath, JSON.stringify(loyaltyData, null, 2));

      return res.status(200).json(newAccount);
    }

    return res.status(200).json(account);
  } catch (error: any) {
    console.error('Loyalty points API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
