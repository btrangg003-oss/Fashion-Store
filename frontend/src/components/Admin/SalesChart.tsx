import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';

const ChartContainer = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PeriodSelector = styled.div`
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 0.25rem;
`;

const PeriodButton = styled.button<{ isActive: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.isActive ? 'white' : 'transparent'};
  color: ${props => props.isActive ? '#1a202c' : '#64748b'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.isActive ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    color: #1a202c;
  }
`;

const ChartArea = styled.div`
  height: 400px;
  position: relative;
  margin-bottom: 1rem;
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const ChartPath = styled(motion.path)`
  fill: none;
  stroke: #3b82f6;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const ChartGradient = styled(motion.path)`
  fill: url(#salesGradient);
  opacity: 0.1;
`;

const ChartGrid = styled.g`
  stroke: #e2e8f0;
  stroke-width: 1;
  opacity: 0.5;
`;

const ChartAxis = styled.g`
  stroke: #374151;
  stroke-width: 2;
`;

const ChartAxisLabel = styled.text`
  fill: #374151;
  font-size: 12px;
  font-weight: 500;
`;

const ChartSVGTitle = styled.text`
  fill: #1f2937;
  font-size: 16px;
  font-weight: 600;
  text-anchor: middle;
`;

const ChartLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const ChartLegend = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: ${props => props.color};
`;

const ChartStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

interface SalesData {
  daily: Array<{ date: string; value: number }>;
  weekly: Array<{ date: string; value: number }>;
  monthly: Array<{ date: string; value: number }>;
}

interface SalesChartProps {
  data: SalesData | null;
}

const generateMockData = (period: 'daily' | 'weekly' | 'monthly') => {
  const now = new Date();
  const data = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    if (period === 'daily') {
      date.setDate(date.getDate() - i);
    } else if (period === 'weekly') {
      date.setDate(date.getDate() - i * 7);
    } else {
      date.setMonth(date.getMonth() - i);
    }
    
    data.push({
      date: date.toLocaleDateString('vi-VN'),
      value: Math.floor(Math.random() * 1000000) + 500000
    });
  }
  
  return data;
};

export default function SalesChart({ data }: SalesChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const chartData = data?.[selectedPeriod] || generateMockData(selectedPeriod);
  
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));
  
  const createPath = (data: Array<{ date: string; value: number }>) => {
    const width = 100;
    const height = 100;
    const padding = 10;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = padding + (1 - (d.value - minValue) / (maxValue - minValue)) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };
  
  const createAreaPath = (data: Array<{ date: string; value: number }>) => {
    const path = createPath(data);
    const lastPoint = data[data.length - 1];
    const firstPoint = data[0];
    const width = 100;
    const height = 100;
    const padding = 10;
    
    const lastX = padding + ((data.length - 1) / (data.length - 1)) * (width - 2 * padding);
    const firstX = padding;
    const bottom = height - padding;
    
    return `${path} L ${lastX},${bottom} L ${firstX},${bottom} Z`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact'
    }).format(amount);
  };

  const totalSales = chartData.reduce((sum, d) => sum + d.value, 0);
  const avgSales = totalSales / chartData.length;
  const growth = chartData.length > 1 
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
    : 0;

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <ChartHeader>
        <ChartTitle>
          <FiTrendingUp />
          Biểu đồ doanh thu
        </ChartTitle>
        
        <PeriodSelector>
          <PeriodButton
            isActive={selectedPeriod === 'daily'}
            onClick={() => setSelectedPeriod('daily')}
          >
            7 ngày
          </PeriodButton>
          <PeriodButton
            isActive={selectedPeriod === 'weekly'}
            onClick={() => setSelectedPeriod('weekly')}
          >
            7 tuần
          </PeriodButton>
          <PeriodButton
            isActive={selectedPeriod === 'monthly'}
            onClick={() => setSelectedPeriod('monthly')}
          >
            7 tháng
          </PeriodButton>
        </PeriodSelector>
      </ChartHeader>

      <ChartArea>
        <ChartSVG viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <ChartGrid>
            {[0, 25, 50, 75, 100].map(y => (
              <line key={y} x1="10" y1={y} x2="90" y2={y} />
            ))}
          </ChartGrid>
          
          <ChartGradient
            d={createAreaPath(chartData)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          <ChartPath
            d={createPath(chartData)}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </ChartSVG>
      </ChartArea>

      <ChartLabels>
        {chartData.map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
      </ChartLabels>

      <ChartStats>
        <StatItem>
          <StatValue>{formatCurrency(totalSales)}</StatValue>
          <StatLabel>Tổng doanh thu</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue>{formatCurrency(avgSales)}</StatValue>
          <StatLabel>Trung bình</StatLabel>
        </StatItem>
        <StatItem>
          <StatValue style={{ color: growth >= 0 ? '#10b981' : '#ef4444' }}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </StatValue>
          <StatLabel>Tăng trưởng</StatLabel>
        </StatItem>
      </ChartStats>
    </ChartContainer>
  );
}