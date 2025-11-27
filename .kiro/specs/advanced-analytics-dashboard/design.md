# Design Document - Advanced Analytics Dashboard

## Overview

Thiết kế hệ thống Analytics Dashboard nâng cao với 5 loại biểu đồ chuyên nghiệp sử dụng thư viện Recharts. Dashboard được tối ưu hóa cho hiệu suất, responsive và cung cấp trải nghiệm người dùng mượt mà.

## Architecture

### Component Hierarchy

```
pages/admin/analytics.tsx (Main Page)
├── AdminLayout
├── AnalyticsHeader
│   ├── PageTitle
│   ├── TimeRangeSelector
│   └── ExportButtons
├── MetricsOverview (KPI Cards)
│   ├── RevenueCard
│   ├── OrdersCard
│   ├── CustomersCard
│   └── ProductsCard
├── ChartsGrid
│   ├── RevenueTargetChart (ComposedChart)
│   ├── RetentionMarketingChart (BarChart)
│   ├── CustomerDemographicsCharts
│   │   ├── AgeDistributionChart (PieChart)
│   │   └── GenderDistributionChart (PieChart)
│   ├── ProductInventoryChart (PieChart)
│   └── OrderStatusChart (StackedBarChart)
└── RefreshIndicator
```

### Data Flow

```
User Action → API Call → Data Processing → State Update → Chart Re-render
     ↓
localStorage (cache) ← API Response
     ↓
Auto-refresh (5 min) → Repeat
```

## Components and Interfaces

### 1. Main Analytics Page

**File:** `pages/admin/analytics.tsx`

```typescript
interface AnalyticsPageProps {}

interface AnalyticsState {
  loading: boolean;
  timeRange: TimeRange;
  data: AnalyticsData;
  lastUpdated: Date;
}

interface TimeRange {
  type: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

interface AnalyticsData {
  revenue: RevenueData;
  retention: RetentionData;
  demographics: DemographicsData;
  products: ProductsData;
  orders: OrdersData;
}
```

### 2. Revenue Target Chart Component

**File:** `components/Admin/Charts/RevenueTargetChart.tsx`

```typescript
interface RevenueTargetChartProps {
  data: RevenueDataPoint[];
  timeRange: TimeRange;
}

interface RevenueDataPoint {
  period: string; // "Week 1", "Jan", "Q1", etc.
  revenue: number;
  target: number;
  growth: number; // percentage
}

// Uses Recharts ComposedChart
// - Line for actual revenue (green)
// - Bar for target (gray)
// - Tooltip with detailed info
// - Legend
// - Responsive container
```

### 3. Retention & Marketing Chart Component

**File:** `components/Admin/Charts/RetentionMarketingChart.tsx`

```typescript
interface RetentionMarketingChartProps {
  data: RetentionMarketingDataPoint[];
}

interface RetentionMarketingDataPoint {
  month: string;
  retentionRate: number; // percentage
  marketingROI: number; // percentage
  newCustomers: number;
  returningCustomers: number;
  marketingSpend: number;
}

// Uses Recharts BarChart
// - Purple bars for Retention Rate
// - Orange bars for Marketing ROI
// - Grouped bars side by side
// - Tooltip with calculations
```

### 4. Customer Demographics Charts Component

**File:** `components/Admin/Charts/CustomerDemographicsCharts.tsx`

```typescript
interface CustomerDemographicsChartsProps {
  ageData: AgeDistributionData[];
  genderData: GenderDistributionData[];
}

interface AgeDistributionData {
  ageGroup: '18-24' | '25-34' | '35-44' | '45-54' | '55+';
  count: number;
  percentage: number;
}

interface GenderDistributionData {
  gender: 'male' | 'female' | 'other';
  count: number;
  percentage: number;
}

// Uses 2 Recharts PieCharts side by side
// - Gradient colors (blue to purple)
// - Labels with percentage
// - Legend
// - Responsive grid layout
```

### 5. Product Inventory Chart Component

**File:** `components/Admin/Charts/ProductInventoryChart.tsx`

