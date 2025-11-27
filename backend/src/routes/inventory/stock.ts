import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  generateId
} from '@/services/inventoryDatabase';
import { InventoryItem } from '@/models/inventory';

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
      const items = getAllInventory();
      
      // Apply filters
      let filtered = items;
      const { status, category, search } = req.query;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(item => item.status === status);
      }
      
      if (category && category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
      }
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchLower) ||
          item.sku.toLowerCase().includes(searchLower) ||
          item.barcode?.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by name
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      
      return res.status(200).json({ items: filtered });
    }

    if (req.method === 'POST') {
      const itemData = req.body;
      
      // Validate
      if (!itemData.name || !itemData.sku) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }
      
      // Determine status
      let status: InventoryItem['status'] = 'in_stock';
      if (itemData.quantity === 0) {
        status = 'out_of_stock';
      } else if (itemData.quantity <= itemData.minQuantity) {
        status = 'low_stock';
      } else if (itemData.quantity >= itemData.maxQuantity) {
        status = 'overstock';
      }
      
      const newItem: InventoryItem = {
        id: generateId(),
        productId: itemData.productId || generateId(),
        sku: itemData.sku,
        barcode: itemData.barcode,
        name: itemData.name,
        image: itemData.image,
        category: itemData.category || 'Uncategorized',
        quantity: itemData.quantity || 0,
        minQuantity: itemData.minQuantity || 10,
        maxQuantity: itemData.maxQuantity || 1000,
        location: itemData.location || 'A-01',
        costPrice: itemData.costPrice || 0,
        sellingPrice: itemData.sellingPrice || 0,
        supplierId: itemData.supplierId,
        supplierName: itemData.supplierName,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const created = createInventoryItem(newItem);
      return res.status(201).json(created);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'Missing item ID' });
      }
      
      const updated = updateInventoryItem(id, updates);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Missing item ID' });
      }
      
      const deleted = deleteInventoryItem(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      return res.status(200).json({ message: 'Item deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error: any) {
    console.error('Stock API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
