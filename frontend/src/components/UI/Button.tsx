// Modern Button Component
import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  return (
    <StyledButton
      as={motion.button}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && leftIcon && <IconWrapper>{leftIcon}</IconWrapper>}
      <span>{children}</span>
      {!loading && rightIcon && <IconWrapper>{rightIcon}</IconWrapper>}
    </StyledButton>
  );
};

const variantStyles = {
  primary: css`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }
  `,
  secondary: css`
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(240, 147, 251, 0.6);
    }
  `,
  success: css`
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(56, 239, 125, 0.6);
    }
  `,
  danger: css`
    background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(238, 9, 121, 0.4);

    &:hover:not(:disabled) {
      box-shadow: 0 6px 20px rgba(238, 9, 121, 0.6);
    }
  `,
  ghost: css`
    background: transparent;
    color: #667eea;
    border: none;

    &:hover:not(:disabled) {
      background: rgba(102, 126, 234, 0.1);
    }
  `,
  outline: css`
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover:not(:disabled) {
      background: #667eea;
      color: white;
    }
  `,
};

const sizeStyles = {
  xs: css`
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 0.375rem;
  `,
  sm: css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    border-radius: 0.5rem;
  `,
  md: css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 0.75rem;
  `,
  lg: css`
    padding: 1rem 2rem;
    font-size: 1.125rem;
    border-radius: 0.875rem;
  `,
  xl: css`
    padding: 1.25rem 2.5rem;
    font-size: 1.25rem;
    border-radius: 1rem;
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};

  ${props => variantStyles[props.$variant!]}
  ${props => sizeStyles[props.$size!]}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 1em;
  height: 1em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

export default Button;
