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
import type { AgeDistributionData, GenderDistributionData } from '@/models/analytics';

interface CustomerDemographicsChartsProps {
  ageData: AgeDistributionData[];
  genderData: GenderDistributionData[];
  height?: number;
}

export const CustomerDemographicsCharts: React.FC<CustomerDemographicsChartsProps> = ({ 
  ageData, 
  genderData,
  height = CHART_CONFIG.height.medium 
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <TooltipContainer>
          <TooltipLabel>{data.name}</TooltipLabel>
          <TooltipValue>
            {data.value} khách hàng ({data.payload.percentage}%)
          </TooltipValue>
        </TooltipContainer>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null; // Don't show label for small slices
    
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
    <Container>
      <ChartSection>
        <ChartTitle>Phân Bố Theo Độ Tuổi</ChartTitle>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={ageData as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="ageGroup"
            >
              {ageData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS.demographicsGradient[index % CHART_COLORS.demographicsGradient.length]} 
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
      </ChartSection>

      <ChartSection>
        <ChartTitle>Phân Bố Theo Giới Tính</ChartTitle>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={genderData as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="genderLabel"
            >
              {genderData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CHART_COLORS.demographicsGradient[index % CHART_COLORS.demographicsGradient.length]} 
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
      </ChartSection>
    </Container>
  );
};

const Container = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartSection = styled.div``;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
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
  margin-bottom: 4px;
  font-size: 14px;
`;

const TooltipValue = styled.div`
  color: #e5e7eb;
  font-size: 13px;
`;

export default CustomerDemographicsCharts;
