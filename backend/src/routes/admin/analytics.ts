import { NextApiRequest, NextApiResponse } from 'next';
import { readOrders } from '@/services/ordersDatabase';
import { readProducts } from '@/services/productsDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = '30days', category, status } = req.query;

    const [orders, products] = await Promise.all([
      readOrders(),
      readProducts()
    ]);

    // Calculate date ranges
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    
    switch (timeRange) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear(), 0, 1);
        previousStartDate.setFullYear(now.getFullYear() - 1, 0, 1);
        break;
    }

    // Filter orders by date range
    const currentOrders = orders.filter(o => new Date(o.createdAt) >= startDate);
    const previousOrders = orders.filter(o => {
      const date = new Date(o.createdAt);
      return date >= previousStartDate && date < startDate;
    });

    // Calculate metrics
    const calculateMetrics = (ordersList: any[]) => {
      const completedOrders = ordersList.filter(o => o.status === 'delivered');
      const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
      const customers = new Set(ordersList.map(o => o.userId || o.email)).size;
      const productsSold = completedOrders.reduce((sum, o) => {
        return sum + (o.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
      }, 0);
      const avgOrderValue = completedOrders.length > 0 ? revenue / completedOrders.length : 0;

      return {
        revenue,
        orders: ordersList.length,
        customers,
        productsSold,
        avgOrderValue
      };
    };

    const current = calculateMetrics(currentOrders);
    const previous = calculateMetrics(previousOrders);

    // Calculate changes
    const calculateChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    // Revenue by day
    const revenueByDay = [];
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOrders = currentOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      const dayRevenue = dayOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0);
      
      revenueByDay.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Top products
    const productSales: any = {};
    currentOrders.forEach(order => {
      if (order.status === 'delivered') {
        order.items?.forEach((item: any) => {
          if (!productSales[item.productId || item.name]) {
            productSales[item.productId || item.name] = {
              name: item.name,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[item.productId || item.name].quantity += item.quantity;
          productSales[item.productId || item.name].revenue += item.price * item.quantity;
        });
      }
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Category distribution
    const categoryStats: any = {};
    products.forEach(product => {
      const cat = product.categoryId || 'Khác';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { count: 0, revenue: 0 };
      }
      categoryStats[cat].count++;
    });

    currentOrders.forEach(order => {
      if (order.status === 'delivered') {
        order.items?.forEach((item: any) => {
          const product = products.find(p => p.id === item.productId);
          const cat = product?.categoryId || 'Khác';
          if (categoryStats[cat]) {
            categoryStats[cat].revenue += item.price * item.quantity;
          }
        });
      }
    });

    const categoryDistribution = Object.entries(categoryStats).map(([name, data]: any) => ({
      name,
      count: data.count,
      revenue: data.revenue,
      percentage: (data.revenue / current.revenue) * 100
    }));

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          revenue: {
            current: current.revenue,
            previous: previous.revenue,
            change: calculateChange(current.revenue, previous.revenue)
          },
          orders: {
            current: current.orders,
            previous: previous.orders,
            change: calculateChange(current.orders, previous.orders)
          },
          customers: {
            current: current.customers,
            previous: previous.customers,
            change: calculateChange(current.customers, previous.customers)
          },
          productsSold: {
            current: current.productsSold,
            previous: previous.productsSold,
            change: calculateChange(current.productsSold, previous.productsSold)
          },
          avgOrderValue: {
            current: current.avgOrderValue,
            previous: previous.avgOrderValue,
            change: calculateChange(current.avgOrderValue, previous.avgOrderValue)
          }
        },
        revenueByDay,
        topProducts,
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
