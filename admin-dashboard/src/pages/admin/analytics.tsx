import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiRefreshCw, FiClock } from 'react-icons/fi';
import type { AnalyticsData, AnalyticsAPIResponse, TimeRange } from '@/models/analytics';

// Chart Components
import RevenueTargetChart from '@/components/Admin/Charts/RevenueTargetChart';
import RetentionMarketingChart from '@/components/Admin/Charts/RetentionMarketingChart';
import CustomerDemographicsCharts from '@/components/Admin/Charts/CustomerDemographicsCharts';
import ProductInventoryChart from '@/components/Admin/Charts/ProductInventoryChart';
import OrderStatusChart from '@/components/Admin/Charts/OrderStatusChart';

// Supporting Components
import TimeRangeSelector from '@/components/Admin/Analytics/TimeRangeSelector';
import ExportButtons from '@/components/Admin/Analytics/ExportButtons';
import ChartSkeleton from '@/components/Admin/Analytics/ChartSkeleton';
import EmptyState from '@/components/Admin/Analytics/EmptyState';

export default function AdvancedAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({ type: 'month' });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        timeRange: timeRange.type,
        ...(refresh && { refresh: 'true' })
      });

      const res = await fetch(`/api/admin/analytics?${params}`);
      const result: AnalyticsAPIResponse = await res.json();

      if (result.success && result.data) {
        setData(result.data);
        setLastUpdated(new Date(result.lastUpdated));
      } else {
        throw new Error('Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  // Handle time range change
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    return lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <Container>
        {/* Header */}
        <Header>
          <HeaderLeft>
            <PageTitle>Phân Tích & Thống Kê</PageTitle>
            <LastUpdated>
              <FiClock />
              Cập nhật: {formatLastUpdated()}
            </LastUpdated>
          </HeaderLeft>
          <HeaderRight>
            <RefreshButton onClick={handleRefresh} disabled={refreshing}>
              <FiRefreshCw className={refreshing ? 'spinning' : ''} />
              {refreshing ? 'Đang tải...' : 'Làm mới'}
            </RefreshButton>
            <TimeRangeSelector value={timeRange} onChange={handleTimeRangeChange} />
            <ExportButtons data={data} timeRange={timeRange} />
          </HeaderRight>
        </Header>

        {/* Error State */}
        {error && (
          <ErrorBanner>
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorText>{error}</ErrorText>
            <ErrorButton onClick={() => fetchAnalytics()}>Thử lại</ErrorButton>
          </ErrorBanner>
        )}

        {/* KPI Cards */}
        {loading && !data ? (
          <MetricsGrid>
            {[...Array(4)].map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </MetricsGrid>
        ) : data ? (
          <MetricsGrid>
            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MetricIcon color="#10b981">
                <FiDollarSign />
              </MetricIcon>
              <MetricContent>
                <MetricLabel>Doanh thu</MetricLabel>
                <MetricValue>{data.revenue.total.toLocaleString('vi-VN')} ₫</MetricValue>
                <MetricChange positive={data.revenue.growth > 0}>
                  {data.revenue.growth > 0 ? '↑' : '↓'} {Math.abs(data.revenue.growth)}%
                </MetricChange>
              </MetricContent>
            </MetricCard>

            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MetricIcon color="#3b82f6">
                <FiShoppingCart />
              </MetricIcon>
              <MetricContent>
                <MetricLabel>Đơn hàng</MetricLabel>
                <MetricValue>{data.orders.total}</MetricValue>
                <MetricSubtext>
                  {data.orders.byWeek.reduce((sum, w) => sum + w.delivered, 0)} hoàn thành
                </MetricSubtext>
              </MetricContent>
            </MetricCard>

            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MetricIcon color="#8b5cf6">
                <FiUsers />
              </MetricIcon>
              <MetricContent>
                <MetricLabel>Retention Rate</MetricLabel>
                <MetricValue>{data.retention.rate}%</MetricValue>
                <MetricSubtext>Khách hàng quay lại</MetricSubtext>
              </MetricContent>
            </MetricCard>

            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <MetricIcon color="#f59e0b">
                <FiPackage />
              </MetricIcon>
              <MetricContent>
                <MetricLabel>Sản phẩm</MetricLabel>
                <MetricValue>{data.products.total}</MetricValue>
                <MetricSubtext>
                  {data.products.categories.find(c => c.category === 'hot')?.count || 0} bán chạy
                </MetricSubtext>
              </MetricContent>
            </MetricCard>
          </MetricsGrid>
        ) : null}

        {/* Charts Grid */}
        <ChartsGrid>
          {/* Revenue vs Target Chart */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ChartHeader>
              <ChartTitle>Doanh Thu vs Mục Tiêu</ChartTitle>
              <ChartSubtitle>So sánh doanh thu thực tế với mục tiêu</ChartSubtitle>
            </ChartHeader>
            {loading && !data ? (
              <ChartSkeleton variant="line" />
            ) : data && data.revenue.byPeriod.length > 0 ? (
              <RevenueTargetChart data={data.revenue.byPeriod} />
            ) : (
              <EmptyState onRefresh={handleRefresh} />
            )}
          </ChartCard>

          {/* Retention & Marketing Chart */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChartHeader>
              <ChartTitle>Retention & Marketing ROI</ChartTitle>
              <ChartSubtitle>Đánh giá hiệu quả marketing</ChartSubtitle>
            </ChartHeader>
            {loading && !data ? (
              <ChartSkeleton variant="bar" />
            ) : data && data.retention.byMonth.length > 0 ? (
              <RetentionMarketingChart data={data.retention.byMonth} />
            ) : (
              <EmptyState onRefresh={handleRefresh} />
            )}
          </ChartCard>

          {/* Customer Demographics Charts */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ChartHeader>
              <ChartTitle>Phân Bố Khách Hàng</ChartTitle>
              <ChartSubtitle>Theo độ tuổi và giới tính</ChartSubtitle>
            </ChartHeader>
            {loading && !data ? (
              <ChartSkeleton variant="pie" />
            ) : data ? (
              <CustomerDemographicsCharts
                ageData={data.demographics.age}
                genderData={data.demographics.gender}
              />
            ) : (
              <EmptyState onRefresh={handleRefresh} />
            )}
          </ChartCard>

          {/* Product Inventory Chart */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <ChartHeader>
              <ChartTitle>Quản Lý Sản Phẩm & Tồn Kho</ChartTitle>
              <ChartSubtitle>Phân loại sản phẩm theo mức độ bán</ChartSubtitle>
            </ChartHeader>
            {loading && !data ? (
              <ChartSkeleton variant="pie" />
            ) : data && data.products.categories.length > 0 ? (
              <ProductInventoryChart data={data.products.categories} />
            ) : (
              <EmptyState onRefresh={handleRefresh} />
            )}
          </ChartCard>

          {/* Order Status Chart - Full Width */}
          <ChartCardFullWidth
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <ChartHeader>
              <ChartTitle>Đơn Hàng Theo Thời Gian & Trạng Thái</ChartTitle>
              <ChartSubtitle>Theo dõi số lượng và tỷ lệ trạng thái đơn hàng</ChartSubtitle>
            </ChartHeader>
            {loading && !data ? (
              <ChartSkeleton variant="bar" height={400} />
            ) : data && data.orders.byWeek.length > 0 ? (
              <OrderStatusChart data={data.orders.byWeek} />
            ) : (
              <EmptyState onRefresh={handleRefresh} />
            )}
          </ChartCardFullWidth>
        </ChartsGrid>
      </Container>
    </AdminLayout>
  );
}

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;

  svg {
    font-size: 14px;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    font-size: 16px;
    
    &.spinning {
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #667eea;
    color: #667eea;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const ErrorIcon = styled.div`
  font-size: 24px;
`;

const ErrorText = styled.div`
  flex: 1;
  color: #991b1b;
  font-size: 0.875rem;
`;

const ErrorButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #ef4444;
  border-radius: 6px;
  background: white;
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #ef4444;
    color: white;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const MetricCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const MetricCardSkeleton = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: 120px;
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const MetricIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
`;

const MetricChange = styled.div<{ positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  margin-top: 0.5rem;
  font-weight: 600;
`;

const MetricSubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ChartCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ChartCardFullWidth = styled(motion.div)`
  grid-column: 1 / -1;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ChartHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;
