import React from 'react';
import {
  BarChart,
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
import type { RetentionMarketingDataPoint } from '@/models/analytics';

interface RetentionMarketingChartProps {
  data: RetentionMarketingDataPoint[];
  height?: number;
}

export const RetentionMarketingChart: React.FC<RetentionMarketingChartProps> = ({ 
  data, 
  height = CHART_CONFIG.height.medium 
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <TooltipContainer>
          <TooltipLabel>{label}</TooltipLabel>
          <TooltipItem color={CHART_COLORS.retention}>
            <TooltipDot color={CHART_COLORS.retention} />
            <div>
              <div>Retention Rate: {data.retentionRate}%</div>
              <TooltipSubtext>
                {data.returningCustomers} / {data.newCustomers + data.returningCustomers} khách hàng quay lại
              </TooltipSubtext>
            </div>
          </TooltipItem>
          <TooltipItem color={CHART_COLORS.marketing}>
            <TooltipDot color={CHART_COLORS.marketing} />
            <div>
              <div>Marketing ROI: {data.marketingROI}%</div>
              <TooltipSubtext>
                Chi phí: {data.marketingSpend.toLocaleString('vi-VN')} ₫
              </TooltipSubtext>
            </div>
          </TooltipItem>
        </TooltipContainer>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartTitle>Retention & Hiệu Quả Marketing</ChartTitle>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={CHART_CONFIG.margin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{ value: '%', angle: 0, position: 'top', offset: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={CHART_STYLES.legend.wrapperStyle}
            iconType={CHART_STYLES.legend.iconType}
          />
          <Bar 
            dataKey="retentionRate" 
            fill={CHART_COLORS.retention} 
            name="Retention Rate (%)"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="marketingROI" 
            fill={CHART_COLORS.marketing} 
            name="Marketing ROI (%)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
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
  min-width: 200px;
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
  margin: 8px 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const TooltipDot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  display: inline-block;
  margin-top: 4px;
  flex-shrink: 0;
`;

const TooltipSubtext = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
`;

export default RetentionMarketingChart;
