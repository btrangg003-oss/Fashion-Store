import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import styled from 'styled-components';
import { CHART_COLORS, CHART_CONFIG } from '@/services/chartConfig';
import type { ProductCategoryData } from '@/models/analytics';

interface ProductInventoryChartProps {
  data: ProductCategoryData[];
  height?: number;
}

export const ProductInventoryChart: React.FC<ProductInventoryChartProps> = ({ 
  data, 
  height = CHART_CONFIG.height.medium 
}) => {
  const COLORS = {
    hot: CHART_COLORS.hot,
    normal: CHART_COLORS.normal,
    slow: CHART_COLORS.slow,
    outOfStock: CHART_COLORS.outOfStock
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <TooltipContainer>
          <TooltipLabel>{data.categoryLabel}</TooltipLabel>
          <TooltipValue>
            {data.count} sản phẩm ({data.percentage}%)
          </TooltipValue>
          {data.products && data.products.length > 0 && (
            <TooltipProducts>
              <ProductsTitle>Ví dụ:</ProductsTitle>
              {data.products.slice(0, 3).map((product: string, index: number) => (
                <ProductItem key={index}>• {product}</ProductItem>
              ))}
              {data.products.length > 3 && (
                <ProductItem>... và {data.products.length - 3} sản phẩm khác</ProductItem>
              )}
            </TooltipProducts>
          )}
        </TooltipContainer>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, payload }: any) => {
    if (percentage < 5) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12px"
        fontWeight="600"
      >
        {`${percentage}%`}
      </text>
    );
  };

  return (
    <ChartContainer>
      <ChartTitle>Quản Lý Sản Phẩm & Tồn Kho</ChartTitle>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data as any}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={110}
            fill="#8884d8"
            dataKey="count"
            nameKey="categoryLabel"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.category as keyof typeof COLORS]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
      <LegendInfo>
        <LegendItem>
          <LegendDot color={CHART_COLORS.hot} />
          <span>Bán chạy: &gt; 50 sản phẩm/tháng</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color={CHART_COLORS.normal} />
          <span>Bình thường: 10-50 sản phẩm/tháng</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color={CHART_COLORS.slow} />
          <span>Ế ẩm: &lt; 10 sản phẩm/tháng</span>
        </LegendItem>
        <LegendItem>
          <LegendDot color={CHART_COLORS.outOfStock} />
          <span>Hết hàng: Stock = 0</span>
        </LegendItem>
      </LegendInfo>
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
  max-width: 250px;
`;

const TooltipLabel = styled.div`
  color: #f9fafb;
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
`;

const TooltipValue = styled.div`
  color: #e5e7eb;
  font-size: 13px;
  margin-bottom: 8px;
`;

const TooltipProducts = styled.div`
  border-top: 1px solid #374151;
  padding-top: 8px;
  margin-top: 8px;
`;

const ProductsTitle = styled.div`
  color: #9ca3af;
  font-size: 11px;
  margin-bottom: 4px;
  font-weight: 600;
`;

const ProductItem = styled.div`
  color: #d1d5db;
  font-size: 11px;
  margin: 2px 0;
`;

const LegendInfo = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  font-size: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
`;

const LegendDot = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

export default ProductInventoryChart;
