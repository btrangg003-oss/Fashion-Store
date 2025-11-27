import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import LineChart from '@/components/Admin/LineChart';
import PieChart from '@/components/Admin/PieChart';
import { useAuth } from '@/contexts/AuthContext';
import { FiTrendingUp, FiShoppingCart, FiUsers, FiPackage, FiActivity, FiClock, FiStar, FiBell, FiCalendar, FiTarget } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes, statsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products'),
        fetch('/api/admin/dashboard-stats')
      ]);
      
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const statsData = await statsRes.json();
      
      const orders = ordersData.data || [];
      const products = productsData.data || [];
      
      setRecentOrders(orders.slice(0, 5));
      setDashboardStats(statsData.stats);
      
      const totalRevenue = orders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + o.total, 0);
      
      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue,
        totalCustomers: new Set(orders.map((o: any) => o.userId)).size,
        lowStock: products.filter((p: any) => p.stock < 10).length
      });

      // Prepare chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      const revenueByDay = last7Days.map(date => {
        const dayOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString() && o.status === 'delivered';
        });
        return {
          label: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
          value: dayOrders.reduce((sum: number, o: any) => sum + o.total, 0) / 1000000
        };
      });

      // Top products data
      const productSales: any = {};
      orders.forEach((order: any) => {
        if (order.status === 'delivered') {
          order.items?.forEach((item: any) => {
            if (!productSales[item.name]) {
              productSales[item.name] = 0;
            }
            productSales[item.name] += item.quantity;
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .sort((a: any, b: any) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, value]: any, index) => ({
          label: name,
          value,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]
        }));

      setChartData({
        revenue: revenueByDay,
        products: topProducts
      });

      // Generate activity feed
      const recentActivities = orders.slice(0, 8).map((order: any) => ({
        id: order.id,
        type: 'order',
        message: `Đơn hàng #${order.orderNumber} - ${order.customerName || 'Khách hàng'}`,
        time: order.createdAt,
        status: order.status
      }));
      setActivities(recentActivities);

      // Calculate top customers
      const customerSpending: any = {};
      orders.forEach((order: any) => {
        if (order.status === 'delivered' && order.userId) {
          if (!customerSpending[order.userId]) {
            customerSpending[order.userId] = {
              name: order.customerName || 'Khách hàng',
              email: order.email || '',
              total: 0,
              orders: 0
            };
          }
          customerSpending[order.userId].total += order.total;
          customerSpending[order.userId].orders += 1;
        }
      });

      const topCustomersList = Object.values(customerSpending)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5);
      setTopCustomers(topCustomersList);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <ResponsiveAdminLayout>
        <LoadingContainer>Đang tải...</LoadingContainer>
      </ResponsiveAdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Dashboard</Title>
          <Subtitle>Chào mừng trở lại, {user?.firstName || 'Admin'}!</Subtitle>
        </Header>

        {/* Stats Cards */}
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatIcon color="#3b82f6">
              <FiShoppingCart />
            </StatIcon>
            <StatContent>
              <StatLabel>Đơn hàng hôm nay</StatLabel>
              <StatValue>{dashboardStats?.todayOrders || 0}</StatValue>
              <StatChange positive={parseFloat(dashboardStats?.orderChange || '0') > 0}>
                {dashboardStats?.orderChange > 0 ? '+' : ''}{dashboardStats?.orderChange || 0}% so với hôm qua
              </StatChange>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatIcon color="#10b981">
              <FiTrendingUp />
            </StatIcon>
            <StatContent>
              <StatLabel>Doanh thu hôm nay</StatLabel>
              <StatValue>{((dashboardStats?.todayRevenue || 0) / 1000000).toFixed(1)}M</StatValue>
              <StatChange positive={parseFloat(dashboardStats?.revenueChange || '0') > 0}>
                {dashboardStats?.revenueChange > 0 ? '+' : ''}{dashboardStats?.revenueChange || 0}% so với hôm qua
              </StatChange>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatIcon color="#f59e0b">
              <FiPackage />
            </StatIcon>
            <StatContent>
              <StatLabel>Sản phẩm</StatLabel>
              <StatValue>{dashboardStats?.totalProducts || 0}</StatValue>
              <StatChange warning>{dashboardStats?.lowStockCount || 0} sắp hết hàng</StatChange>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatIcon color="#8b5cf6">
              <FiUsers />
            </StatIcon>
            <StatContent>
              <StatLabel>Khách hàng</StatLabel>
              <StatValue>{dashboardStats?.totalCustomers || 0}</StatValue>
              <StatChange positive>+{dashboardStats?.newCustomersThisMonth || 0} khách mới tháng này</StatChange>
            </StatContent>
          </StatCard>
        </StatsGrid>

        {/* Additional Stats Row */}
        <AdditionalStatsGrid>
          <MiniStatCard>
            <MiniStatLabel>Tỷ lệ chuyển đổi</MiniStatLabel>
            <MiniStatValue>{dashboardStats?.conversionRate || 0}%</MiniStatValue>
            <MiniStatTrend positive>Tốt</MiniStatTrend>
          </MiniStatCard>
          <MiniStatCard>
            <MiniStatLabel>Giá trị đơn TB</MiniStatLabel>
            <MiniStatValue>{((dashboardStats?.avgOrderValue || 0) / 1000).toFixed(0)}K</MiniStatValue>
            <MiniStatTrend positive>Ổn định</MiniStatTrend>
          </MiniStatCard>
          <MiniStatCard>
            <MiniStatLabel>Đơn chờ xử lý</MiniStatLabel>
            <MiniStatValue>{dashboardStats?.pendingOrders || 0}</MiniStatValue>
            <MiniStatTrend warning>Cần xử lý</MiniStatTrend>
          </MiniStatCard>
          <MiniStatCard>
            <MiniStatLabel>Hết hàng</MiniStatLabel>
            <MiniStatValue>{dashboardStats?.outOfStockCount || 0}</MiniStatValue>
            <MiniStatTrend warning>Cần nhập</MiniStatTrend>
          </MiniStatCard>
        </AdditionalStatsGrid>

        {/* Charts Grid */}
        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Doanh thu 7 ngày qua</ChartTitle>
            <ChartSubtitle>Doanh thu (triệu đồng)</ChartSubtitle>
            {chartData?.revenue && (
              <LineChart data={chartData.revenue} color="#3b82f6" height={250} />
            )}
          </ChartCard>

          <ChartCard>
            <ChartTitle>Top sản phẩm bán chạy</ChartTitle>
            {chartData?.products && chartData.products.length > 0 && (
              <PieChart data={chartData.products} size={280} />
            )}
          </ChartCard>
        </ChartsGrid>

        {/* Recent Orders */}
        <RecentOrdersSection>
          <SectionHeader>
            <SectionTitle>Đơn hàng gần đây</SectionTitle>
            <ViewAllLink onClick={() => router.push('/admin/orders')}>
              Xem tất cả →
            </ViewAllLink>
          </SectionHeader>
          
          {recentOrders.length > 0 ? (
            <OrdersTable>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td><OrderId>#{order.orderNumber}</OrderId></td>
                    <td>{order.customerName || 'N/A'}</td>
                    <td>{order.items?.length || 0} sản phẩm</td>
                    <td><Amount>{order.total.toLocaleString('vi-VN')} ₫</Amount></td>
                    <td>
                      <StatusBadge status={order.status}>
                        {getStatusText(order.status)}
                      </StatusBadge>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </OrdersTable>
          ) : (
            <EmptyState>Chưa có đơn hàng nào</EmptyState>
          )}
        </RecentOrdersSection>

        {/* Alerts & Inventory Overview */}
        <TwoColumnGrid>
          <AlertsSection>
            <SectionHeader>
              <SectionTitle>⚠️ Cảnh báo</SectionTitle>
              <ViewAllLink onClick={() => router.push('/admin/inventory/alerts')}>
                Xem tất cả →
              </ViewAllLink>
            </SectionHeader>
            <AlertsList>
              {dashboardStats?.lowStockCount > 0 && (
                <AlertItem severity="high">
                  <AlertIcon severity="high">🔴</AlertIcon>
                  <AlertContent>
                    <AlertTitle>{dashboardStats.lowStockCount} sản phẩm sắp hết hàng</AlertTitle>
                    <AlertTime>Cần nhập thêm ngay</AlertTime>
                  </AlertContent>
                </AlertItem>
              )}
              {dashboardStats?.outOfStockCount > 0 && (
                <AlertItem severity="high">
                  <AlertIcon severity="high">🔴</AlertIcon>
                  <AlertContent>
                    <AlertTitle>{dashboardStats.outOfStockCount} sản phẩm hết hàng</AlertTitle>
                    <AlertTime>Cần nhập gấp</AlertTime>
                  </AlertContent>
                </AlertItem>
              )}
              {dashboardStats?.pendingOrders > 0 && (
                <AlertItem severity="low">
                  <AlertIcon severity="low">🔵</AlertIcon>
                  <AlertContent>
                    <AlertTitle>{dashboardStats.pendingOrders} đơn hàng chờ xử lý</AlertTitle>
                    <AlertTime>Cần xử lý</AlertTime>
                  </AlertContent>
                </AlertItem>
              )}
            </AlertsList>
          </AlertsSection>

          <InventorySection>
            <SectionHeader>
              <SectionTitle>📦 Tổng quan kho</SectionTitle>
              <ViewAllLink onClick={() => router.push('/admin/inventory/stock')}>
                Xem chi tiết →
              </ViewAllLink>
            </SectionHeader>
            <InventoryStats>
              <InventoryStat>
                <InventoryStatLabel>Tổng tồn kho</InventoryStatLabel>
                <InventoryStatValue>{dashboardStats?.totalProducts || 0}</InventoryStatValue>
                <InventoryStatBar>
                  <InventoryStatFill width={100} color="#10b981" />
                </InventoryStatBar>
              </InventoryStat>
              <InventoryStat>
                <InventoryStatLabel>Sắp hết hàng</InventoryStatLabel>
                <InventoryStatValue>{dashboardStats?.lowStockCount || 0}</InventoryStatValue>
                <InventoryStatBar>
                  <InventoryStatFill 
                    width={dashboardStats?.totalProducts > 0 ? (dashboardStats.lowStockCount / dashboardStats.totalProducts) * 100 : 0} 
                    color="#f59e0b" 
                  />
                </InventoryStatBar>
              </InventoryStat>
              <InventoryStat>
                <InventoryStatLabel>Hết hàng</InventoryStatLabel>
                <InventoryStatValue>{dashboardStats?.outOfStockCount || 0}</InventoryStatValue>
                <InventoryStatBar>
                  <InventoryStatFill 
                    width={dashboardStats?.totalProducts > 0 ? (dashboardStats.outOfStockCount / dashboardStats.totalProducts) * 100 : 0} 
                    color="#ef4444" 
                  />
                </InventoryStatBar>
              </InventoryStat>
            </InventoryStats>
          </InventorySection>
        </TwoColumnGrid>

        {/* Performance Metrics & Sales Funnel */}
        <TwoColumnGrid>
          <PerformanceSection>
            <SectionHeader>
              <SectionTitle>📊 Hiệu suất</SectionTitle>
            </SectionHeader>
            <PerformanceMetrics>
              <PerformanceMetric>
                <MetricIcon color="#3b82f6"><FiTarget /></MetricIcon>
                <MetricContent>
                  <MetricLabel>Mục tiêu tháng</MetricLabel>
                  <MetricValue>78%</MetricValue>
                  <MetricProgress>
                    <MetricProgressBar width={78} color="#3b82f6" />
                  </MetricProgress>
                  <MetricSubtext>234M / 300M</MetricSubtext>
                </MetricContent>
              </PerformanceMetric>
              <PerformanceMetric>
                <MetricIcon color="#10b981"><FiActivity /></MetricIcon>
                <MetricContent>
                  <MetricLabel>Tỷ lệ hoàn thành</MetricLabel>
                  <MetricValue>94.2%</MetricValue>
                  <MetricProgress>
                    <MetricProgressBar width={94} color="#10b981" />
                  </MetricProgress>
                  <MetricSubtext>1,234 / 1,310 đơn</MetricSubtext>
                </MetricContent>
              </PerformanceMetric>
              <PerformanceMetric>
                <MetricIcon color="#f59e0b"><FiClock /></MetricIcon>
                <MetricContent>
                  <MetricLabel>Thời gian xử lý TB</MetricLabel>
                  <MetricValue>2.4h</MetricValue>
                  <MetricProgress>
                    <MetricProgressBar width={65} color="#f59e0b" />
                  </MetricProgress>
                  <MetricSubtext>Mục tiêu: 3h</MetricSubtext>
                </MetricContent>
              </PerformanceMetric>
            </PerformanceMetrics>
          </PerformanceSection>

          <SalesFunnelSection>
            <SectionHeader>
              <SectionTitle>🎯 Phễu bán hàng</SectionTitle>
            </SectionHeader>
            <FunnelSteps>
              <FunnelStep>
                <FunnelStepBar width={100} color="#3b82f6" />
                <FunnelStepContent>
                  <FunnelStepLabel>Truy cập</FunnelStepLabel>
                  <FunnelStepValue>12,456</FunnelStepValue>
                </FunnelStepContent>
              </FunnelStep>
              <FunnelStep>
                <FunnelStepBar width={45} color="#10b981" />
                <FunnelStepContent>
                  <FunnelStepLabel>Xem sản phẩm</FunnelStepLabel>
                  <FunnelStepValue>5,623</FunnelStepValue>
                </FunnelStepContent>
              </FunnelStep>
              <FunnelStep>
                <FunnelStepBar width={25} color="#f59e0b" />
                <FunnelStepContent>
                  <FunnelStepLabel>Thêm giỏ hàng</FunnelStepLabel>
                  <FunnelStepValue>3,112</FunnelStepValue>
                </FunnelStepContent>
              </FunnelStep>
              <FunnelStep>
                <FunnelStepBar width={15} color="#8b5cf6" />
                <FunnelStepContent>
                  <FunnelStepLabel>Thanh toán</FunnelStepLabel>
                  <FunnelStepValue>1,867</FunnelStepValue>
                </FunnelStepContent>
              </FunnelStep>
              <FunnelStep>
                <FunnelStepBar width={12} color="#ef4444" />
                <FunnelStepContent>
                  <FunnelStepLabel>Hoàn thành</FunnelStepLabel>
                  <FunnelStepValue>1,494</FunnelStepValue>
                </FunnelStepContent>
              </FunnelStep>
            </FunnelSteps>
            <FunnelSummary>
              Tỷ lệ chuyển đổi: <strong>12.0%</strong>
            </FunnelSummary>
          </SalesFunnelSection>
        </TwoColumnGrid>

        {/* Activity Feed & Top Customers */}
        <TwoColumnGrid>
          <ActivitySection>
            <SectionHeader>
              <SectionTitle>🔔 Hoạt động gần đây</SectionTitle>
              <ViewAllLink onClick={() => router.push('/admin/activities')}>
                Xem tất cả →
              </ViewAllLink>
            </SectionHeader>
            <ActivityFeed>
              {activities.map((activity) => (
                <ActivityItem key={activity.id}>
                  <ActivityIcon status={activity.status}>
                    <FiActivity />
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityMessage>{activity.message}</ActivityMessage>
                    <ActivityTime>{getTimeAgo(activity.time)}</ActivityTime>
                  </ActivityContent>
                  <ActivityStatus status={activity.status}>
                    {getStatusText(activity.status)}
                  </ActivityStatus>
                </ActivityItem>
              ))}
            </ActivityFeed>
          </ActivitySection>

          <TopCustomersSection>
            <SectionHeader>
              <SectionTitle>⭐ Khách hàng VIP</SectionTitle>
              <ViewAllLink onClick={() => router.push('/admin/customers')}>
                Xem tất cả →
              </ViewAllLink>
            </SectionHeader>
            <CustomersList>
              {topCustomers.map((customer, index) => (
                <CustomerItem key={index}>
                  <CustomerRank>{index + 1}</CustomerRank>
                  <CustomerAvatar>{customer.name.charAt(0)}</CustomerAvatar>
                  <CustomerInfo>
                    <CustomerName>{customer.name}</CustomerName>
                    <CustomerEmail>{customer.email}</CustomerEmail>
                  </CustomerInfo>
                  <CustomerStats>
                    <CustomerOrders>{customer.orders} đơn</CustomerOrders>
                    <CustomerSpending>{(customer.total / 1000000).toFixed(1)}M</CustomerSpending>
                  </CustomerStats>
                </CustomerItem>
              ))}
            </CustomersList>
          </TopCustomersSection>
        </TwoColumnGrid>

        {/* Quick Actions */}
        <QuickActionsSection>
          <SectionTitle>⚡ Thao tác nhanh</SectionTitle>
          <ActionsGrid>
            <ActionButton onClick={() => router.push('/admin/products')}>
              <FiPackage /> Quản lý sản phẩm
            </ActionButton>
            <ActionButton onClick={() => router.push('/admin/orders')}>
              <FiShoppingCart /> Quản lý đơn hàng
            </ActionButton>
            <ActionButton onClick={() => router.push('/admin/customers')}>
              <FiUsers /> Quản lý khách hàng
            </ActionButton>
            <ActionButton onClick={() => router.push('/admin/phan-tich')}>
              <FiTrendingUp /> Xem phân tích
            </ActionButton>
            <ActionButton onClick={() => router.push('/admin/inventory/inbound/create')}>
              <FiPackage /> Nhập kho
            </ActionButton>
            <ActionButton onClick={() => router.push('/admin/inventory/outbound/create')}>
              <FiPackage /> Xuất kho
            </ActionButton>
          </ActionsGrid>
        </QuickActionsSection>
      </Container>
    </AdminLayout>
  );
}

