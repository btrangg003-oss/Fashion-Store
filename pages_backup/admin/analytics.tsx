import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart, FiUsers, FiPackage } from 'react-icons/fi';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    byPeriod: { period: string; amount: number }[];
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    avgValue: number;
  };
  products: {
    total: number;
    topSelling: { id: string; name: string; sales: number }[];
    lowStock: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    avgLifetimeValue: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const result = await res.json();
      // Add default values to prevent undefined errors
      setData({
        revenue: result.revenue || { total: 0, growth: 0, byPeriod: [] },
        orders: result.orders || { total: 0, completed: 0, pending: 0, cancelled: 0, avgValue: 0 },
        customers: result.customers || { total: 0, new: 0, returning: 0, avgLifetimeValue: 0 },
        products: result.products || { total: 0, lowStock: 0, topSelling: [] }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default empty data on error
      setData({
        revenue: { total: 0, growth: 0, byPeriod: [] },
        orders: { total: 0, completed: 0, pending: 0, cancelled: 0, avgValue: 0 },
        customers: { total: 0, new: 0, returning: 0, avgLifetimeValue: 0 },
        products: { total: 0, lowStock: 0, topSelling: [] }
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <AdminLayout><Loading>Đang tải...</Loading></AdminLayout>;
  if (!data) return <AdminLayout><Loading>Không có dữ liệu</Loading></AdminLayout>;

  return (
    <AdminLayout>
      <Container>
        <Header>
          <PageTitle>Phân Tích & Thống Kê</PageTitle>
          <PeriodSelect value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
          </PeriodSelect>
        </Header>

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
              <MetricValue>{(data.revenue?.total || 0).toLocaleString('vi-VN')} ₫</MetricValue>
              <MetricChange positive={(data.revenue?.growth || 0) > 0}>
                {(data.revenue?.growth || 0) > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {Math.abs(data.revenue?.growth || 0)}%
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
                Hoàn thành: {data.orders.completed} | Đang xử lý: {data.orders.pending}
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
              <MetricLabel>Khách hàng</MetricLabel>
              <MetricValue>{data.customers.total}</MetricValue>
              <MetricSubtext>
                Mới: {data.customers.new} | Quay lại: {data.customers.returning}
              </MetricSubtext>
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
              <MetricSubtext>Sắp hết: {data.products.lowStock}</MetricSubtext>
            </MetricContent>
          </MetricCard>
        </MetricsGrid>

        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Doanh thu theo thời gian</ChartTitle>
            <ChartContent>
              {data.revenue.byPeriod.map((item, index) => (
                <BarItem key={index}>
                  <BarLabel>{item.period}</BarLabel>
                  <BarWrapper>
                    <Bar
                      width={(item.amount / Math.max(...data.revenue.byPeriod.map(p => p.amount))) * 100}
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.amount / Math.max(...data.revenue.byPeriod.map(p => p.amount))) * 100}%` }}
                      transition={{ delay: index * 0.1 }}
                    />
                  </BarWrapper>
                  <BarValue>{item.amount.toLocaleString('vi-VN')} ₫</BarValue>
                </BarItem>
              ))}
            </ChartContent>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Sản phẩm bán chạy</ChartTitle>
            <TopProductsList>
              {data.products.topSelling.slice(0, 5).map((product, index) => (
                <ProductItem key={product.id}>
                  <ProductRank>{index + 1}</ProductRank>
                  <ProductInfo>
                    <ProductName>{product.name}</ProductName>
                    <ProductSales>{product.sales} đã bán</ProductSales>
                  </ProductInfo>
                </ProductItem>
              ))}
            </TopProductsList>
          </ChartCard>
        </ChartsGrid>

        <StatsSection>
          <SectionTitle>Thống kê chi tiết</SectionTitle>
          <StatsGrid>
            <StatBox>
              <StatBoxTitle>Giá trị đơn hàng trung bình</StatBoxTitle>
              <StatBoxValue>{data.orders.avgValue.toLocaleString('vi-VN')} ₫</StatBoxValue>
            </StatBox>
            <StatBox>
              <StatBoxTitle>Giá trị vòng đời khách hàng</StatBoxTitle>
              <StatBoxValue>{data.customers.avgLifetimeValue.toLocaleString('vi-VN')} ₫</StatBoxValue>
            </StatBox>
            <StatBox>
              <StatBoxTitle>Tỷ lệ hoàn thành</StatBoxTitle>
              <StatBoxValue>
                {data.orders.total > 0 ? Math.round((data.orders.completed / data.orders.total) * 100) : 0}%
              </StatBoxValue>
            </StatBox>
            <StatBox>
              <StatBoxTitle>Tỷ lệ hủy đơn</StatBoxTitle>
              <StatBoxValue>
                {data.orders.total > 0 ? Math.round((data.orders.cancelled / data.orders.total) * 100) : 0}%
              </StatBoxValue>
            </StatBox>
          </StatsGrid>
        </StatsSection>
      </Container>
    </AdminLayout>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const PeriodSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
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
`;

const MetricChange = styled.div<{ positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  margin-top: 0.5rem;
`;

const MetricSubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const ChartContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarLabel = styled.div`
  width: 60px;
  font-size: 0.875rem;
  color: #6b7280;
`;

const BarWrapper = styled.div`
  flex: 1;
  height: 24px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
`;

const Bar = styled(motion.div) <{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
`;

const BarValue = styled.div`
  width: 120px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const TopProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const ProductRank = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const ProductSales = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const StatsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const StatBox = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const StatBoxTitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatBoxValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;
