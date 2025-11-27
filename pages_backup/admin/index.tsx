import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import LineChart from '@/components/Admin/LineChart';
import PieChart from '@/components/Admin/PieChart';
import { useAuth } from '@/contexts/AuthContext';
import { FiTrendingUp, FiShoppingCart, FiUsers, FiPackage } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/products')
      ]);
      
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      
      const orders = ordersData.data || [];
      const products = productsData.data || [];
      
      setRecentOrders(orders.slice(0, 5));
      
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
    <ResponsiveAdminLayout>
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
              <StatValue>127</StatValue>
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
              <StatValue>45.2M</StatValue>
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
              <StatValue>{stats?.totalProducts || 1234}</StatValue>
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
              <StatValue>{stats?.totalCustomers || 8567}</StatValue>
            </StatContent>
          </StatCard>
        </StatsGrid>

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

        {/* Quick Actions */}
        <QuickActionsSection>
          <SectionTitle>Thao tác nhanh</SectionTitle>
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
            <ActionButton onClick={() => router.push('/admin/analytics')}>
              <FiTrendingUp /> Xem thống kê
            </ActionButton>
          </ActionsGrid>
        </QuickActionsSection>
      </Container>
    </ResponsiveAdminLayout>
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
