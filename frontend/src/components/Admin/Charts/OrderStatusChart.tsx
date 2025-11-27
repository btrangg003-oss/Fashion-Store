import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import styled from 'styled-components';
import { CHART_COLORS, CHART_CONFIG, CHART_STYLES } from '@/services/chartConfig';
import type { OrderStatusDataPoint } from '@/models/analytics';

interface OrderStatusChartProps {
  data: OrderStatusDataPoint[];
}

const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      
      return (
        <TooltipContainer>
          <TooltipTitle>{label}</TooltipTitle>
          <TooltipTotal>Tổng: {total} đơn hàng</TooltipTotal>
          <TooltipDivider />
          {payload.map((entry: any, index: number) => (
            <TooltipItem key={index}>
              <TooltipDot color={entry.color} />
              <TooltipLabel>{getStatusLabel(entry.dataKey)}:</TooltipLabel>
              <TooltipValue>
                {entry.value} ({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)
              </TooltipValue>
            </TooltipItem>
          ))}
        </TooltipContainer>
      );
    }
    return null;
  };

  // Get status label in Vietnamese
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return labels[status] || status;
  };

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <LegendContainer>
        {payload.map((entry: any, index: number) => (
          <LegendItem key={`legend-${index}`}>
            <LegendDot color={entry.color} />
            <LegendLabel>{getStatusLabel(entry.dataKey)}</LegendLabel>
          </LegendItem>
        ))}
      </LegendContainer>
    );
  };

  if (!data || data.length === 0) {
    return (
      <EmptyState>
        <EmptyIcon>📊</EmptyIcon>
        <EmptyText>Chưa có dữ liệu đơn hàng</EmptyText>
      </EmptyState>
    );
  }

  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height={CHART_CONFIG.height.medium}>
        <BarChart
          data={data}
          margin={CHART_CONFIG.margin}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="week"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{ 
              value: 'Số đơn hàng', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12 }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
          <Legend content={renderLegend} />
          
          {/* Stacked bars for each status */}
          <Bar
            dataKey="pending"
            stackId="status"
            fill={CHART_COLORS.pending}
            radius={[0, 0, 0, 0]}
            animationDuration={CHART_CONFIG.animation.duration}
          />
          <Bar
            dataKey="processing"
            stackId="status"
            fill={CHART_COLORS.processing}
            radius={[0, 0, 0, 0]}
            animationDuration={CHART_CONFIG.animation.duration}
          />
          <Bar
            dataKey="shipping"
            stackId="status"
            fill={CHART_COLORS.shipping}
            radius={[0, 0, 0, 0]}
            animationDuration={CHART_CONFIG.animation.duration}
          />
          <Bar
            dataKey="delivered"
            stackId="status"
            fill={CHART_COLORS.delivered}
            radius={[0, 0, 0, 0]}
            animationDuration={CHART_CONFIG.animation.duration}
          />
          <Bar
            dataKey="cancelled"
            stackId="status"
            fill={CHART_COLORS.cancelled}
            radius={[4, 4, 0, 0]}
            animationDuration={CHART_CONFIG.animation.duration}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const TooltipContainer = styled.div`
  background: #1f2937;
  border: none;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
`;

const TooltipTitle = styled.div`
  color: #f9fafb;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
`;

const TooltipTotal = styled.div`
  color: #d1d5db;
  font-size: 13px;
  margin-bottom: 8px;
`;

const TooltipDivider = styled.div`
  height: 1px;
  background: #374151;
  margin: 8px 0;
`;

const TooltipItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
`;

const TooltipDot = styled.div<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const TooltipLabel = styled.span`
  color: #e5e7eb;
  font-size: 13px;
  flex: 1;
`;

const TooltipValue = styled.span`
  color: #f9fafb;
  font-weight: 600;
  font-size: 13px;
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 20px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LegendDot = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const LegendLabel = styled.span`
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${CHART_CONFIG.height.medium}px;
  color: #9ca3af;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

export default OrderStatusChart;
