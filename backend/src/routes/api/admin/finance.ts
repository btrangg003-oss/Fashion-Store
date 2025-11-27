import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllOrders } from '@/services/ordersDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { range = 'month' } = req.query;
    const orders = await getAllOrders();

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
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
    }

    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= now;
    });

    // Calculate revenue
    const revenue = calculateRevenue(filteredOrders, startDate, now);
    
    // Calculate expenses (mock data - replace with actual expense tracking)
    const expenses = calculateExpenses(filteredOrders);
    
    // Calculate profit
    const profit = calculateProfit(revenue.total, expenses.total);
    
    // Calculate taxes (10% VAT in Vietnam)
    const taxes = calculateTaxes(revenue.total);
    
    // Calculate cash flow
    const cashFlow = calculateCashFlow(revenue.total, expenses.total);

    res.status(200).json({
      revenue,
      expenses,
      profit,
      taxes,
      cashFlow
    });
  } catch (error) {
    console.error('Finance API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function calculateRevenue(orders: any[], startDate: Date, endDate: Date) {
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const total = completedOrders.reduce((sum, order) => sum + order.total, 0);

  // Group by month
  const byMonth: { month: string; amount: number }[] = [];
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  
  for (let i = 0; i < 12; i++) {
    const monthOrders = completedOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === i;
    });
    
    byMonth.push({
      month: months[i],
      amount: monthOrders.reduce((sum, order) => sum + order.total, 0)
    });
  }

  // Calculate growth (compare with previous period)
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setTime(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
  
  const previousOrders = orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= previousPeriodStart && orderDate < startDate && order.status === 'delivered';
  });
  
  const previousTotal = previousOrders.reduce((sum, order) => sum + order.total, 0);
  const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  return {
    total,
    byMonth: byMonth.filter(m => m.amount > 0),
    growth: Math.round(growth * 10) / 10
  };
}

function calculateExpenses(orders: any[]) {
  // Mock expense calculation - replace with actual expense tracking
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);

  // Estimate expenses as percentage of revenue
  const costOfGoods = revenue * 0.45; // 45% COGS
  const shipping = completedOrders.length * 30000; // 30k per order
  const marketing = revenue * 0.15; // 15% marketing
  const operations = revenue * 0.10; // 10% operations
  const other = revenue * 0.05; // 5% other

  return {
    total: costOfGoods + shipping + marketing + operations + other,
    byCategory: [
      { category: 'Giá vốn hàng bán', amount: costOfGoods },
      { category: 'Vận chuyển', amount: shipping },
      { category: 'Marketing', amount: marketing },
      { category: 'Vận hành', amount: operations },
      { category: 'Chi phí khác', amount: other }
    ]
  };
}

function calculateProfit(revenue: number, expenses: number) {
  const gross = revenue - (revenue * 0.45); // Gross profit (after COGS)
  const net = revenue - expenses; // Net profit
  const margin = revenue > 0 ? (net / revenue) * 100 : 0;

  return {
    gross: Math.round(gross),
    net: Math.round(net),
    margin: Math.round(margin * 10) / 10
  };
}

function calculateTaxes(revenue: number) {
  const vatRate = 0.10; // 10% VAT
  const due = revenue * vatRate;
  const paid = due * 0.7; // Assume 70% paid
  const pending = due - paid;

  return {
    due: Math.round(due),
    paid: Math.round(paid),
    pending: Math.round(pending)
  };
}

function calculateCashFlow(revenue: number, expenses: number) {
  return {
    inflow: Math.round(revenue),
    outflow: Math.round(expenses),
    balance: Math.round(revenue - expenses)
  };
}
