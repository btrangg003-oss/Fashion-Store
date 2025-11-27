import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { getAllOrders } from '../services/ordersDatabase'

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
      const { startDate, endDate } = req.query;
      
      const orders = await getAllOrders();
      
      // Filter orders by date range if provided
      let filteredOrders = orders;
      if (startDate && endDate) {
        filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= new Date(startDate as string) && orderDate <= new Date(endDate as string);
        });
      }

      // Payment method breakdown
      const paymentStats = {
        cod: { count: 0, revenue: 0, percentage: 0 },
        bank_transfer: { count: 0, revenue: 0, percentage: 0 },
        momo: { count: 0, revenue: 0, percentage: 0 },
        credit_card: { count: 0, revenue: 0, percentage: 0 }
      };

      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = filteredOrders.length;

      // Calculate stats for each payment method
      filteredOrders.forEach(order => {
        const method = order.paymentMethod;
        if (paymentStats[method]) {
          paymentStats[method].count += 1;
          paymentStats[method].revenue += order.total;
        }
      });

      // Calculate percentages
      Object.keys(paymentStats).forEach(method => {
        const stats = paymentStats[method];
        stats.percentage = totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0;
      });

      // Payment status breakdown
      const paymentStatusStats = {
        pending: { count: 0, revenue: 0 },
        paid: { count: 0, revenue: 0 },
        failed: { count: 0, revenue: 0 }
      };

      filteredOrders.forEach(order => {
        const status = order.paymentStatus || 'pending';
        if (paymentStatusStats[status]) {
          paymentStatusStats[status].count += 1;
          paymentStatusStats[status].revenue += order.total;
        }
      });

      // Daily payment trends
      const dailyPayments = new Map();
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).toISOString().split('T')[0];
        const existing = dailyPayments.get(date) || {
          cod: 0, bank_transfer: 0, momo: 0, credit_card: 0, total: 0
        };
        existing[order.paymentMethod] += order.total;
        existing.total += order.total;
        dailyPayments.set(date, existing);
      });

      const paymentTrends = Array.from(dailyPayments.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Average transaction value by payment method
      const avgTransactionValue = {};
      Object.keys(paymentStats).forEach(method => {
        const stats = paymentStats[method];
        avgTransactionValue[method] = stats.count > 0 ? stats.revenue / stats.count : 0;
      });

      // Payment success rate (for non-COD methods)
      const digitalPayments = filteredOrders.filter(o => o.paymentMethod !== 'cod');
      const successfulDigitalPayments = digitalPayments.filter(o => o.paymentStatus === 'paid');
      const paymentSuccessRate = digitalPayments.length > 0 
        ? (successfulDigitalPayments.length / digitalPayments.length) * 100 
        : 0;

      // MoMo specific analytics
      const momoOrders = filteredOrders.filter(o => o.paymentMethod === 'momo');
      const momoAnalytics = {
        totalTransactions: momoOrders.length,
        totalRevenue: momoOrders.reduce((sum, o) => sum + o.total, 0),
        successfulTransactions: momoOrders.filter(o => o.paymentStatus === 'paid').length,
        failedTransactions: momoOrders.filter(o => o.paymentStatus === 'failed').length,
        avgTransactionValue: momoOrders.length > 0 
          ? momoOrders.reduce((sum, o) => sum + o.total, 0) / momoOrders.length 
          : 0,
        successRate: momoOrders.length > 0 
          ? (momoOrders.filter(o => o.paymentStatus === 'paid').length / momoOrders.length) * 100 
          : 0
      };

      // Bank transfer specific analytics
      const bankOrders = filteredOrders.filter(o => o.paymentMethod === 'bank_transfer');
      const bankAnalytics = {
        totalTransactions: bankOrders.length,
        totalRevenue: bankOrders.reduce((sum, o) => sum + o.total, 0),
        successfulTransactions: bankOrders.filter(o => o.paymentStatus === 'paid').length,
        pendingTransactions: bankOrders.filter(o => o.paymentStatus === 'pending').length,
        avgTransactionValue: bankOrders.length > 0 
          ? bankOrders.reduce((sum, o) => sum + o.total, 0) / bankOrders.length 
          : 0,
        successRate: bankOrders.length > 0 
          ? (bankOrders.filter(o => o.paymentStatus === 'paid').length / bankOrders.length) * 100 
          : 0
      };

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalRevenue,
            totalOrders,
            paymentSuccessRate,
            digitalPaymentRate: totalOrders > 0 ? (digitalPayments.length / totalOrders) * 100 : 0
          },
          paymentMethods: paymentStats,
          paymentStatus: paymentStatusStats,
          avgTransactionValue,
          paymentTrends,
          momoAnalytics,
          bankAnalytics,
          insights: {
            mostPopularMethod: Object.entries(paymentStats)
              .sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'cod',
            highestRevenueMethod: Object.entries(paymentStats)
              .sort(([,a], [,b]) => b.revenue - a.revenue)[0]?.[0] || 'cod'
          }
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Payment analytics API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}