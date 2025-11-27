import type { NextApiRequest, NextApiResponse } from 'next';
import { TIER_BENEFITS } from '@/services/loyaltyService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.status(200).json(TIER_BENEFITS);
  } catch (error) {
    console.error('Error fetching tier benefits:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
