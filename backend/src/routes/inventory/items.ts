import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { JWTPayload } from '@/models/auth';
import { getAllInventory } from '@/services/inventoryDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token) as JWTPayload;
    if (!decoded) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'GET') {
      const items = getAllInventory();
      
      // Apply filters
      let filtered = items;
      const { search, category, status } = req.query;
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filtered = filtered.filter(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower)
        );
      }
      
      if (category && category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
      }
      
      if (status && status !== 'all') {
        filtered = filtered.filter(item => item.status === status);
      }
      
      // Sort by name
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      
      return res.status(200).json({ items: filtered });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error: any) {
    console.error('Inventory items API error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}
