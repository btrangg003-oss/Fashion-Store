// Modern Input Component
import React from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}) => {
  return (
    <Container $fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <InputWrapper $hasError={!!error}>
        {leftIcon && <IconLeft>{leftIcon}</IconLeft>}
        <StyledInput
          $hasLeftIcon={!!leftIcon}
          $hasRightIcon={!!rightIcon}
          {...props}
        />
        {rightIcon && <IconRight>{rightIcon}</IconRight>}
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
      {helperText && !error && <HelperText>{helperText}</HelperText>}
    </Container>
  );
};

const Container = styled.div<{ $fullWidth: boolean }>`
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const InputWrapper = styled.div<{ $hasError: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 0.75rem;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${props => props.$hasError ? '#ef4444' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const StyledInput = styled.input<{ $hasLeftIcon: boolean; $hasRightIcon: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  padding-left: ${props => props.$hasLeftIcon ? '2.75rem' : '1rem'};
  padding-right: ${props => props.$hasRightIcon ? '2.75rem' : '1rem'};
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #1f2937;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #9ca3af;
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    color: #9ca3af;
  }
`;

const IconLeft = styled.div`
  position: absolute;
  left: 1rem;
  display: flex;
  align-items: center;
  color: #6b7280;
`;

const IconRight = styled.div`
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
  color: #6b7280;
`;

const ErrorText = styled.span`
  display: block;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: #ef4444;
`;

const HelperText = styled.span`
  display: block;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

export default Input;
