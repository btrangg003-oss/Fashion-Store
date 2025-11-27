import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/authMiddleware';

// This is a mock data response. In a real application, you would fetch this from your database
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await new Promise<void>((resolve, reject) => {
    requireAdmin(req as any, res, () => resolve())
      .catch(reject);
  });

  try {
    // Mock stats data
    const stats = {
      totalOrders: 150,
      totalCustomers: 85,
      totalRevenue: 75000000, // 75 million VND
      lowStockProducts: 12
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}