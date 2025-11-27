import { NextApiRequest, NextApiResponse } from 'next';
import { readOrders } from '@/services/ordersDatabase';
import { readProducts } from '@/services/productsDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [orders, products] = await Promise.all([
      readOrders(),
      readProducts()
    ]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Today's orders
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const yesterdayOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= yesterday && date < today;
    });

    // Revenue calculations
    const todayRevenue = todayOrders
      .filter(o => o.status === 'delivered' || o.status === 'processing')
      .reduce((sum, o) => sum + o.total, 0);
    
    const yesterdayRevenue = yesterdayOrders
      .filter(o => o.status === 'delivered' || o.status === 'processing')
      .reduce((sum, o) => sum + o.total, 0);

    // This month stats
    const thisMonthOrders = orders.filter(o => new Date(o.createdAt) >= thisMonth);
    const lastMonthOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= lastMonth && date < thisMonth;
    });

    // Customer stats
    const uniqueCustomers = new Set(orders.map(o => o.userId || o.email)).size;
    const newCustomersThisMonth = new Set(
      thisMonthOrders.map(o => o.userId || o.email)
    ).size;

    // Product stats
    const lowStockProducts = products.filter(p => p.stock <= 10);
    const outOfStockProducts = products.filter(p => p.stock === 0);

    // Pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending');

    // Average order value
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const avgOrderValue = completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + o.total, 0) / completedOrders.length
      : 0;

    // Conversion rate (mock - would need analytics data)
    const conversionRate = 3.2;

    // Calculate percentage changes
    const orderChange = yesterdayOrders.length > 0
      ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100
      : 0;

    const revenueChange = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        // Today stats
        todayOrders: todayOrders.length,
        todayRevenue,
        orderChange: orderChange.toFixed(1),
        revenueChange: revenueChange.toFixed(1),

        // Products
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,

        // Customers
        totalCustomers: uniqueCustomers,
        newCustomersThisMonth,

        // Additional metrics
        conversionRate,
        avgOrderValue,
        pendingOrders: pendingOrders.length,

        // Month comparison
        thisMonthOrders: thisMonthOrders.length,
        lastMonthOrders: lastMonthOrders.length
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}
