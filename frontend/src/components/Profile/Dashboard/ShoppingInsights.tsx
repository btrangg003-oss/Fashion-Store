import React from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiClock, FiDollarSign, FiPackage } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InsightCard = styled(motion.div)`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
`;

const InsightIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const InsightDescription = styled.div`
  font-size: 14px;
  color: #666;
`;

const InsightValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
  margin-top: 4px;
`;

export const ShoppingInsights: React.FC = () => {
  const insights = [
    {
      icon: FiTrendingUp,
      color: '#667eea',
      title: 'Danh mục yêu thích',
      description: 'Bạn thường mua sắm ở danh mục',
      value: 'Áo thun & Quần jean',
      iconColor: '#667eea'
    },
    {
      icon: FiClock,
      color: '#f59e0b',
      title: 'Thời gian mua sắm',
      description: 'Bạn thường mua sắm vào',
      value: 'Cuối tuần (18:00 - 21:00)',
      iconColor: '#f59e0b'
    },
    {
      icon: FiDollarSign,
      color: '#10b981',
      title: 'Giá trị trung bình',
      description: 'Giá trị đơn hàng trung bình của bạn',
      value: '850,000đ',
      iconColor: '#10b981'
    },
    {
      icon: FiPackage,
      color: '#ec4899',
      title: 'Tần suất mua sắm',
      description: 'Bạn mua sắm trung bình',
      value: '2 lần/tháng',
      iconColor: '#ec4899'
    }
  ];

  return (
    <Container>
      <Title>
        <FiTrendingUp />
        Phân tích mua sắm
      </Title>
      <InsightsList>
        {insights.map((insight, index) => (
          <InsightCard
            key={insight.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <InsightIcon $color={insight.iconColor}>
              <insight.icon />
            </InsightIcon>
            <InsightContent>
              <InsightTitle>{insight.title}</InsightTitle>
              <InsightDescription>{insight.description}</InsightDescription>
              <InsightValue>{insight.value}</InsightValue>
            </InsightContent>
          </InsightCard>
        ))}
      </InsightsList>
    </Container>
  );
};
