import { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface LineChartProps {
    data: { label: string; value: number }[];
    color?: string;
    height?: number;
}

export default function LineChart({ data, color = '#3b82f6', height = 300 }: LineChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || data.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Calculate dimensions
        const padding = 40;
        const chartWidth = rect.width - padding * 2;
        const chartHeight = rect.height - padding * 2;

        // Find min and max values
        const values = data.map(d => d.value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values, 0);
        const valueRange = maxValue - minValue;

        // Draw grid lines
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();

            // Draw y-axis labels
            const value = maxValue - (valueRange / 5) * i;
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(0), padding - 10, y + 4);
        }

        // Calculate points
        const points = data.map((d, i) => {
            const x = padding + (chartWidth / (data.length - 1)) * i;
            const normalizedValue = (d.value - minValue) / valueRange;
            const y = padding + chartHeight - normalizedValue * chartHeight;
            return { x, y, label: d.label };
        });

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(1, color + '00');

        ctx.beginPath();
        ctx.moveTo(points[0].x, padding + chartHeight);
        points.forEach((point, i) => {
            if (i === 0) {
                ctx.lineTo(point.x, point.y);
            } else {
                // Smooth curve
                const prevPoint = points[i - 1];
                const cpX = (prevPoint.x + point.x) / 2;
                ctx.bezierCurveTo(cpX, prevPoint.y, cpX, point.y, point.x, point.y);
            }
        });
        ctx.lineTo(points[points.length - 1].x, padding + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        points.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                const prevPoint = points[i - 1];
                const cpX = (prevPoint.x + point.x) / 2;
                ctx.bezierCurveTo(cpX, prevPoint.y, cpX, point.y, point.x, point.y);
            }
        });
        ctx.stroke();

        // Draw points
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw x-axis labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        points.forEach(point => {
            ctx.fillText(point.label, point.x, padding + chartHeight + 20);
        });

    }, [data, color, height]);

    return (
        <ChartContainer>
            <Canvas ref={canvasRef} height={height} />
        </ChartContainer>
    );
}

const ChartContainer = styled.div`
  width: 100%;
  position: relative;
`;

const Canvas = styled.canvas<{ height: number }>`
  width: 100%;
  height: ${props => props.height}px;
  display: block;
`;
