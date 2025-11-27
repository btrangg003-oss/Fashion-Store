import React from 'react';
import styled, { keyframes } from 'styled-components';
import { CHART_CONFIG } from '@/services/chartConfig';

interface ChartSkeletonProps {
  variant?: 'bar' | 'line' | 'pie';
  height?: number;
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  variant = 'bar',
  height = CHART_CONFIG.height.medium 
}) => {
  return (
    <Container style={{ height }}>
      <Header>
        <TitleSkeleton />
        <SubtitleSkeleton />
      </Header>
      
      <ChartArea>
        {variant === 'bar' && <BarChartSkeleton />}
        {variant === 'line' && <LineChartSkeleton />}
        {variant === 'pie' && <PieChartSkeleton />}
      </ChartArea>
      
      <Footer>
        <LegendSkeleton />
      </Footer>
    </Container>
  );
};

const BarChartSkeleton: React.FC = () => (
  <BarsContainer>
    {[...Array(8)].map((_, i) => (
      <Bar key={i} height={Math.random() * 60 + 20} delay={i * 0.1} />
    ))}
  </BarsContainer>
);

const LineChartSkeleton: React.FC = () => (
  <LineContainer>
    <LinePath />
    {[...Array(8)].map((_, i) => (
      <Dot key={i} left={i * 12.5} delay={i * 0.1} />
    ))}
  </LineContainer>
);

const PieChartSkeleton: React.FC = () => (
  <PieContainer>
    <PieCircle />
  </PieContainer>
);

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const TitleSkeleton = styled.div`
  width: 200px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

const SubtitleSkeleton = styled.div`
  width: 120px;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  border-radius: 4px;
`;

const ChartArea = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem 0;
`;

const BarsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  gap: 0.5rem;
`;

const Bar = styled.div<{ height: number; delay: number }>`
  flex: 1;
  height: ${props => props.height}%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  animation-delay: ${props => props.delay}s;
  border-radius: 4px 4px 0 0;
`;

const LineContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const LinePath = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  transform: translateY(-50%);
`;

const Dot = styled.div<{ left: number; delay: number }>`
  position: absolute;
  top: 50%;
  left: ${props => props.left}%;
  width: 8px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ${pulse} 1.5s infinite;
  animation-delay: ${props => props.delay}s;
`;

const PieContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const PieCircle = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
`;

const Footer = styled.div`
  margin-top: 1.5rem;
`;

const LegendSkeleton = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;

  &::before,
  &::after {
    content: '';
    width: 80px;
    height: 16px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 1000px 100%;
    animation: ${shimmer} 2s infinite;
    border-radius: 4px;
  }
`;

export default ChartSkeleton;
