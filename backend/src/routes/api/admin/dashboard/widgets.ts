import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllOrders } from '@/services/ordersDatabase';
import { getAllProducts } from '@/services/productsDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orders = await getAllOrders();
    const products = await getAllProducts();

    // Current month data
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthOrders = orders.filter((o: any) => new Date(o.createdAt) >= currentMonthStart);

    // Previous month data
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const previousMonthOrders = orders.filter((o: any) => {
      const date = new Date(o.createdAt);
      return date >= previousMonthStart && date <= previousMonthEnd;
    });

    // Calculate revenue
    const currentRevenue = currentMonthOrders
      .filter((o: any) => o.status === 'delivered')
      .reduce((sum: number, o: any) => sum + o.total, 0);
    const previousRevenue = previousMonthOrders
      .filter((o: any) => o.status === 'delivered')
      .reduce((sum: number, o: any) => sum + o.total, 0);
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Calculate orders
    const currentOrdersCount = currentMonthOrders.length;
    const previousOrdersCount = previousMonthOrders.length;
    const ordersChange = previousOrdersCount > 0
      ? ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
      : 0;

    // Calculate customers
    const currentCustomers = new Set(currentMonthOrders.map((o: any) => o.userId)).size;
    const previousCustomers = new Set(previousMonthOrders.map((o: any) => o.userId)).size;
    const customersChange = previousCustomers > 0
      ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

    // Calculate products
    const totalProducts = products.length;
    const lowStockProducts = products.filter((p: any) => p.stock < 10).length;

    res.status(200).json({
      revenue: {
        value: Math.round(currentRevenue),
        change: Math.round(revenueChange * 10) / 10
      },
      orders: {
        value: currentOrdersCount,
        change: Math.round(ordersChange * 10) / 10
      },
      customers: {
        value: currentCustomers,
        change: Math.round(customersChange * 10) / 10
      },
      products: {
        value: totalProducts,
        lowStock: lowStockProducts
      }
    });
  } catch (error) {
    console.error('Dashboard widgets API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
