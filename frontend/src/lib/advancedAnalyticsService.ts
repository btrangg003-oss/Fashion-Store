import fs from 'fs';
import path from 'path';
import { 
  calculateRetentionRate, 
  calculateMarketingROI, 
  categorizeProducts,
  aggregateOrdersByWeek,
  getTimeRangeDates,
  calculateGrowth,
  getPeriodLabel
} from './analyticsUtils';
import type { AnalyticsData, TimeRange } from '@/types/analytics';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cache: { data: AnalyticsData; timestamp: number } | null = null;

export async function getAdvancedAnalytics(timeRange: string = 'month'): Promise<AnalyticsData> {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  try {
    // Read data files
    const ordersPath = path.join(process.cwd(), 'data/orders.json');
    const productsPath = path.join(process.cwd(), 'data/products.json');
    const authPath = path.join(process.cwd(), 'data/auth.json');

    const ordersFileData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));

    const allOrders = ordersFileData.orders || [];
    const allProducts = productsData.products || [];
    const allUsers = authData.users || [];

    // Get time range
    const { startDate, endDate } = getTimeRangeDates(timeRange);

    // Filter orders by time range
    const orders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // 1. Revenue Data with Targets
    const revenueData = calculateRevenueData(orders, timeRange, startDate, endDate);

    // 2. Retention & Marketing Data
    const retentionData = calculateRetentionData(allUsers, allOrders);

    // 3. Demographics Data
    const demographicsData = calculateDemographicsData(allUsers);

    // 4. Products Data
    const productsAnalytics = calculateProductsData(allProducts, allOrders);

    // 5. Orders Status Data
    const ordersData = calculateOrdersData(allOrders);

    const analyticsData: AnalyticsData = {
      revenue: revenueData,
      retention: retentionData,
      demographics: demographicsData,
      products: productsAnalytics,
      orders: ordersData
    };

    // Update cache
    cache = {
      data: analyticsData,
      timestamp: Date.now()
    };

    return analyticsData;
  } catch (error) {
    console.error('Error in getAdvancedAnalytics:', error);
    throw error;
  }
}

// Calculate revenue data with targets
function calculateRevenueData(orders: any[], timeRange: string, startDate: Date, endDate: Date) {
  const periods: any[] = [];
  let totalRevenue = 0;
  let previousRevenue = 0;

  // Generate periods based on time range
  if (timeRange === 'week') {
    // 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dayLabel = format(date, 'EEE', { locale: vi });
      
      const dayRevenue = orders
        .filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString();
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const target = dayRevenue * 1.2; // Target is 20% higher
      
      periods.push({
        period: dayLabel,
        revenue: dayRevenue,
        target: Math.round(target),
        growth: 0
      });

      totalRevenue += dayRevenue;
    }
  } else if (timeRange === 'month') {
    // 30 days grouped by week
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(endDate);
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
      const weekEnd = new Date(endDate);
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const weekLabel = `Tuần ${4 - i}`;
      
      const weekRevenue = orders
        .filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= weekStart && orderDate <= weekEnd;
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const target = weekRevenue * 1.15; // Target is 15% higher
      
      periods.push({
        period: weekLabel,
        revenue: weekRevenue,
        target: Math.round(target),
        growth: 0
      });

      totalRevenue += weekRevenue;
    }
  } else if (timeRange === 'year') {
    // 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(endDate, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthLabel = format(monthDate, 'MMM', { locale: vi });
      
      const monthRevenue = orders
        .filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        })
        .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

      const target = monthRevenue * 1.1; // Target is 10% higher
      
      periods.push({
        period: monthLabel,
        revenue: monthRevenue,
        target: Math.round(target),
        growth: 0
      });

      totalRevenue += monthRevenue;
    }
  }

  // Calculate growth (mock for now)
  const growth = calculateGrowth(totalRevenue, previousRevenue);

  return {
    total: totalRevenue,
    growth: growth,
    byPeriod: periods
  };
}

