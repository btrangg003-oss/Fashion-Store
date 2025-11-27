import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { JWTPayload } from '@/models/auth';
import {
  createMovement,
  getAllMovements,
  generateId
} from '@/services/inventoryDatabase';
import { StockMovement, StockMovementItem } from '@/models/inventory';
import fs from 'fs';
import path from 'path';

// Helper to enrich movements with product images
function enrichMovementsWithImages(movements: StockMovement[]): StockMovement[] {
  try {
    const productsPath = path.join(process.cwd(), 'data', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
    const products = productsData.products || [];
    
    return movements.map(movement => ({
      ...movement,
      items: movement.items?.map(item => {
        const product = products.find((p: any) => p.sku === item.sku || p.id === item.productId);
        return {
          ...item,
          image: product?.featuredImage || product?.images?.[0]?.url,
          productName: item.name || product?.name
        } as any;
      })
    }));
  } catch (error) {
    console.error('Error enriching movements:', error);
    return movements;
  }
}

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
      let movements = getAllMovements();
      
      // Enrich with product images
      movements = enrichMovementsWithImages(movements);
      
      // Check if querying by ID
      const { id, type, startDate, endDate } = req.query;
      
      if (id) {
        const movement = movements.find(m => m.id === id);
        if (!movement) {
          return res.status(404).json({ message: 'Không tìm thấy phiếu' });
        }
        return res.status(200).json(movement);
      }
      
      // Apply filters
      let filtered = movements;
      
      if (type && type !== 'all') {
        filtered = filtered.filter(m => m.type === type);
      }
      
      if (startDate) {
        filtered = filtered.filter(m => 
          new Date(m.movementDate) >= new Date(startDate as string)
        );
      }
      
      if (endDate) {
        filtered = filtered.filter(m => 
          new Date(m.movementDate) <= new Date(endDate as string)
        );
      }
      
      // Sort by date (newest first)
      filtered.sort((a, b) => 
        new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
      );
      
      return res.status(200).json({ movements: filtered });
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      // Validate
      if (!data.type || !data.items || data.items.length === 0) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
      }
      
      // Calculate totals
      const totalItems = data.items.length;
      const subtotal = data.subtotal || data.items.reduce((sum: number, item: StockMovementItem) => 
        sum + (item.quantity * (item.costPrice || 0)), 0
      );
      
      const movement: StockMovement = {
        id: generateId(),
        receiptNumber: data.receiptNumber || `${data.type === 'inbound' ? 'INB' : 'OUT'}-${Date.now()}`,
        type: data.type,
        subType: data.subType,
        referenceId: data.orderId || data.referenceId,
        referenceType: data.type === 'outbound' ? 'order' : 'purchase',
        items: data.items.map((item: any) => ({
          productId: item.productId || generateId(),
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          costPrice: item.costPrice || 0,
          totalValue: item.totalValue || (item.quantity * (item.costPrice || 0)),
          quantityBefore: item.quantityBefore,
          quantityAfter: item.quantityAfter
        })),
        reason: data.reason || '',
        notes: data.notes || '',
        invoiceNumber: data.invoiceNumber,
        attachments: data.attachments || [],
        createdBy: decoded.userId,
        createdByName: data.createdByName || 'Admin',
        approvedBy: data.approvedBy,
        approvedByName: data.approvedByName,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        
        // Customer info (for outbound)
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        orderNumber: data.orderNumber,
        
        // Calculations
        subtotal,
        vatRate: data.vatRate || 0,
        vatAmount: data.vatAmount || 0,
        discountType: data.discountType,
        discountValue: data.discountValue || 0,
        discountAmount: data.discountAmount || 0,
        finalTotal: data.finalTotal || subtotal,
        
        // Cost & Profit (for outbound)
        totalCost: data.totalCost,
        profit: data.profit,
        profitMargin: data.profitMargin,
        
        // Payment
        paymentMethod: data.paymentMethod || ['cash'],
        paidAmount: data.paidAmount || 0,
        debtAmount: data.debtAmount || 0,
        
        totalValue: data.finalTotal || subtotal,
        totalItems,
        status: data.status || 'completed',
        
        // History
        history: data.history || [{
          action: 'Tạo phiếu',
          by: decoded.userId,
          byName: data.createdByName || 'Admin',
          at: new Date().toISOString()
        }],
        
        receiptDate: data.receiptDate || new Date().toISOString(),
        movementDate: data.movementDate || new Date().toISOString(),
        approvedAt: data.status === 'approved' ? new Date().toISOString() : undefined,
        completedAt: data.status === 'completed' ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString()
      };
      
      const created = createMovement(movement);
      
      return res.status(201).json({
        message: 'Movement created successfully',
        movement: created
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error: any) {
    console.error('Movements API error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}