function getStatusText(status: string) {
  const statusMap: any = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };
  return statusMap[status] || status;
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatContent = styled.div`
  flex: 1;
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
  margin-bottom: 0.25rem;
`;

const ChartSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const StatIcon = styled.div<{ color: string }>`
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

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatChange = styled.div<{ positive?: boolean; warning?: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.warning ? '#f59e0b' : props.positive ? '#10b981' : '#6b7280'};
  font-weight: 500;
  margin-top: 0.25rem;
`;

const AdditionalStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MiniStatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 3px solid #3b82f6;
`;

const MiniStatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const MiniStatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const MiniStatTrend = styled.div<{ positive?: boolean; warning?: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.warning ? '#f59e0b' : props.positive ? '#10b981' : '#6b7280'};
  font-weight: 500;
`;

const RecentOrdersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const ViewAllLink = styled.a`
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    border-bottom: 2px solid #e5e7eb;
  }
  
  td {
    padding: 1rem 0.75rem;
    font-size: 0.875rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  tr:hover {
    background: #f9fafb;
  }
`;

const OrderId = styled.span`
  font-weight: 600;
  color: #3b82f6;
`;

const Amount = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'delivered': return '#10b98120';
      case 'shipping': return '#3b82f620';
      case 'processing': return '#f59e0b20';
      case 'pending': return '#6b728020';
      case 'cancelled': return '#ef444420';
      default: return '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return '#10b981';
      case 'shipping': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
