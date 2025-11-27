import { format, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Order } from '@/models/orders';

// Calculate retention rate
export function calculateRetentionRate(
  totalCustomers: number,
  returningCustomers: number
): number {
  if (totalCustomers === 0) return 0;
  return Math.round((returningCustomers / totalCustomers) * 100);
}

// Calculate marketing ROI
export function calculateMarketingROI(
  revenue: number,
  marketingSpend: number
): number {
  if (marketingSpend === 0) return 0;
  return Math.round(((revenue - marketingSpend) / marketingSpend) * 100);
}

// Categorize products by sales performance
export function categorizeProducts(products: any[]): {
  hot: any[];
  normal: any[];
  slow: any[];
  outOfStock: any[];
} {
  const hot: any[] = [];
  const normal: any[] = [];
  const slow: any[] = [];
  const outOfStock: any[] = [];

  products.forEach(product => {
    const sales = product.sold || 0;
    const stock = product.stock || 0;

    if (stock === 0) {
      outOfStock.push(product);
    } else if (sales > 50) {
      hot.push(product);
    } else if (sales >= 10) {
      normal.push(product);
    } else {
      slow.push(product);
    }
  });

  return { hot, normal, slow, outOfStock };
}

// Aggregate orders by status and time
export function aggregateOrdersByWeek(orders: Order[]): any[] {
  const weeks: { [key: string]: any } = {};
  const now = new Date();

  // Get last 8 weeks
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekLabel = `Tuần ${8 - i}`;

    weeks[weekLabel] = {
      week: weekLabel,
      pending: 0,
      processing: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
      startDate: weekStart,
      endDate: weekEnd
    };
  }

  // Count orders by status
  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    
    // Find which week this order belongs to
    for (const weekLabel in weeks) {
      const week = weeks[weekLabel];
      if (orderDate >= week.startDate && orderDate <= week.endDate) {
        week[order.status] = (week[order.status] || 0) + 1;
        week.total += 1;
        break;
      }
    }
  });

  return Object.values(weeks);
}

// Get time range dates
export function getTimeRangeDates(timeRange: string): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (timeRange) {
    case 'week':
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'month':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'quarter':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterMonth, 1);
      endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
  }

  return { startDate, endDate };
}

// Format currency
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' ₫';
}

// Calculate growth percentage
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// Get period label
export function getPeriodLabel(date: Date, timeRange: string): string {
  switch (timeRange) {
    case 'week':
      return format(date, 'dd/MM', { locale: vi });
    case 'month':
      return format(date, 'dd/MM', { locale: vi });
    case 'quarter':
    case 'year':
      return format(date, 'MMM', { locale: vi });
    default:
      return format(date, 'dd/MM', { locale: vi });
  }
}