// Calculate retention and marketing data
function calculateRetentionData(users: any[], orders: any[]) {
  const months: any[] = [];
  const now = new Date();

  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthLabel = format(monthDate, 'MMM', { locale: vi });

    // Get orders in this month
    const monthOrders = orders.filter((o: any) => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });

    // Get unique customers
    const customerEmails = new Set(monthOrders.map((o: any) => o.customerEmail || o.userEmail));
    
    // Count returning customers (customers who ordered before this month)
    const returningCustomers = Array.from(customerEmails).filter(email => {
      const previousOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt);
        return (o.customerEmail === email || o.userEmail === email) && orderDate < monthStart;
      });
      return previousOrders.length > 0;
    }).length;

    const totalCustomers = customerEmails.size;
    const newCustomers = totalCustomers - returningCustomers;
    const retentionRate = calculateRetentionRate(totalCustomers, returningCustomers);

    // Mock marketing data (in real app, get from marketing database)
    const revenue = monthOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
    const marketingSpend = revenue * 0.15; // Assume 15% of revenue spent on marketing
    const marketingROI = calculateMarketingROI(revenue, marketingSpend);

    months.push({
      month: monthLabel,
      retentionRate,
      marketingROI,
      newCustomers,
      returningCustomers,
      marketingSpend: Math.round(marketingSpend)
    });
  }

  // Calculate overall retention rate
  const totalCustomers = new Set(orders.map((o: any) => o.customerEmail || o.userEmail)).size;
  const returningCustomersCount = users.filter((u: any) => {
    const userOrders = orders.filter((o: any) => o.customerEmail === u.email || o.userEmail === u.email);
    return userOrders.length > 1;
  }).length;
  
  const overallRetentionRate = calculateRetentionRate(totalCustomers, returningCustomersCount);

  return {
    rate: overallRetentionRate,
    byMonth: months
  };
}

// Calculate demographics data
function calculateDemographicsData(users: any[]) {
  // Age distribution
  const ageGroups = {
    '18-24': 0,
    '25-34': 0,
    '35-44': 0,
    '45-54': 0,
    '55+': 0
  };

  // Gender distribution
  const genderCounts = {
    male: 0,
    female: 0,
    other: 0
  };

  users.forEach((user: any) => {
    // Calculate age from birthday (if available)
    if (user.birthday) {
      const birthDate = new Date(user.birthday);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      
      if (age >= 18 && age <= 24) ageGroups['18-24']++;
      else if (age >= 25 && age <= 34) ageGroups['25-34']++;
      else if (age >= 35 && age <= 44) ageGroups['35-44']++;
      else if (age >= 45 && age <= 54) ageGroups['45-54']++;
      else if (age >= 55) ageGroups['55+']++;
    } else {
      // Random distribution if no birthday (for demo)
      const randomAge = Math.floor(Math.random() * 5);
      const groups = Object.keys(ageGroups);
      (ageGroups as any)[groups[randomAge]]++;
    }

    // Count gender
    const gender = user.gender || 'other';
    if (gender in genderCounts) {
      (genderCounts as any)[gender]++;
    } else {
      genderCounts.other++;
    }
  });

  const totalUsers = users.length || 1;

  const ageData = Object.entries(ageGroups).map(([ageGroup, count]) => ({
    ageGroup: ageGroup as any,
    count,
    percentage: Math.round((count / totalUsers) * 100)
  }));

  const genderData = Object.entries(genderCounts).map(([gender, count]) => ({
    gender: gender as any,
    genderLabel: gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác',
    count,
    percentage: Math.round((count / totalUsers) * 100)
  }));

  return {
    age: ageData,
    gender: genderData
  };
}

// Calculate products data
function calculateProductsData(products: any[], orders: any[]) {
  // Calculate sales for each product
  const productSales: Record<string, number> = {};
  
  orders.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      const productId = item.productId || item.id;
      productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
    });
  });

  // Add sales data to products
  const productsWithSales = products.map((p: any) => ({
    ...p,
    sold: productSales[p.id] || 0
  }));

  // Categorize products
  const categorized = categorizeProducts(productsWithSales);

  const categories = [
    {
      category: 'hot' as const,
      categoryLabel: 'Bán chạy',
      count: categorized.hot.length,
      percentage: Math.round((categorized.hot.length / products.length) * 100),
      products: categorized.hot.slice(0, 5).map((p: any) => p.name)
    },
    {
      category: 'normal' as const,
      categoryLabel: 'Bình thường',
      count: categorized.normal.length,
      percentage: Math.round((categorized.normal.length / products.length) * 100),
      products: categorized.normal.slice(0, 5).map((p: any) => p.name)
    },
    {
      category: 'slow' as const,
      categoryLabel: 'Ế ẩm',
      count: categorized.slow.length,
      percentage: Math.round((categorized.slow.length / products.length) * 100),
      products: categorized.slow.slice(0, 5).map((p: any) => p.name)
    },
    {
      category: 'outOfStock' as const,
      categoryLabel: 'Hết hàng',
      count: categorized.outOfStock.length,
      percentage: Math.round((categorized.outOfStock.length / products.length) * 100),
      products: categorized.outOfStock.slice(0, 5).map((p: any) => p.name)
    }
  ];

  return {
    total: products.length,
    categories
  };
}

// Calculate orders status data
function calculateOrdersData(orders: any[]) {
  const byWeek = aggregateOrdersByWeek(orders);
  const total = orders.length;

  return {
    total,
    byWeek
  };
}

// Clear cache (for manual refresh)
export function clearAnalyticsCache() {
  cache = null;
}
