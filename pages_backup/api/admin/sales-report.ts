import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import { getAllOrders } from '../../../lib/ordersDatabase'
import { getAllProducts } from '../../../lib/productsDatabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (req.method === 'GET') {
      const { startDate, endDate, period = 'month' } = req.query;
      
      const orders = await getAllOrders();
      const products = await getAllProducts();
      
      // Filter orders by date range
      let filteredOrders = orders;
      if (startDate && endDate) {
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= new Date(startDate as string) && orderDate <= new Date(endDate as string);
        });
      }

      // Calculate sales metrics
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Product performance
      const productSales = new Map();
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0, name: item.name };
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
          productSales.set(item.productId, existing);
        });
      });

      const topProducts = Array.from(productSales.entries())
        .map(([id, data]) => ({ productId: id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Daily sales for chart
      const dailySales = new Map();
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        const existing = dailySales.get(date) || { revenue: 0, orders: 0 };
        existing.revenue += order.total;
        existing.orders += 1;
        dailySales.set(date, existing);
      });

      const salesChart = Array.from(dailySales.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Order status breakdown
      const statusBreakdown = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Payment method breakdown
      const paymentBreakdown = filteredOrders.reduce((acc, order) => {
        acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            period: period as string
          },
          topProducts,
          salesChart,
          statusBreakdown,
          paymentBreakdown,
          dateRange: {
            start: startDate || filteredOrders[0]?.createdAt,
            end: endDate || filteredOrders[filteredOrders.length - 1]?.createdAt
          }
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Sales report API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}