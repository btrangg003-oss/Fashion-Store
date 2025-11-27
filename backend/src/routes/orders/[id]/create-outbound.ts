import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');
const INVENTORY_FILE = path.join(process.cwd(), 'data', 'inventory.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id: orderId } = req.query;
    const { notes } = req.body;

    // Load orders
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    const order = ordersData.orders.find((o: any) => o.id === orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if outbound already exists
    if (order.outboundId) {
      return res.status(400).json({ 
        message: 'Outbound already exists for this order',
        outboundId: order.outboundId,
        outboundNumber: order.outboundNumber
      });
    }

    // Load inventory
    const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));

    // Generate outbound receipt number
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const existingOutbounds = inventoryData.movements?.filter((m: any) => 
      m.type === 'outbound' && m.receiptNumber?.startsWith(`OUT-${dateStr}`)
    ) || [];
    const nextNum = (existingOutbounds.length + 1).toString().padStart(3, '0');
    const receiptNumber = `OUT-${dateStr}-${nextNum}`;

    // Calculate cost first
    const totalCost = order.items.reduce((sum: number, item: any) => {
      const inventoryItem = inventoryData.items?.find((inv: any) => inv.sku === item.sku);
      return sum + ((inventoryItem?.costPrice || 0) * item.quantity);
    }, 0);
    
    // Calculate profit
    const profit = order.total - totalCost;
    const profitMargin = order.total > 0 
      ? parseFloat(((profit / order.total) * 100).toFixed(1))
      : 0;

    // Create outbound movement
    const outboundId = `out_${Date.now()}`;
    const outbound = {
      id: outboundId,
      receiptNumber,
      type: 'outbound',
      subType: 'online_order',
      receiptDate: now.toISOString().split('T')[0],
      movementDate: now.toISOString(),
      
      // Order integration
      orderId: order.id,
      orderNumber: order.orderNumber,
      autoCreated: true,
      
      // Customer info from order
      customerName: order.shippingAddress.fullName,
      customerPhone: order.shippingAddress.phone,
      customerAddress: `${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`,
      
      // Items from order
      items: order.items.map((item: any) => {
        const inventoryItem = inventoryData.items?.find((inv: any) => inv.sku === item.sku);
        return {
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          costPrice: inventoryItem?.costPrice || 0,
          totalValue: item.price * item.quantity,
          quantityBefore: inventoryItem?.quantity || 0,
          quantityAfter: (inventoryItem?.quantity || 0) - item.quantity
        };
      }),
      
      // Calculations
      subtotal: order.subtotal,
      vatRate: 0,
      vatAmount: 0,
      discountType: 'fixed',
      discountValue: order.discount || 0,
      discountAmount: order.discount || 0,
      finalTotal: order.total,
      totalValue: order.total,
      totalItems: order.items.length,
      
      // Cost & Profit
      totalCost,
      profit,
      profitMargin,
      
      notes: notes || `Tự động tạo từ đơn hàng ${order.orderNumber}`,
      reason: `Xuất kho - Đơn hàng online`,
      
      // Status
      status: 'pending',
      
      // User
      createdBy: decoded.email,
      createdByName: decoded.firstName ? `${decoded.firstName} ${decoded.lastName}` : 'Admin',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      
      // History
      history: [{
        action: 'Tạo phiếu tự động từ đơn hàng',
        by: decoded.email,
        byName: decoded.firstName ? `${decoded.firstName} ${decoded.lastName}` : 'Admin',
        at: now.toISOString(),
        note: `Tạo từ đơn hàng ${order.orderNumber}`
      }]
    };

    // Add to movements
    if (!inventoryData.movements) {
      inventoryData.movements = [];
    }
    inventoryData.movements.push(outbound);

    // Update order with outbound info
    order.outboundId = outboundId;
    order.outboundNumber = receiptNumber;
    order.inventoryStatus = 'reserved';
    order.reservedAt = now.toISOString();
    order.updatedAt = now.toISOString();

    // Save both files
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersData, null, 2));
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventoryData, null, 2));

    res.status(200).json({
      success: true,
      outbound: {
        id: outboundId,
        receiptNumber,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error creating outbound:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
