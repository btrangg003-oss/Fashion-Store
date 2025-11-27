import { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export default function PieChart({ data, size = 300 }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Calculate total
    const total = data.reduce((sum, d) => sum + d.value, 0);

    // Draw pie chart
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(size / 2, size / 2) - 20;
    const innerRadius = radius * 0.6; // Donut chart

    let currentAngle = -Math.PI / 2; // Start from top

    data.forEach(item => {
      const sliceAngle = (item.value / total) * Math.PI * 2;

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      currentAngle += sliceAngle;
    });

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw center circle (for donut effect)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

  }, [data, size]);

  return (
    <ChartContainer>
      <Canvas ref={canvasRef} width={size} height={size} />
      <Legend>
        {data.map((item, index) => (
          <LegendItem key={index}>
            <LegendColor color={item.color} />
            <LegendLabel>{item.label}</LegendLabel>
          </LegendItem>
        ))}
      </Legend>
    </ChartContainer>
  );
}

const ChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Canvas = styled.canvas`
  display: block;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: ${props => props.color};
`;

const LegendLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;
