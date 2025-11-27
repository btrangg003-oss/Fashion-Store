import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  generateId
} from '@/services/inventoryDatabase';
import { Supplier } from '@/models/inventory';

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
      const suppliers = getAllSuppliers();
      
      // Sort by name
      suppliers.sort((a, b) => a.name.localeCompare(b.name));
      
      return res.status(200).json({ suppliers });
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      if (!data.name || !data.email) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }
      
      const newSupplier: Supplier = {
        id: generateId(),
        code: data.code || `SUP-${Date.now()}`,
        name: data.name,
        companyName: data.companyName || data.name,
        taxCode: data.taxCode,
        contactPerson: data.contactPerson || '',
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        paymentTerms: data.paymentTerms || 'Net 30',
        currency: data.currency || 'VND',
        totalOrders: 0,
        totalValue: 0,
        averageDeliveryTime: 0,
        rating: 5,
        isActive: true,
        notes: data.notes,
        createdAt: new Date().toISOString()
      };
      
      const created = createSupplier(newSupplier);
      return res.status(201).json(created);
    }

    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: 'Missing supplier ID' });
      }
      
      const updated = updateSupplier(id, updates);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Missing supplier ID' });
      }
      
      const deleted = deleteSupplier(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Supplier not found' });
      }
      
      return res.status(200).json({ message: 'Supplier deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error: any) {
    console.error('Suppliers API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
