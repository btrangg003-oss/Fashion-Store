import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { readOrders } from '@/lib/ordersDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const orders = await readOrders();
    const userOrders = orders.filter(order => order.userId === decoded.userId);

    // Tính chi tiêu 6 tháng gần nhất
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlySpending = new Map<string, number>();
    
    // Khởi tạo 6 tháng với giá trị 0
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlySpending.set(key, 0);
    }

    // Tính tổng chi tiêu theo tháng
    userOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= sixMonthsAgo && order.status !== 'cancelled') {
        const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        const current = monthlySpending.get(key) || 0;
        monthlySpending.set(key, current + order.total);
      }
    });

    // Chuyển đổi sang array và sort
    const data = Array.from(monthlySpending.entries())
      .map(([month, amount]) => ({
        month,
        amount: Math.round(amount),
        label: formatMonthLabel(month)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Tính thống kê
    const totalSpending = data.reduce((sum, item) => sum + item.amount, 0);
    const avgSpending = Math.round(totalSpending / 6);
    const maxSpending = Math.max(...data.map(item => item.amount));
    const minSpending = Math.min(...data.map(item => item.amount));

    return res.status(200).json({
      data,
      stats: {
        total: totalSpending,
        average: avgSpending,
        max: maxSpending,
        min: minSpending
      }
    });
  } catch (error) {
    console.error('Error fetching spending stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return `${monthNames[parseInt(month) - 1]}/${year}`;
}
