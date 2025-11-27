import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    // Đọc orders
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    
    // Lọc orders của customer
    const customerOrders = ordersData.orders
      .filter((order: any) => order.userId === id)
      .sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    return res.status(200).json({
      success: true,
      orders: customerOrders,
      total: customerOrders.length
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
