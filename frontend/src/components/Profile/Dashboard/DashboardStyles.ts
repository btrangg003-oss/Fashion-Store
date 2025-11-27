import styled from 'styled-components';
import { motion } from 'framer-motion';

// Standard Dashboard Card - Consistent sizing
export const DashboardCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    border-color: #e0e0e0;
  }
`;

// Card Header with consistent styling
export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

export const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CardSubtitle = styled.p`
  font-size: 13px;
  color: #666;
  margin: 4px 0 0 0;
`;

// Card Body - Flexible content area
export const CardBody = styled.div`
  flex: 1;
  overflow: hidden;
`;

// Card Footer
export const CardFooter = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

// Standard Grid Layouts
export const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const DashboardGridThree = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const DashboardGridFour = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

// Full Width Card
export const FullWidthCard = styled(DashboardCard)`
  margin-bottom: 24px;
`;

// Half Width Cards Container
export const HalfWidthContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

// Compact Card (for smaller widgets)
export const CompactCard = styled(DashboardCard)`
  padding: 16px;
  min-height: 200px;
`;

// Large Card (for charts, tables)
export const LargeCard = styled(DashboardCard)`
  min-height: 400px;
`;

// Medium Card (default)
export const MediumCard = styled(DashboardCard)`
  min-height: 300px;
`;

// Small Card (for stats)
export const SmallCard = styled(DashboardCard)`
  padding: 20px;
  min-height: 140px;
`;

// Empty State
export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #666;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #999;
    margin: 0;
  }
`;

// Loading State
export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
`;

// Badge
export const Badge = styled.span<{ $variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  
  ${props => {
        switch (props.$variant) {
            case 'success':
                return 'background: #10b98115; color: #10b981;';
            case 'warning':
                return 'background: #f59e0b15; color: #f59e0b;';
            case 'danger':
                return 'background: #ef444415; color: #ef4444;';
            case 'info':
                return 'background: #3b82f615; color: #3b82f6;';
            default:
                return 'background: #667eea15; color: #667eea;';
        }
    }}
`;

// Icon Container
export const IconContainer = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$color || '#667eea'}15;
  color: ${props => props.$color || '#667eea'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

// Button Variants
export const PrimaryButton = styled.button`
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5568d3;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TextButton = styled.button`
  padding: 8px 16px;
  background: transparent;
  color: #667eea;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #667eea10;
    border-radius: 6px;
  }
`;

// Divider
export const Divider = styled.hr`
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 16px 0;
`;

// Flex utilities
export const FlexBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FlexCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FlexStart = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
