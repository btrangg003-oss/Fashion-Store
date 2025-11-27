import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSpendingStats } from '@/hooks/useSpendingStats';
import { FiTrendingUp, FiDollarSign } from 'react-icons/fi';

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`;

const LoadingState = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

const ErrorState = styled.div`
  padding: 20px;
  text-align: center;
  color: #dc3545;
`;

const EmptyState = styled.div`
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

export const SpendingChart: React.FC = () => {
  const { spendingData, stats, isLoading, isError } = useSpendingStats();

  if (isLoading) {
    return (
      <ChartContainer>
        <LoadingState>Đang tải dữ liệu...</LoadingState>
      </ChartContainer>
    );
  }

  if (isError) {
    return (
      <ChartContainer>
        <ErrorState>Không thể tải dữ liệu chi tiêu</ErrorState>
      </ChartContainer>
    );
  }

  const hasData = spendingData.length > 0 && stats.total > 0;

  return (
    <ChartContainer>
      <Header>
        <Title>
          <FiTrendingUp />
          Chi tiêu 6 tháng gần nhất
        </Title>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatLabel>Tổng chi tiêu</StatLabel>
          <StatValue>{stats.total.toLocaleString('vi-VN')}đ</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Trung bình/tháng</StatLabel>
          <StatValue>{stats.average.toLocaleString('vi-VN')}đ</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Cao nhất</StatLabel>
          <StatValue>{stats.max.toLocaleString('vi-VN')}đ</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Thấp nhất</StatLabel>
          <StatValue>{stats.min.toLocaleString('vi-VN')}đ</StatValue>
        </StatCard>
      </StatsGrid>

      {hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={spendingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="label" 
              stroke="#666"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#666"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: any) => [`${value.toLocaleString('vi-VN')}đ`, 'Chi tiêu']}
              contentStyle={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#ff6b6b" 
              strokeWidth={2}
              dot={{ fill: '#ff6b6b', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState>
          <FiDollarSign />
          <div>Chưa có dữ liệu chi tiêu</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Hãy mua sắm để xem biểu đồ chi tiêu của bạn
          </div>
        </EmptyState>
      )}
    </ChartContainer>
  );
};