```typescript
interface ProductInventoryChartProps {
  data: ProductCategoryData[];
}

interface ProductCategoryData {
  category: 'hot' | 'normal' | 'slow' | 'outOfStock';
  count: number;
  percentage: number;
  products: string[]; // product names
}

// Uses Recharts PieChart
// - Green for Hot
// - Blue for Normal
// - Orange for Slow
// - Red for Out of Stock
// - Custom label with count
// - Tooltip with product names
```

### 6. Order Status Chart Component

**File:** `components/Admin/Charts/OrderStatusChart.tsx`

```typescript
interface OrderStatusChartProps {
  data: OrderStatusDataPoint[];
}

interface OrderStatusDataPoint {
  week: string; // "Week 1", "Week 2", etc.
  pending: number;
  processing: number;
  shipping: number;
  delivered: number;
  cancelled: number;
  total: number;
}

// Uses Recharts StackedBarChart
// - Stacked bars for each status
// - Color-coded by status
// - Tooltip with count and percentage
// - Legend
```

### 7. Time Range Selector Component

**File:** `components/Admin/Analytics/TimeRangeSelector.tsx`

```typescript
interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

// Dropdown with options:
// - This Week
// - This Month
// - This Quarter
// - This Year
// - Custom Range (opens date picker)
```

### 8. Export Buttons Component

**File:** `components/Admin/Analytics/ExportButtons.tsx`

```typescript
interface ExportButtonsProps {
  data: AnalyticsData;
  timeRange: TimeRange;
  onExportPDF: () => void;
  onExportExcel: () => void;
}

// Two buttons:
// - Export PDF (uses jsPDF + html2canvas)
// - Export Excel (uses xlsx library)
```

## Data Models

### Analytics API Response

```typescript
interface AnalyticsAPIResponse {
  success: boolean;
  data: {
    // Revenue data
    revenue: {
      total: number;
      growth: number;
      byPeriod: Array<{
        period: string;
        revenue: number;
        target: number;
      }>;
    };
    
    // Retention & Marketing data
    retention: {
      rate: number;
      byMonth: Array<{
        month: string;
        retentionRate: number;
        marketingROI: number;
        newCustomers: number;
        returningCustomers: number;
        marketingSpend: number;
      }>;
    };
    
    // Demographics data
    demographics: {
      age: Array<{
        ageGroup: string;
        count: number;
        percentage: number;
      }>;
      gender: Array<{
        gender: string;
        count: number;
        percentage: number;
      }>;
    };
    
    // Products data
    products: {
      total: number;
      categories: Array<{
        category: string;
        count: number;
        percentage: number;
        products: string[];
      }>;
    };
    
    // Orders data
    orders: {
      total: number;
      byWeek: Array<{
        week: string;
        pending: number;
        processing: number;
        shipping: number;
        delivered: number;
        cancelled: number;
      }>;
    };
  };
  lastUpdated: string;
}
```

## API Endpoints

### GET /api/admin/analytics

**Query Parameters:**
- `timeRange`: 'week' | 'month' | 'quarter' | 'year' | 'custom'
- `startDate`: ISO date string (for custom range)
- `endDate`: ISO date string (for custom range)

**Response:** AnalyticsAPIResponse

**Caching:** 5 minutes in memory cache

### GET /api/admin/analytics/export

**Query Parameters:**
- `format`: 'pdf' | 'excel'
- `timeRange`: same as above
- `startDate`: optional
- `endDate`: optional

**Response:** File download

## Styling & Theme

### Color Palette

```typescript
const CHART_COLORS = {
  // Primary colors
  revenue: '#10b981',      // Green
  target: '#9ca3af',       // Gray
  retention: '#8b5cf6',    // Purple
  marketing: '#f59e0b',    // Orange
  
  // Status colors
  pending: '#6b7280',      // Gray
  processing: '#f59e0b',   // Orange
  shipping: '#3b82f6',     // Blue
  delivered: '#10b981',    // Green
  cancelled: '#ef4444',    // Red
  
  // Product categories
  hot: '#10b981',          // Green
  normal: '#3b82f6',       // Blue
  slow: '#f59e0b',         // Orange
  outOfStock: '#ef4444',   // Red
  
  // Demographics gradient
  demographicsGradient: [
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#c026d3'
  ]
};
```

### Layout Grid

