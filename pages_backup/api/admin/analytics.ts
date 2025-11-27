import type { NextApiRequest, NextApiResponse } from 'next';
import { getAnalytics } from '@/lib/analyticsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { period = 'month' } = req.query;
    const data = await getAnalytics(period as string);
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Analytics API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
