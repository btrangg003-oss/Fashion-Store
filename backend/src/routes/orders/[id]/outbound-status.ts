import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');
const INVENTORY_FILE = path.join(process.cwd(), 'data', 'inventory.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // Load orders
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    const order = ordersData.orders.find((o: any) => o.id === orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If no outbound, return empty
    if (!order.outboundId) {
      return res.status(200).json({
        hasOutbound: false,
        inventoryStatus: order.inventoryStatus || 'pending'
      });
    }

    // Load inventory to get outbound details
    const inventoryData = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf-8'));
    const outbound = inventoryData.movements?.find((m: any) => m.id === order.outboundId);

    if (!outbound) {
      return res.status(200).json({
        hasOutbound: false,
        inventoryStatus: order.inventoryStatus || 'pending'
      });
    }

    res.status(200).json({
      hasOutbound: true,
      inventoryStatus: order.inventoryStatus || 'pending',
      outbound: {
        id: outbound.id,
        receiptNumber: outbound.receiptNumber,
        status: outbound.status,
        createdAt: outbound.createdAt,
        updatedAt: outbound.updatedAt,
        items: outbound.items,
        totalValue: outbound.totalValue,
        notes: outbound.notes
      }
    });

  } catch (error) {
    console.error('Error getting outbound status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
