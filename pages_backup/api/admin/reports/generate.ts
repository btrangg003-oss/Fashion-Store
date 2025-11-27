import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllOrders } from '@/lib/ordersDatabase';
import { getAllProducts } from '@/lib/productsDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reportId, dateRange, format } = req.body;

    // Generate report data based on type
    let reportData;
    switch (reportId) {
      case 'sales-summary':
        reportData = await generateSalesSummary(dateRange);
        break;
      case 'product-performance':
        reportData = await generateProductPerformance(dateRange);
        break;
      case 'customer-insights':
        reportData = await generateCustomerInsights(dateRange);
        break;
      case 'inventory-status':
        reportData = await generateInventoryStatus();
        break;
      case 'financial-report':
        reportData = await generateFinancialReport(dateRange);
        break;
      case 'marketing-roi':
        reportData = await generateMarketingROI(dateRange);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    // Convert to requested format
    const output = await formatReport(reportData, format);

    // Set appropriate headers
    const contentType = format === 'pdf' ? 'application/pdf' : 
                       format === 'excel' ? 'application/vnd.ms-excel' : 
                       'text/csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${reportId}.${format}"`);
    res.status(200).send(output);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function generateSalesSummary(dateRange: string) {
  const orders = await getAllOrders();
  const filtered = filterByDateRange(orders, dateRange);

  const totalRevenue = filtered.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filtered.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    title: 'Báo cáo tổng hợp doanh số',
    period: dateRange,
    metrics: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      completedOrders: filtered.filter(o => o.status === 'delivered').length,
      cancelledOrders: filtered.filter(o => o.status === 'cancelled').length
    },
    data: filtered
  };
}

async function generateProductPerformance(dateRange: string) {
  const orders = await getAllOrders();
  const products = await getAllProducts();
  const filtered = filterByDateRange(orders, dateRange);

  // Calculate product sales
  const productSales: any = {};
  filtered.forEach(order => {
    order.items.forEach((item: any) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.price * item.quantity;
    });
  });

  return {
    title: 'Hiệu suất sản phẩm',
    period: dateRange,
    topProducts: Object.entries(productSales)
      .sort((a: any, b: any) => b[1].revenue - a[1].revenue)
      .slice(0, 10),
    totalProducts: products.length,
    lowStock: products.filter((p: any) => p.stock < 10).length
  };
}

async function generateCustomerInsights(dateRange: string) {
  const orders = await getAllOrders();
  const filtered = filterByDateRange(orders, dateRange);

  const customerData: any = {};
  filtered.forEach(order => {
    if (!customerData[order.userId]) {
      customerData[order.userId] = {
        orders: 0,
        totalSpent: 0
      };
    }
    customerData[order.userId].orders++;
    customerData[order.userId].totalSpent += order.total;
  });

  const customerValues = Object.values(customerData) as any[];
  const totalCustomers = Object.keys(customerData).length;
  
  return {
    title: 'Phân tích khách hàng',
    period: dateRange,
    totalCustomers,
    avgOrdersPerCustomer: customerValues.reduce((sum: number, c: any) => sum + c.orders, 0) / totalCustomers,
    avgSpentPerCustomer: customerValues.reduce((sum: number, c: any) => sum + c.totalSpent, 0) / totalCustomers,
    topCustomers: Object.entries(customerData)
      .sort((a: any, b: any) => (b[1] as any).totalSpent - (a[1] as any).totalSpent)
      .slice(0, 10)
  };
}

async function generateInventoryStatus() {
  const products = await getAllProducts();

  return {
    title: 'Tình trạng kho hàng',
    totalProducts: products.length,
    inStock: products.filter((p: any) => p.stock > 0).length,
    outOfStock: products.filter((p: any) => p.stock === 0).length,
    lowStock: products.filter((p: any) => p.stock > 0 && p.stock < 10).length,
    totalValue: products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0),
    products: products.map((p: any) => ({
      name: p.name,
      stock: p.stock,
      value: p.price * p.stock
    }))
  };
}

async function generateFinancialReport(dateRange: string) {
  const orders = await getAllOrders();
  const filtered = filterByDateRange(orders, dateRange);
  const completed = filtered.filter(o => o.status === 'delivered');

  const revenue = completed.reduce((sum, o) => sum + o.total, 0);
  const expenses = revenue * 0.70; // Estimate 70% expenses
  const profit = revenue - expenses;

  return {
    title: 'Báo cáo tài chính',
    period: dateRange,
    revenue,
    expenses,
    profit,
    profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
    tax: revenue * 0.10
  };
}

async function generateMarketingROI(dateRange: string) {
  const orders = await getAllOrders();
  const filtered = filterByDateRange(orders, dateRange);

  const revenue = filtered.reduce((sum, o) => sum + o.total, 0);
  const marketingSpend = revenue * 0.15; // Estimate 15% marketing spend
  const roi = marketingSpend > 0 ? ((revenue - marketingSpend) / marketingSpend) * 100 : 0;

  return {
    title: 'ROI Marketing',
    period: dateRange,
    revenue,
    marketingSpend,
    roi,
    conversions: filtered.length,
    costPerAcquisition: filtered.length > 0 ? marketingSpend / filtered.length : 0
  };
}

function filterByDateRange(orders: any[], range: string) {
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

  return orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= now;
  });
}

async function formatReport(data: any, format: string) {
  if (format === 'csv') {
    return convertToCSV(data);
  }
  
  // For PDF and Excel, return JSON for now
  // In production, use libraries like pdfkit or exceljs
  return JSON.stringify(data, null, 2);
}

function convertToCSV(data: any) {
  const lines = [`${data.title} - ${data.period}\n\n`];
  
  if (data.metrics) {
    lines.push('Metrics\n');
    Object.entries(data.metrics).forEach(([key, value]) => {
      lines.push(`${key},${value}\n`);
    });
  }

  return lines.join('');
}
