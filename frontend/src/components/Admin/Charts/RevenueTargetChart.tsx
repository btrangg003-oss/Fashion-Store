import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import styled from 'styled-components';
import { CHART_COLORS, CHART_CONFIG, CHART_STYLES } from '@/services/chartConfig';
import type { RevenueDataPoint } from '@/models/analytics';

interface RevenueTargetChartProps {
  data: RevenueDataPoint[];
  height?: number;
}

export const RevenueTargetChart: React.FC<RevenueTargetChartProps> = ({ 
  data, 
  height = CHART_CONFIG.height.medium 
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <TooltipContainer>
          <TooltipLabel>{label}</TooltipLabel>
          <TooltipItem color={CHART_COLORS.revenue}>
            <TooltipDot color={CHART_COLORS.revenue} />
            <span>Doanh thu: {payload[0].value.toLocaleString('vi-VN')} ₫</span>
          </TooltipItem>
          <TooltipItem color={CHART_COLORS.target}>
            <TooltipDot color={CHART_COLORS.target} />
            <span>Mục tiêu: {payload[1].value.toLocaleString('vi-VN')} ₫</span>
          </TooltipItem>
          {payload[0].value > 0 && payload[1].value > 0 && (
            <TooltipAchievement achieved={payload[0].value >= payload[1].value}>
              {payload[0].value >= payload[1].value ? '✓ Đạt mục tiêu' : '⚠ Chưa đạt'}
              {' '}
              ({Math.round((payload[0].value / payload[1].value) * 100)}%)
            </TooltipAchievement>
          )}
        </TooltipContainer>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartTitle>Doanh Thu vs Mục Tiêu</ChartTitle>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={CHART_CONFIG.margin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={CHART_STYLES.legend.wrapperStyle}
            iconType={CHART_STYLES.legend.iconType}
          />
          <Bar 
            dataKey="target" 
            fill={CHART_COLORS.target} 
            name="Mục tiêu"
            radius={[4, 4, 0, 0]}
            opacity={0.6}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke={CHART_COLORS.revenue} 
            strokeWidth={3}
            name="Doanh thu"
            dot={{ fill: CHART_COLORS.revenue, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const ChartContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const TooltipContainer = styled.div`
  background: #1f2937;
  border: none;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TooltipLabel = styled.div`
  color: #f9fafb;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const TooltipItem = styled.div<{ color: string }>`
  color: #e5e7eb;
  font-size: 13px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TooltipDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  display: inline-block;
`;

const TooltipAchievement = styled.div<{ achieved: boolean }>`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #374151;
  color: ${props => props.achieved ? '#10b981' : '#f59e0b'};
  font-weight: 600;
  font-size: 12px;
`;

export default RevenueTargetChart;
