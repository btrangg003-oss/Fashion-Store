import React from 'react';
import styled from 'styled-components';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import { FiShoppingBag, FiStar, FiHeart, FiTag } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)<{ $color: string }>`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.$color};
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color}15;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 12px;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StatsOverview: React.FC = () => {
  const { stats, loading } = useUserDashboard();

  const statsData = [
    {
      icon: FiShoppingBag,
      value: stats.totalOrders || 0,
      label: 'Tổng đơn hàng',
      color: '#667eea',
      change: '+12%',
      positive: true
    },
    {
      icon: FiStar,
      value: stats.loyaltyPoints || 0,
      label: 'Điểm thưởng',
      color: '#f59e0b',
      change: '+50 điểm',
      positive: true
    },
    {
      icon: FiHeart,
      value: stats.wishlistCount || 0,
      label: 'Yêu thích',
      color: '#ec4899',
      change: '+3 sản phẩm',
      positive: true
    },
    {
      icon: FiTag,
      value: stats.couponsCount || 0,
      label: 'Coupon khả dụng',
      color: '#10b981',
      change: '2 sắp hết hạn',
      positive: false
    }
  ];

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <Grid>
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.label}
          $color={stat.color}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatIcon $color={stat.color}>
            <stat.icon />
          </StatIcon>
          <StatValue>{stat.value.toLocaleString()}</StatValue>
          <StatLabel>{stat.label}</StatLabel>
          <StatChange $positive={stat.positive}>
            {stat.positive ? '↗' : '↘'} {stat.change}
          </StatChange>
        </StatCard>
      ))}
    </Grid>
  );
};
