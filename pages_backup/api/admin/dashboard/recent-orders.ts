import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/authMiddleware';

// This is a mock data response. In a real application, you would fetch this from your database
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Mock recent orders data
    const recentOrders = [
      {
        id: 'ORD001',
        date: new Date().toISOString(),
        customer: 'Nguyễn Văn A',
        total: 1500000,
        status: 'pending'
      },
      {
        id: 'ORD002',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        customer: 'Trần Thị B',
        total: 2300000,
        status: 'processing'
      },
      {
        id: 'ORD003',
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        customer: 'Lê Văn C',
        total: 950000,
        status: 'completed'
      }
    ];

    res.status(200).json(recentOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}