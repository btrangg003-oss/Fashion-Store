import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exportCustomersToExcel } from '@/services/excelExport';

const AUTH_FILE = path.join(process.cwd(), 'data', 'auth.json');
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Đọc dữ liệu
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));

    // Tính toán stats cho mỗi customer
    const customers = authData.users.map((user: any) => {
      const userOrders = ordersData.orders.filter((order: any) => 
        order.userId === user.id && order.status !== 'cancelled'
      );

      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum: number, order: any) => 
        sum + (order.total || 0), 0
      );

      const lastOrder = userOrders
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

      return {
        ...user,
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt
      };
    });

    // Generate Excel
    const buffer = await exportCustomersToExcel(customers);

    // Set headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=customers_${Date.now()}.xlsx`);

    return res.send(buffer);
  } catch (error) {
    console.error('Error exporting customers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
