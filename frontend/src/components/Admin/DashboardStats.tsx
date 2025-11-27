import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiDollarSign, FiShoppingBag, FiUsers, FiTrendingUp,
  FiArrowUp, FiArrowDown 
} from 'react-icons/fi';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#3b82f6'};
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ bgColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #64748b;
  margin-bottom: 1rem;
`;

const StatChange = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.isPositive ? '#10b981' : '#ef4444'};
  font-weight: 600;
`;

const StatPeriod = styled.span`
  color: #64748b;
  font-weight: 400;
`;

interface StatData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionChange: number;
}

interface DashboardStatsProps {
  data: StatData | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export default function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      id: 'revenue',
      label: 'Doanh thu',
      value: data ? formatCurrency(data.totalRevenue) : formatCurrency(0),
      change: data?.revenueChange || 0,
      icon: FiDollarSign,
      color: '#3b82f6',
      bgColor: '#3b82f6'
    },
    {
      id: 'orders',
      label: 'Đơn hàng',
      value: data ? formatNumber(data.totalOrders) : '0',
      change: data?.ordersChange || 0,
      icon: FiShoppingBag,
      color: '#10b981',
      bgColor: '#10b981'
    },
    {
      id: 'customers',
      label: 'Khách hàng',
      value: data ? formatNumber(data.totalCustomers) : '0',
      change: data?.customersChange || 0,
      icon: FiUsers,
      color: '#f59e0b',
      bgColor: '#f59e0b'
    },
    {
      id: 'conversion',
      label: 'Tỷ lệ chuyển đổi',
      value: data && data.conversionRate !== undefined ? `${data.conversionRate.toFixed(1)}%` : '0%',
      change: data?.conversionChange || 0,
      icon: FiTrendingUp,
      color: '#8b5cf6',
      bgColor: '#8b5cf6'
    }
  ];

  return (
    <StatsGrid>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.id}
          color={stat.color}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <StatHeader>
            <StatIcon bgColor={stat.bgColor}>
              <stat.icon />
            </StatIcon>
          </StatHeader>
          
          <StatValue>{stat.value}</StatValue>
          <StatLabel>{stat.label}</StatLabel>
          
          <StatChange isPositive={stat.change >= 0}>
            {stat.change >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            {Math.abs(stat.change).toFixed(1)}%
            <StatPeriod>so với tháng trước</StatPeriod>
          </StatChange>
        </StatCard>
      ))}
    </StatsGrid>
  );
}