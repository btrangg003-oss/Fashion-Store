// Modern Badge Component
import React from 'react';
import styled from 'styled-components';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  icon
}) => {
  return (
    <StyledBadge $variant={variant} $size={size}>
      {dot && <Dot $variant={variant} />}
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {children}
    </StyledBadge>
  );
};

const variantColors = {
  primary: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  success: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  warning: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  error: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  info: { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  gray: { bg: '#f9fafb', color: '#374151', border: '#e5e7eb' },
};

const sizeStyles = {
  sm: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
  md: { padding: '0.375rem 0.75rem', fontSize: '0.875rem' },
  lg: { padding: '0.5rem 1rem', fontSize: '1rem' },
};

const StyledBadge = styled.span<{
  $variant: BadgeProps['variant'];
  $size: BadgeProps['size'];
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: ${props => sizeStyles[props.$size!].padding};
  font-size: ${props => sizeStyles[props.$size!].fontSize};
  font-weight: 600;
  border-radius: 9999px;
  background: ${props => variantColors[props.$variant!].bg};
  color: ${props => variantColors[props.$variant!].color};
  border: 1px solid ${props => variantColors[props.$variant!].border};
  white-space: nowrap;
`;

const Dot = styled.span<{ $variant: BadgeProps['variant'] }>`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: ${props => variantColors[props.$variant || "default"]?.color || "#gray"};
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
`;

export default Badge;
