import React from 'react';
import styled from 'styled-components';
import { FiShoppingBag, FiPackage, FiGift, FiStar, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ActionCard = styled(motion.a)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

const ActionIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 12px;
`;

const ActionLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: #1a1a1a;
`;

const actions = [
  {
    id: 'reorder',
    label: 'Mua lại',
    icon: FiShoppingBag,
    color: '#667eea',
    link: '/profile?tab=orders'
  },
  {
    id: 'track',
    label: 'Theo dõi đơn',
    icon: FiPackage,
    color: '#f59e0b',
    link: '/profile?tab=orders'
  },
  {
    id: 'coupons',
    label: 'Coupon',
    icon: FiGift,
    color: '#10b981',
    link: '/profile?tab=coupons'
  },
  {
    id: 'points',
    label: 'Đổi điểm',
    icon: FiStar,
    color: '#f59e0b',
    link: '/profile?tab=loyalty'
  },
  {
    id: 'support',
    label: 'Hỗ trợ',
    icon: FiMessageCircle,
    color: '#3b82f6',
    link: '/contact'
  }
];

export const QuickActions: React.FC = () => {
  return (
    <Container>
      <Title>Thao tác nhanh</Title>
      <ActionsGrid>
        {actions.map((action, index) => (
          <Link key={action.id} href={action.link} passHref legacyBehavior>
            <ActionCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ActionIcon $color={action.color}>
                <action.icon />
              </ActionIcon>
              <ActionLabel>{action.label}</ActionLabel>
            </ActionCard>
          </Link>
        ))}
      </ActionsGrid>
    </Container>
  );
};
