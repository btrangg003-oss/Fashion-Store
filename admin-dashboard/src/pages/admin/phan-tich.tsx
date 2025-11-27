import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart, 
  FiUsers, FiPackage, FiBarChart2, FiPieChart, FiCalendar,
  FiDownload, FiRefreshCw, FiFilter
} from 'react-icons/fi';

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  trend: 'up' | 'down';
}

interface TopCategory {
  name: string;
  value: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: { current: 0, previous: 0, change: 0 },
    orders: { current: 0, previous: 0, change: 0 },
    customers: { current: 0, previous: 0, change: 0 },
    products: { current: 0, previous: 0, change: 0 },
    avgOrderValue: { current: 0, previous: 0, change: 0 },
    conversionRate: { current: 0, previous: 0, change: 0 }
  });

  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        const { metrics, topProducts: products, categoryDistribution, revenueByDay } = result.data;
        
        setStats({
          revenue: metrics.revenue,
          orders: metrics.orders,
          customers: metrics.customers,
          products: metrics.productsSold,
          avgOrderValue: metrics.avgOrderValue,
          conversionRate: { current: 3.2, previous: 2.8, change: 14.3 } // Mock for now
        });

        setTopProducts(products.map((p: any) => ({
          name: p.name,
          sales: p.quantity,
          revenue: p.revenue,
          trend: 'up'
        })));

        setTopCategories(categoryDistribution.map((c: any) => ({
          name: c.name,
          value: Math.round(c.percentage),
          revenue: c.revenue
        })));

        // Get recent orders from API
        const ordersRes = await fetch('/api/orders');
        const ordersData = await ordersRes.json();
        const orders = ordersData.data || [];
        
        setRecentOrders(orders.slice(0, 5).map((o: any) => ({
          id: o.orderNumber,
          customer: o.customerName || 'Khách hàng',
          amount: o.total,
          status: o.status,
          date: o.createdAt
        })));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? '#10b981' : '#ef4444';
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>📊 Phân Tích & Báo Cáo</Title>
            <Subtitle>Tổng quan hiệu suất kinh doanh</Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <TimeRangeSelect value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
              <option value="year">Năm nay</option>
            </TimeRangeSelect>
            <IconButton onClick={loadAnalytics} title="Làm mới">
              <FiRefreshCw />
            </IconButton>
            <ExportButton>
              <FiDownload /> Xuất báo cáo
            </ExportButton>
          </HeaderRight>
        </Header>

        {loading ? (
          <LoadingState>Đang tải dữ liệu...</LoadingState>
        ) : (
          <>
            {/* Key Metrics */}
            <MetricsGrid>
              <MetricCard>
                <MetricIcon color="#3b82f6">
                  <FiDollarSign />
                </MetricIcon>
                <MetricContent>
                  <MetricLabel>Doanh thu</MetricLabel>
                  <MetricValue>{formatCurrency(stats?.revenue?.current || 0)}</MetricValue>
                  <MetricChange color={getChangeColor(stats?.revenue?.change || 0)}>
                    {getChangeIcon(stats?.revenue?.change || 0)}
                    {(stats?.revenue?.change || 0) > 0 ? '+' : ''}{stats?.revenue?.change || 0}% so với kỳ trước
                  </MetricChange>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <MetricIcon color="#10b981">
                  <FiShoppingCart />
                </MetricIcon>
                <MetricContent>
                  <MetricLabel>Đơn hàng</MetricLabel>
                  <MetricValue>{formatNumber(stats?.orders?.current || 0)}</MetricValue>
                  <MetricChange color={getChangeColor(stats?.orders?.change || 0)}>
                    {getChangeIcon(stats?.orders?.change || 0)}
                    {(stats?.orders?.change || 0) > 0 ? '+' : ''}{stats?.orders?.change || 0}% so với kỳ trước
                  </MetricChange>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <MetricIcon color="#f59e0b">
                  <FiUsers />
                </MetricIcon>
                <MetricContent>
                  <MetricLabel>Khách hàng</MetricLabel>
                  <MetricValue>{formatNumber(stats?.customers?.current || 0)}</MetricValue>
                  <MetricChange color={getChangeColor(stats?.customers?.change || 0)}>
                    {getChangeIcon(stats?.customers?.change || 0)}
                    {(stats?.customers?.change || 0) > 0 ? '+' : ''}{stats?.customers?.change || 0}% so với kỳ trước
                  </MetricChange>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <MetricIcon color="#8b5cf6">
                  <FiPackage />
                </MetricIcon>
                <MetricContent>
                  <MetricLabel>Sản phẩm bán</MetricLabel>
                  <MetricValue>{formatNumber(stats?.products?.current || 0)}</MetricValue>
                  <MetricChange color={getChangeColor(stats?.products?.change || 0)}>
                    {getChangeIcon(stats?.products?.change || 0)}
                    {(stats?.products?.change || 0) > 0 ? '+' : ''}{stats?.products?.change || 0}% so với kỳ trước
                  </MetricChange>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <MetricIcon color="#06b6d4">
                  <FiBarChart2 />
                </MetricIcon>
                <MetricContent>
                  <MetricLabel>Giá trị đơn TB</MetricLabel>
                  <MetricValue>{formatCurrency(stats?.avgOrderValue?.current || 0)}</MetricValue>
                  <MetricChange color={getChangeColor(stats?.avgOrderValue?.change || 0)}>
                    {getChangeIcon(stats?.avgOrderValue?.change || 0)}
                    {(stats?.avgOrderValue?.change || 0) > 0 ? '+' : ''}{stats?.avgOrderValue?.change || 0}% so với kỳ trước
                  </MetricChange>
                </MetricContent>
              </MetricCard>

              <MetricCard>
                <MetricIcon color="#ec4899">
                  <FiPieChart />
                </MetricIcon>
                <MetricContent>
                  <MetricLabel>Tỷ lệ chuyển đổi</MetricLabel>
                  <MetricValue>{stats?.conversionRate?.current || 0}%</MetricValue>
                  <MetricChange color={getChangeColor(stats?.conversionRate?.change || 0)}>
                    {getChangeIcon(stats?.conversionRate?.change || 0)}
                    {(stats?.conversionRate?.change || 0) > 0 ? '+' : ''}{stats?.conversionRate?.change || 0}% so với kỳ trước
                  </MetricChange>
                </MetricContent>
              </MetricCard>
            </MetricsGrid>

            {/* Charts Section */}
            <ChartsGrid>
              <ChartCard>
                <CardHeader>
                  <CardTitle>📈 Doanh thu theo thời gian</CardTitle>
                  <CardActions>
                    <SmallButton><FiFilter /></SmallButton>
                  </CardActions>
                </CardHeader>
                <RevenueChart>
                  <svg width="100%" height="300" viewBox="0 0 800 300">
                    {/* Grid lines */}
                    <line x1="50" y1="250" x2="750" y2="250" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="200" x2="750" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="150" x2="750" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="100" x2="750" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="50" x2="750" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Y-axis labels */}
                    <text x="40" y="255" fontSize="12" fill="#6b7280" textAnchor="end">0</text>
                    <text x="40" y="205" fontSize="12" fill="#6b7280" textAnchor="end">25M</text>
                    <text x="40" y="155" fontSize="12" fill="#6b7280" textAnchor="end">50M</text>
                    <text x="40" y="105" fontSize="12" fill="#6b7280" textAnchor="end">75M</text>
                    <text x="40" y="55" fontSize="12" fill="#6b7280" textAnchor="end">100M</text>
                    
                    {/* Line chart */}
                    <polyline
                      points="50,220 150,180 250,200 350,140 450,160 550,100 650,120 750,80"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Area fill */}
                    <polygon
                      points="50,220 150,180 250,200 350,140 450,160 550,100 650,120 750,80 750,250 50,250"
                      fill="url(#gradient)"
                      opacity="0.3"
                    />
                    
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Data points */}
                    <circle cx="50" cy="220" r="4" fill="#3b82f6" />
                    <circle cx="150" cy="180" r="4" fill="#3b82f6" />
                    <circle cx="250" cy="200" r="4" fill="#3b82f6" />
                    <circle cx="350" cy="140" r="4" fill="#3b82f6" />
                    <circle cx="450" cy="160" r="4" fill="#3b82f6" />
                    <circle cx="550" cy="100" r="4" fill="#3b82f6" />
                    <circle cx="650" cy="120" r="4" fill="#3b82f6" />
                    <circle cx="750" cy="80" r="4" fill="#3b82f6" />
                    
                    {/* X-axis labels */}
                    <text x="50" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">T2</text>
                    <text x="150" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">T3</text>
                    <text x="250" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">T4</text>
                    <text x="350" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">T5</text>
                    <text x="450" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">T6</text>
                    <text x="550" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">T7</text>
                    <text x="650" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">CN</text>
                    <text x="750" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">T2</text>
                  </svg>
                </RevenueChart>
              </ChartCard>

              <ChartCard>
                <CardHeader>
                  <CardTitle>🥧 Phân bố danh mục</CardTitle>
                </CardHeader>
                <PieChartContainer>
                  <svg width="280" height="280" viewBox="0 0 280 280">
                    {/* Pie chart slices */}
                    <circle cx="140" cy="140" r="100" fill="#3b82f6" />
                    <path d="M 140 140 L 140 40 A 100 100 0 0 1 240 140 Z" fill="#10b981" />
                    <path d="M 140 140 L 240 140 A 100 100 0 0 1 190 215 Z" fill="#f59e0b" />
                    <path d="M 140 140 L 190 215 A 100 100 0 0 1 90 215 Z" fill="#ef4444" />
                    
                    {/* Center circle for donut effect */}
                    <circle cx="140" cy="140" r="60" fill="white" />
                    
                    {/* Center text */}
                    <text x="140" y="135" fontSize="24" fontWeight="700" fill="#111827" textAnchor="middle">100%</text>
                    <text x="140" y="155" fontSize="12" fill="#6b7280" textAnchor="middle">Tổng</text>
                  </svg>
                  <PieLegend>
                    {topCategories.map((cat, index) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
                      return (
                        <LegendItem key={index}>
                          <LegendColor color={colors[index]} />
                          <LegendText>
                            <LegendName>{cat.name}</LegendName>
                            <LegendValue>{cat.value}% • {formatCurrency(cat.revenue)}</LegendValue>
                          </LegendText>
                        </LegendItem>
                      );
                    })}
                  </PieLegend>
                </PieChartContainer>
              </ChartCard>
            </ChartsGrid>
            
            {/* Additional Charts */}
            <ChartsGrid>
              <ChartCard>
                <CardHeader>
                  <CardTitle>📊 So sánh theo tháng</CardTitle>
                </CardHeader>
                <BarChart>
                  <svg width="100%" height="250" viewBox="0 0 800 250">
                    {/* Grid */}
                    <line x1="50" y1="200" x2="750" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Bars */}
                    <rect x="80" y="120" width="60" height="80" fill="#3b82f6" rx="4" />
                    <rect x="180" y="100" width="60" height="100" fill="#3b82f6" rx="4" />
                    <rect x="280" y="80" width="60" height="120" fill="#3b82f6" rx="4" />
                    <rect x="380" y="60" width="60" height="140" fill="#10b981" rx="4" />
                    <rect x="480" y="90" width="60" height="110" fill="#3b82f6" rx="4" />
                    <rect x="580" y="70" width="60" height="130" fill="#3b82f6" rx="4" />
                    <rect x="680" y="50" width="60" height="150" fill="#10b981" rx="4" />
                    
                    {/* Values on bars */}
                    <text x="110" y="110" fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">40M</text>
                    <text x="210" y="90" fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">50M</text>
                    <text x="310" y="70" fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">60M</text>
                    <text x="410" y="50" fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">70M</text>
                    <text x="510" y="80" fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">55M</text>
                    <text x="610" y="60" fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">65M</text>
                    <text x="710" y="40" fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">75M</text>
                    
                    {/* Labels */}
                    <text x="110" y="225" fontSize="12" fill="#6b7280" textAnchor="middle">T6</text>
                    <text x="210" y="225" fontSize="12" fill="#6b7280" textAnchor="middle">T7</text>
                    <text x="310" y="225" fontSize="12" fill="#6b7280" textAnchor="middle">T8</text>
                    <text x="410" y="225" fontSize="12" fill="#6b7280" textAnchor="middle">T9</text>
                    <text x="510" y="225" fontSize="12" fill="#6b7280" textAnchor="middle">T10</text>
                    <text x="610" y="225" fontSize="12" fill="#6b7280" textAnchor="middle">T11</text>
                    <text x="710" y="225" fontSize="12" fill="#6b7280" textAnchor="middle">T12</text>
                  </svg>
                </BarChart>
              </ChartCard>

              <ChartCard>
                <CardHeader>
                  <CardTitle>📈 Tăng trưởng khách hàng</CardTitle>
                </CardHeader>
                <GrowthChart>
                  <svg width="100%" height="250" viewBox="0 0 400 250">
                    {/* Grid */}
                    <line x1="30" y1="200" x2="370" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="30" y1="150" x2="370" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="30" y1="100" x2="370" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="30" y1="50" x2="370" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Area chart */}
                    <polygon
                      points="30,180 80,160 130,140 180,120 230,100 280,80 330,60 370,50 370,200 30,200"
                      fill="url(#growthGradient)"
                    />
                    
                    {/* Line */}
                    <polyline
                      points="30,180 80,160 130,140 180,120 230,100 280,80 330,60 370,50"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    
                    <defs>
                      <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Points */}
                    <circle cx="30" cy="180" r="4" fill="#10b981" />
                    <circle cx="80" cy="160" r="4" fill="#10b981" />
                    <circle cx="130" cy="140" r="4" fill="#10b981" />
                    <circle cx="180" cy="120" r="4" fill="#10b981" />
                    <circle cx="230" cy="100" r="4" fill="#10b981" />
                    <circle cx="280" cy="80" r="4" fill="#10b981" />
                    <circle cx="330" cy="60" r="4" fill="#10b981" />
                    <circle cx="370" cy="50" r="4" fill="#10b981" />
                    
                    {/* Labels */}
                    <text x="30" y="225" fontSize="11" fill="#6b7280" textAnchor="middle">T6</text>
                    <text x="130" y="225" fontSize="11" fill="#6b7280" textAnchor="middle">T8</text>
                    <text x="230" y="225" fontSize="11" fill="#6b7280" textAnchor="middle">T10</text>
                    <text x="330" y="225" fontSize="11" fill="#6b7280" textAnchor="middle">T12</text>
                  </svg>
                </GrowthChart>
              </ChartCard>
            </ChartsGrid>

            {/* Top Products & Recent Orders */}
            <DataGrid>
              <DataCard>
                <CardHeader>
                  <CardTitle>🏆 Sản phẩm bán chạy</CardTitle>
                  <ViewAllLink>Xem tất cả →</ViewAllLink>
                </CardHeader>
                <ProductList>
                  {topProducts.map((product, index) => (
                    <ProductItem key={index}>
                      <ProductRank>#{index + 1}</ProductRank>
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductStats>
                          {product.sales} đã bán • {formatCurrency(product.revenue)}
                        </ProductStats>
                      </ProductInfo>
                      <ProductTrend trend={product.trend}>
                        {product.trend === 'up' ? '📈' : '📉'}
                      </ProductTrend>
                    </ProductItem>
                  ))}
                </ProductList>
              </DataCard>

              <DataCard>
                <CardHeader>
                  <CardTitle>🛒 Đơn hàng gần đây</CardTitle>
                  <ViewAllLink>Xem tất cả →</ViewAllLink>
                </CardHeader>
                <OrderList>
                  {recentOrders.map((order, index) => (
                    <OrderItem key={index}>
                      <OrderInfo>
                        <OrderId>{order.id}</OrderId>
                        <OrderCustomer>{order.customer}</OrderCustomer>
                      </OrderInfo>
                      <OrderAmount>{formatCurrency(order.amount)}</OrderAmount>
                      <OrderStatus status={order.status}>
                        {order.status === 'completed' ? '✅' : '⏳'}
                      </OrderStatus>
                    </OrderItem>
                  ))}
                </OrderList>
              </DataCard>
            </DataGrid>

            {/* Additional Insights */}
            <InsightsSection>
              <SectionTitle>💡 Thông tin chi tiết</SectionTitle>
              <InsightsGrid>
                <InsightCard>
                  <InsightIcon>🎯</InsightIcon>
                  <InsightTitle>Mục tiêu tháng này</InsightTitle>
                  <InsightValue>85%</InsightValue>
                  <InsightProgress>
                    <ProgressBar>
                      <ProgressFill width={85} color="#10b981" />
                    </ProgressBar>
                  </InsightProgress>
                  <InsightText>Đã đạt 85/100 triệu</InsightText>
                </InsightCard>

                <InsightCard>
                  <InsightIcon>⭐</InsightIcon>
                  <InsightTitle>Đánh giá trung bình</InsightTitle>
                  <InsightValue>4.8/5.0</InsightValue>
                  <InsightText>Từ 234 đánh giá</InsightText>
                </InsightCard>

                <InsightCard>
                  <InsightIcon>📦</InsightIcon>
                  <InsightTitle>Tồn kho</InsightTitle>
                  <InsightValue>1,234</InsightValue>
                  <InsightText>Sản phẩm trong kho</InsightText>
                </InsightCard>

                <InsightCard>
                  <InsightIcon>⚠️</InsightIcon>
                  <InsightTitle>Cảnh báo</InsightTitle>
                  <InsightValue>12</InsightValue>
                  <InsightText>Sản phẩm sắp hết</InsightText>
                </InsightCard>
              </InsightsGrid>
            </InsightsSection>
          </>
        )}
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div``;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

const TimeRangeSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 18px;
  color: #6b7280;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const MetricIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const MetricChange = styled.div<{ color: string }>`
  font-size: 13px;
  color: ${props => props.color};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    font-size: 16px;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SmallButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
`;

const ChartIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ChartText = styled.div`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const ChartHint = styled.div`
  font-size: 13px;
  color: #9ca3af;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CategoryInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CategoryName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const CategoryValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number; color?: string }>`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.color || '#3b82f6'};
  transition: width 0.3s;
`;

const CategoryRevenue = styled.div`
  font-size: 13px;
  color: #6b7280;
  text-align: right;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const DataCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ViewAllLink = styled.a`
  font-size: 14px;
  color: #3b82f6;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ProductRank = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
`;

const ProductStats = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const ProductTrend = styled.div<{ trend: string }>`
  font-size: 20px;
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
  font-family: 'Courier New', monospace;
  margin-bottom: 4px;
`;

const OrderCustomer = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const OrderAmount = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const OrderStatus = styled.div<{ status: string }>`
  font-size: 18px;
`;

const InsightsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px 0;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const InsightCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const InsightIcon = styled.div`
  font-size: 40px;
  margin-bottom: 12px;
`;

const InsightTitle = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const InsightValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
`;

const InsightProgress = styled.div`
  margin-bottom: 12px;
`;

const InsightText = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

export default AnalyticsPage;

// Chart Components
const RevenueChart = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const PieChartContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PieLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const LegendText = styled.div`
  flex: 1;
`;

const LegendName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
`;

const LegendValue = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const BarChart = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
`;

const BarItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Bar = styled.div<{ height: number; color?: string }>`
  width: 100%;
  height: ${props => props.height}%;
  background: ${props => props.color || '#3b82f6'};
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  position: relative;
  
  &:hover {
    opacity: 0.8;
    transform: translateY(-4px);
  }
`;

const BarLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const GrowthChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
`;

const GrowthItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const GrowthLabel = styled.div`
  width: 100px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
`;

const GrowthBar = styled.div`
  flex: 1;
  height: 32px;
  background: #f3f4f6;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
`;

const GrowthFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background: ${props => props.color};
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
`;

const GrowthValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: white;
`;
