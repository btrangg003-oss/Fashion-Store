// Analytics Service
export interface SalesAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  growth: {
    revenue: number;
    orders: number;
    customers: number;
  };
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  views: number;
  conversionRate: number;
  rating: number;
}

export interface CustomerAnalytics {
  newCustomers: number;
  returningCustomers: number;
  churnRate: number;
  lifetimeValue: number;
  avgPurchaseFrequency: number;
}

export const calculateSalesAnalytics = (
  orders: any[],
  period: 'day' | 'week' | 'month' | 'year',
  previousOrders: any[]
): SalesAnalytics => {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const prevRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);

  const uniqueCustomers = new Set(orders.map(o => o.userId || o.customerEmail)).size;
  const prevUniqueCustomers = new Set(previousOrders.map(o => o.userId || o.customerEmail)).size;

  return {
    period,
    revenue,
    orders: orders.length,
    customers: uniqueCustomers,
    avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
    growth: {
      revenue: prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
      orders: previousOrders.length > 0 ? ((orders.length - previousOrders.length) / previousOrders.length) * 100 : 0,
      customers: prevUniqueCustomers > 0 ? ((uniqueCustomers - prevUniqueCustomers) / prevUniqueCustomers) * 100 : 0
    }
  };
};

export const getTopProducts = (orders: any[], limit: number = 10): ProductPerformance[] => {
  const productStats: Record<string, any> = {};

  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      if (!productStats[item.id]) {
        productStats[item.id] = {
          productId: item.id,
          productName: item.name,
          unitsSold: 0,
          revenue: 0,
          views: 0,
          conversionRate: 0,
          rating: 0
        };
      }

      productStats[item.id].unitsSold += item.quantity;
      productStats[item.id].revenue += item.price * item.quantity;
    });
  });

  return Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

export const calculateCustomerAnalytics = (customers: any[], orders: any[]): CustomerAnalytics => {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const newCustomers = customers.filter(c =>
    new Date(c.createdAt).getTime() > thirtyDaysAgo
  ).length;

  const returningCustomers = customers.filter(c => {
    const customerOrders = orders.filter(o => o.userId === c.id || o.customerEmail === c.email);
    return customerOrders.length > 1;
  }).length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lifetimeValue = customers.length > 0 ? totalRevenue / customers.length : 0;

  return {
    newCustomers,
    returningCustomers,
    churnRate: 0, // TODO: Calculate based on inactive customers
    lifetimeValue,
    avgPurchaseFrequency: customers.length > 0 ? orders.length / customers.length : 0
  };
};

export const generateReport = (
  type: 'sales' | 'products' | 'customers',
  data: any,
  format: 'json' | 'csv' | 'pdf'
): any => {
  // TODO: Implement report generation
  return {
    type,
    format,
    data,
    generatedAt: new Date().toISOString()
  };
};


// Main analytics function
export const getAnalytics = async (period: string = 'month') => {
  try {
    // Import database functions
    const fs = require('fs');
    const path = require('path');

    // Read orders data
    const ordersPath = path.join(process.cwd(), 'data/orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    let allOrders = ordersData.orders || [];

    // Filter orders by period
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Filter orders within period
    const orders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });

    // Read products data
    const productsPath = path.join(process.cwd(), 'data/products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const products = productsData.products || [];

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    // Calculate orders stats
    const completedOrders = orders.filter((o: any) => o.status === 'delivered').length;
    const pendingOrders = orders.filter((o: any) => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
    const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled').length;

    // Calculate average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Get unique customers
    const uniqueCustomers = new Set();
    orders.forEach((order: any) => {
      if (order.customerEmail) uniqueCustomers.add(order.customerEmail);
      else if (order.userEmail) uniqueCustomers.add(order.userEmail);
    });

    // Calculate revenue by period
    const revenueByPeriod = [];
    const periods = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 12 : 12;
    const groupBy = period === 'week' || period === 'month' ? 'day' : 'month';

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      let dateStr = '';
      let filterFn: (orderDate: Date) => boolean;

      if (groupBy === 'day') {
        date.setDate(date.getDate() - i);
        dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        filterFn = (orderDate: Date) => orderDate.toDateString() === date.toDateString();
      } else {
        date.setMonth(date.getMonth() - i);
        dateStr = date.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
        filterFn = (orderDate: Date) =>
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear();
      }

      const periodRevenue = orders
        .filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return filterFn(orderDate);
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      revenueByPeriod.push({
        period: dateStr,
        amount: periodRevenue
      });
    }

    // Get top selling products
    const productSales: Record<string, any> = {};
    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (!productSales[item.id]) {
          productSales[item.id] = {
            id: item.id,
            name: item.name,
            sold: 0,
            revenue: 0
          };
        }
        productSales[item.id].sold += item.quantity || 0;
        productSales[item.id].revenue += (item.price || 0) * (item.quantity || 0);
      });
    });

    const topSelling = Object.values(productSales)
      .sort((a: any, b: any) => b.sold - a.sold)
      .slice(0, 10);

    // Count low stock products
    const lowStockCount = products.filter((p: any) => (p.stock || 0) < 10).length;

    return {
      revenue: {
        total: totalRevenue,
        growth: 15, // Mock growth percentage
        byPeriod: revenueByPeriod
      },
      orders: {
        total: orders.length,
        completed: completedOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders,
        avgValue: avgOrderValue
      },
      customers: {
        total: uniqueCustomers.size,
        new: Math.floor(uniqueCustomers.size * 0.3), // Mock: 30% new
        returning: Math.floor(uniqueCustomers.size * 0.7), // Mock: 70% returning
        avgLifetimeValue: uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0
      },
      products: {
        total: products.length,
        lowStock: lowStockCount,
        topSelling: topSelling
      }
    };
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    // Return empty data on error
    return {
      revenue: { total: 0, growth: 0, byPeriod: [] },
      orders: { total: 0, completed: 0, pending: 0, cancelled: 0, avgValue: 0 },
      customers: { total: 0, new: 0, returning: 0, avgLifetimeValue: 0 },
      products: { total: 0, lowStock: 0, topSelling: [] }
    };
  }
};
