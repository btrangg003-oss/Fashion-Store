import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getAllStockChecks,
  getStockCheckById,
  createStockCheck,
  updateStockCheck,
  generateId
} from '@/services/inventoryDatabase';
import { StockCheck } from '@/models/inventory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'GET') {
      const checks = getAllStockChecks();
      
      // Apply filters
      let filtered = checks;
      const { status } = req.query;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(c => c.status === status);
      }
      
      // Sort by scheduled date (newest first)
      filtered.sort((a, b) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );
      
      return res.status(200).json({ checks: filtered });
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      if (!data.name || !data.scheduledDate) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }
      
      const newCheck: StockCheck = {
        id: generateId(),
        name: data.name,
        description: data.description,
        warehouseId: data.warehouseId,
        categoryIds: data.categoryIds || [],
        status: 'pending',
        items: data.items || [],
        totalItems: data.items?.length || 0,
        checkedItems: 0,
        discrepancies: 0,
        totalDiscrepancyValue: 0,
        assignedTo: data.assignedTo || [],
        createdBy: decoded.userId,
        scheduledDate: data.scheduledDate,
        createdAt: new Date().toISOString()
      };
      
      const created = createStockCheck(newCheck);
      return res.status(201).json(created);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'Missing check ID' });
      }
      
      const updated = updateStockCheck(id, updates);
      return res.status(200).json(updated);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error: any) {
    console.error('Stock checks API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
