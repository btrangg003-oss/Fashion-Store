import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { JWTPayload } from '@/models/auth';
import {
  getAllStockChecks,
  createStockCheck,
  generateId,
  getAllInventory
} from '@/services/inventoryDatabase';
import { StockCheck, StockCheckItem } from '@/models/inventory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token) as JWTPayload;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'GET') {
      const checks = getAllStockChecks();
      
      // Apply filters
      let filtered = checks;
      const { status, startDate, endDate, search } = req.query;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(c => c.status === status);
      }
      
      if (startDate) {
        filtered = filtered.filter(c => 
          new Date(c.scheduledDate) >= new Date(startDate as string)
        );
      }
      
      if (endDate) {
        filtered = filtered.filter(c => 
          new Date(c.scheduledDate) <= new Date(endDate as string)
        );
      }
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filtered = filtered.filter(c => 
          c.checkNumber.toLowerCase().includes(searchLower) ||
          c.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by date (newest first)
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return res.status(200).json({ checks: filtered });
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      // Validate
      if (!data.name || !data.scheduledDate) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }
      
      // Get inventory items based on scope
      const allInventory = getAllInventory();
      let itemsToCheck = allInventory;
      
      if (data.scope) {
        if (data.scope.type === 'category' && data.scope.categories) {
          itemsToCheck = allInventory.filter(item => 
            data.scope.categories.includes(item.category)
          );
        } else if (data.scope.type === 'location' && data.scope.locations) {
          itemsToCheck = allInventory.filter(item => 
            data.scope.locations.includes(item.location)
          );
        } else if (data.scope.type === 'custom' && data.scope.skus) {
          itemsToCheck = allInventory.filter(item => 
            data.scope.skus.includes(item.sku)
          );
        }
      }
      
      // Create check items
      const checkItems: StockCheckItem[] = itemsToCheck.map(item => ({
        id: generateId(),
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        category: item.category,
        location: item.location,
        systemQuantity: item.quantity,
        costPrice: item.costPrice,
        checked: false,
        status: 'pending'
      }));
      
      const check: StockCheck = {
        id: generateId(),
        checkNumber: '', // Will be generated in createStockCheck
        name: data.name,
        description: data.description,
        scope: data.scope || { type: 'all' },
        items: checkItems,
        totalItems: checkItems.length,
        checkedItems: 0,
        matchedItems: 0,
        discrepancyItems: 0,
        discrepancies: 0,
        totalDiscrepancyValue: 0,
        accuracyRate: 0,
        status: 'draft',
        createdBy: decoded.userId,
        createdByName: decoded.firstName + ' ' + decoded.lastName,
        assignedTo: data.assignedTo || [],
        scheduledDate: data.scheduledDate,
        createdAt: new Date().toISOString()
      };
      
      const created = createStockCheck(check);
      
      return res.status(201).json({
        message: 'Tạo phiếu kiểm kho thành công',
        check: created
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error: any) {
    console.error('Stock checks API error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}
