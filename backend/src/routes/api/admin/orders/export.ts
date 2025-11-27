import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/services/auth';
import { exportOrdersToExcel } from '@/services/ordersExcelExport';

const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const isAdmin = decoded.email === process.env.ADMIN_EMAIL || 
                   decoded.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Read orders
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const orders = ordersData.orders || [];

    // Generate Excel
    const buffer = await exportOrdersToExcel(orders);

    // Set headers
    const filename = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    return res.send(buffer);
  } catch (error) {
    console.error('Error exporting orders:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
