// Analytics Data Types

export interface TimeRange {
  type: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export interface RevenueDataPoint {
  period: string; // "Week 1", "Jan", "Q1", etc.
  revenue: number;
  target: number;
  growth: number; // percentage
}

export interface RetentionMarketingDataPoint {
  month: string;
  retentionRate: number; // percentage
  marketingROI: number; // percentage
  newCustomers: number;
  returningCustomers: number;
  marketingSpend: number;
}

export interface AgeDistributionData {
  ageGroup: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  count: number;
  percentage: number;
}

export interface GenderDistributionData {
  gender: 'male' | 'female' | 'other';
  genderLabel: string; // For display
  count: number;
  percentage: number;
}

export interface ProductCategoryData {
  category: 'hot' | 'normal' | 'slow' | 'outOfStock';
  categoryLabel: string; // For display
  count: number;
  percentage: number;
  products: string[]; // product names
}

export interface OrderStatusDataPoint {
  week: string; // "Week 1", "Week 2", etc.
  pending: number;
  processing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  total: number;
}

export interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    byPeriod: RevenueDataPoint[];
  };
  retention: {
    rate: number;
    byMonth: RetentionMarketingDataPoint[];
  };
  demographics: {
    age: AgeDistributionData[];
    gender: GenderDistributionData[];
  };
  products: {
    total: number;
    categories: ProductCategoryData[];
  };
  orders: {
    total: number;
    byWeek: OrderStatusDataPoint[];
  };
}

export interface AnalyticsAPIResponse {
  success: boolean;
  data: AnalyticsData;
  lastUpdated: string;
}

export interface AnalyticsState {
  loading: boolean;
  timeRange: TimeRange;
  data: AnalyticsData | null;
  lastUpdated: Date | null;
  error: string | null;
}