```css
/* Desktop (> 1024px) */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile (< 768px) */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
```

### Chart Dimensions

```typescript
const CHART_CONFIG = {
  height: {
    small: 250,
    medium: 350,
    large: 450
  },
  margin: {
    top: 20,
    right: 30,
    bottom: 20,
    left: 20
  },
  animation: {
    duration: 500,
    easing: 'ease-out'
  }
};
```

## Error Handling

### Error States

1. **No Data Available**
   - Display empty state with illustration
   - Message: "Chưa có dữ liệu để hiển thị"
   - Action button: "Làm mới"

2. **API Error**
   - Display error message
   - Retry button
   - Fallback to cached data if available

3. **Loading State**
   - Skeleton loaders for charts
   - Shimmer effect
   - Loading text: "Đang tải dữ liệu..."

### Error Boundaries

```typescript
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error) => {
    console.error('Analytics error:', error);
    // Log to error tracking service
  }}
>
  <AnalyticsCharts />
</ErrorBoundary>
```

## Testing Strategy

### Unit Tests

1. **Chart Components**
   - Test data rendering
   - Test tooltip display
   - Test responsive behavior
   - Test color mapping

2. **Data Processing**
   - Test calculations (retention rate, ROI, etc.)
   - Test data transformation
   - Test edge cases (empty data, null values)

3. **Time Range Selector**
   - Test date range validation
   - Test custom range picker
   - Test localStorage persistence

### Integration Tests

1. **API Integration**
   - Test data fetching
   - Test error handling
   - Test caching mechanism

2. **Export Functionality**
   - Test PDF generation
   - Test Excel export
   - Test file download

### E2E Tests

1. **User Flows**
   - Load analytics page
   - Change time range
   - Hover over charts
   - Export reports

## Performance Optimization

### Strategies

1. **Code Splitting**
   ```typescript
   const RevenueChart = dynamic(() => 
     import('@/components/Admin/Charts/RevenueTargetChart'),
     { loading: () => <ChartSkeleton /> }
   );
   ```

2. **Memoization**
   ```typescript
   const processedData = useMemo(() => 
     processAnalyticsData(rawData),
     [rawData]
   );
   ```

3. **Debouncing**
   ```typescript
   const debouncedRefresh = useMemo(
     () => debounce(fetchAnalytics, 300),
     []
   );
   ```

4. **Virtual Scrolling**
   - For large data tables
   - Use react-window or react-virtualized

5. **Image Optimization**
   - Use Next.js Image component
   - Lazy load chart images

### Caching Strategy

```typescript
// Cache in localStorage
const CACHE_KEY = 'analytics_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    return null;
  }
  
  return data;
};
```

## Dependencies

### Required Libraries

```json
{
  "recharts": "^2.10.0",
  "date-fns": "^2.30.0",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "xlsx": "^0.18.5",
  "react-datepicker": "^4.21.0"
}
```

### Installation Command

```bash
npm install recharts date-fns jspdf html2canvas xlsx react-datepicker
npm install --save-dev @types/react-datepicker
```

## Accessibility

### ARIA Labels

```typescript
<ResponsiveContainer aria-label="Revenue vs Target Chart">
  <ComposedChart data={data}>
    {/* Chart content */}
  </ComposedChart>
</ResponsiveContainer>
```

### Keyboard Navigation

- Tab through interactive elements
- Enter to activate buttons
- Arrow keys for date picker

### Screen Reader Support

- Provide text alternatives for charts
- Announce data updates
- Describe chart patterns

## Security Considerations

1. **Data Sanitization**
   - Sanitize all user inputs
   - Validate date ranges
   - Prevent XSS in tooltips

2. **API Authentication**
   - Require admin token
   - Validate permissions
   - Rate limiting

3. **Export Security**
   - Limit file size
   - Validate export format
   - Prevent path traversal

## Deployment Checklist

- [ ] Install dependencies
- [ ] Create chart components
- [ ] Implement API endpoints
- [ ] Add error handling
- [ ] Implement caching
- [ ] Add loading states
- [ ] Test responsive design
- [ ] Test export functionality
- [ ] Add analytics tracking
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Security review
- [ ] Documentation
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production
