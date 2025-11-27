import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiUsers, FiShoppingBag, FiPackage,
  FiDollarSign, FiArrowUp, FiArrowDown, FiRefreshCw,
  FiBell, FiActivity, FiAlertTriangle
} from 'react-icons/fi';
import { useRealTimeStats, useAnimatedCounter, useRealTimeNotifications } from '../../hooks/useRealTimeStats';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const RefreshButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: #edf2f7;
  }
`;

const NotificationBell = styled(motion.button)`
  position: relative;
  padding: 0.75rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  cursor: pointer;
  
  &:hover {
    background: #edf2f7;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LastUpdated = styled.div`
  font-size: 0.875rem;
  color: #718096;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div<{ positive: boolean }>`
  color: ${props => props.positive ? '#38a169' : '#e53e3e'};
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const AlertsSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
`;

const AlertsHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AlertsList = styled.div`
  padding: 1rem;
`;

const AlertItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: #fef5e7;
  border: 1px solid #f6e05e;
`;

const AlertIcon = styled.div`
  color: #d69e2e;
  font-size: 1.25rem;
`;

const AlertText = styled.div`
  flex: 1;
  color: #744210;
  font-weight: 500;
`;

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; format?: (n: number) => string }> = ({
  value,
  format = (n) => n.toLocaleString('vi-VN')
}) => {
  const animatedValue = useAnimatedCounter(value);
  return <span>{format(animatedValue)}</span>;
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const RealTimeDashboard: React.FC = () => {
  const { stats, loading, error, lastUpdated, refresh } = useRealTimeStats(30000);
  const { notifications, unreadCount } = useRealTimeNotifications();

  if (loading && !stats) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <FiActivity size={48} color="#cbd5e0" />
          <div style={{ marginTop: '1rem', color: '#718096' }}>Đang tải dữ liệu...</div>
        </div>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#e53e3e' }}>
          <FiAlertTriangle size={48} />
          <div style={{ marginTop: '1rem' }}>Lỗi: {error}</div>
          <button onClick={refresh} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px' }}>
            Thử lại
          </button>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>
          <FiActivity />
          Dashboard Real-time
        </Title>
        <HeaderActions>
          <LastUpdated>
            Cập nhật lần cuối: {lastUpdated?.toLocaleTimeString('vi-VN')}
          </LastUpdated>
          <NotificationBell
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiBell />
            {unreadCount > 0 && (
              <NotificationBadge>{unreadCount}</NotificationBadge>
            )}
          </NotificationBell>
          <RefreshButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={refresh}
          >
            <FiRefreshCw />
            Làm mới
          </RefreshButton>
        </HeaderActions>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatHeader>
            <StatIcon color="#3182ce">
              <FiDollarSign />
            </StatIcon>
          </StatHeader>
          <StatValue>
            <AnimatedCounter
              value={stats?.totalRevenue || 0}
              format={formatCurrency}
            />
          </StatValue>
          <StatLabel>Tổng doanh thu</StatLabel>
          <StatChange positive={(stats?.revenueChange || 0) >= 0}>
            {(stats?.revenueChange || 0) >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs(stats?.revenueChange || 0).toFixed(1)}% so với tháng trước
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon color="#38a169">
              <FiShoppingBag />
            </StatIcon>
          </StatHeader>
          <StatValue>
            <AnimatedCounter value={stats?.totalOrders || 0} />
          </StatValue>
          <StatLabel>Tổng đơn hàng</StatLabel>
          <StatChange positive={(stats?.ordersChange || 0) >= 0}>
            {(stats?.ordersChange || 0) >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs(stats?.ordersChange || 0).toFixed(1)}% so với tháng trước
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon color="#d69e2e">
              <FiPackage />
            </StatIcon>
          </StatHeader>
          <StatValue>
            <AnimatedCounter value={stats?.totalProducts || 0} />
          </StatValue>
          <StatLabel>Tổng sản phẩm</StatLabel>
          <StatChange positive={(stats?.productsChange || 0) >= 0}>
            {(stats?.productsChange || 0) >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs(stats?.productsChange || 0).toFixed(1)}% so với tháng trước
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon color="#805ad5">
              <FiUsers />
            </StatIcon>
          </StatHeader>
          <StatValue>
            <AnimatedCounter value={stats?.totalCustomers || 0} />
          </StatValue>
          <StatLabel>Tổng khách hàng</StatLabel>
          <StatChange positive={stats?.customersChange >= 0}>
            {stats?.customersChange >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs(stats?.customersChange || 0).toFixed(1)}% so với tháng trước
          </StatChange>
        </StatCard>

        {/* MoMo Payment KPI */}
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatHeader>
            <StatIcon color="#e91e63">
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>M</div>
            </StatIcon>
          </StatHeader>
          <StatValue>
            <AnimatedCounter
              value={stats?.momoRevenue || 0}
              format={formatCurrency}
            />
          </StatValue>
          <StatLabel>Doanh thu MoMo</StatLabel>
          <StatChange positive={(stats?.momoSuccessRate || 0) >= 95}>
            <span style={{ fontSize: '0.75rem' }}>
              Tỷ lệ thành công: {(stats?.momoSuccessRate || 0).toFixed(1)}%
            </span>
          </StatChange>
        </StatCard>
      </StatsGrid>

          {/* Low Stock Alerts */}
          {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
            <AlertsSection>
              <AlertsHeader>
                <FiAlertTriangle />
                <span>Cảnh báo tồn kho</span>
              </AlertsHeader>
              <AlertsList>
                {stats.lowStockProducts.map((product, index) => (
                  <AlertItem
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AlertIcon>
                      <FiAlertTriangle />
                    </AlertIcon>
                    <AlertText>
                      {product.name} chỉ còn {product.stock} sản phẩm (dưới ngưỡng {product.threshold})
                    </AlertText>
                  </AlertItem>
                ))}
              </AlertsList>
            </AlertsSection>
          )}

          <ChartsSection>
            <ChartCard>
              <ChartTitle>Doanh thu 7 ngày gần đây</ChartTitle>
              <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 8, color: 'white' }}>
                Biểu đồ doanh thu real-time
              </div>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Sản phẩm bán chạy</ChartTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stats?.topProducts?.slice(0, 5).map((product, index) => (
                  <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f7fafc', borderRadius: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{product.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#718096' }}>{product.sales} đã bán</div>
                    </div>
                    <div style={{ fontWeight: 600, color: '#38a169' }}>
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </ChartsSection>
        </DashboardContainer>
      );
    };

export default RealTimeDashboard;