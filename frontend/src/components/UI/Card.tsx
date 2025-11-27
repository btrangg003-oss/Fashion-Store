// Modern Card Component
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  gradient?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  padding = 'md',
  shadow = 'md',
  gradient = false,
  className
}) => {
  return (
    <StyledCard
      as={hover ? motion.div : 'div'}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' } : undefined}
      $padding={padding}
      $shadow={shadow}
      $gradient={gradient}
      className={className}
    >
      {children}
    </StyledCard>
  );
};

const paddingStyles = {
  none: '0',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
};

const shadowStyles = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.1)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 10px 30px rgba(0,0,0,0.12)',
};

const StyledCard = styled.div<{
  $padding: CardProps['padding'];
  $shadow: CardProps['shadow'];
  $gradient: boolean;
}>`
  background: ${props => props.$gradient 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'white'};
  border-radius: 1rem;
  padding: ${props => paddingStyles[props.$padding!]};
  box-shadow: ${props => shadowStyles[props.$shadow!]};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${props => props.$gradient ? 'transparent' : '#f3f4f6'};
  
  ${props => props.$gradient && `
    color: white;
    
    * {
      color: white;
    }
  `}
`;

export default Card;