`;

const QuickActionsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #1f2937;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const AlertsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AlertItem = styled.div<{ severity: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => {
    switch (props.severity) {
      case 'high': return '#fef2f2';
      case 'medium': return '#fef3c7';
      case 'low': return '#eff6ff';
      default: return '#f9fafb';
    }
  }};
  border-left: 3px solid ${props => {
    switch (props.severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#d1d5db';
    }
  }};
`;

const AlertIcon = styled.div<{ severity: string }>`
  font-size: 24px;
  flex-shrink: 0;
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const AlertTime = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const InventorySection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InventoryStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InventoryStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InventoryStatLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
`;

const InventoryStatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const InventoryStatBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const InventoryStatFill = styled.div<{ width: number; color: string }>`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.color};
  transition: width 0.3s;
`;

// Performance Section Styles
const PerformanceSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PerformanceMetrics = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PerformanceMetric = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MetricIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const MetricProgress = styled.div`
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
`;

const MetricProgressBar = styled.div<{ width: number; color: string }>`
  width: ${props => props.width}%;
  height: 100%;
  background: ${props => props.color};
  transition: width 0.3s;
`;

const MetricSubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

// Sales Funnel Styles
const SalesFunnelSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FunnelSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FunnelStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FunnelStepBar = styled.div<{ width: number; color: string }>`
  width: ${props => props.width}%;
  height: 32px;
  background: ${props => props.color};
  border-radius: 6px;
  transition: width 0.3s;
  min-width: 60px;
`;

const FunnelStepContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FunnelStepLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 100px;
`;

const FunnelStepValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
`;

const FunnelSummary = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  
  strong {
    color: #10b981;
    font-size: 1.125rem;
  }
`;

// Activity Feed Styles
const ActivitySection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ActivityFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f9fafb;
  transition: background 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const ActivityIcon = styled.div<{ status: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => {
    switch (props.status) {
      case 'delivered': return '#10b98120';
      case 'shipping': return '#3b82f620';
      case 'processing': return '#f59e0b20';
      default: return '#6b728020';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return '#10b981';
      case 'shipping': return '#3b82f6';
      case 'processing': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityMessage = styled.div`
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ActivityStatus = styled.span<{ status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'delivered': return '#10b98120';
      case 'shipping': return '#3b82f620';
      case 'processing': return '#f59e0b20';
      default: return '#6b728020';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return '#10b981';
      case 'shipping': return '#3b82f6';
      case 'processing': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
`;

// Top Customers Styles
const TopCustomersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CustomersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CustomerItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #f9fafb;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    transform: translateX(4px);
  }
`;

const CustomerRank = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const CustomerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const CustomerInfo = styled.div`
  flex: 1;
`;

const CustomerName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.125rem;
`;

const CustomerEmail = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const CustomerStats = styled.div`
  text-align: right;
`;

const CustomerOrders = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.125rem;
`;

const CustomerSpending = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #10b981;
`;

// Notifications Styles
const NotificationsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const NotificationBadge = styled.span`
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotificationItem = styled.div<{ unread: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${props => props.unread ? '#eff6ff' : '#f9fafb'};
  border-left: 3px solid ${props => props.unread ? '#3b82f6' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const NotificationIcon = styled.div<{ type: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${props => {
    switch (props.type) {
      case 'warning': return '#fef3c7';
      case 'success': return '#d1fae5';
      case 'info': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationMessage = styled.div`
  font-size: 0.875rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
`;

// Schedule Styles
const ScheduleSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ScheduleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ScheduleItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f9fafb;
  border-left: 3px solid #3b82f6;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    transform: translateX(4px);
  }
`;

const ScheduleTime = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #3b82f6;
  min-width: 50px;
`;

const ScheduleContent = styled.div`
  flex: 1;
`;

const ScheduleTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ScheduleDesc = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;
