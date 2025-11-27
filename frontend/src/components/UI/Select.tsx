// Modern Select Component
import React from 'react';
import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = false,
  ...props
}) => {
  return (
    <Container $fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <SelectWrapper $hasError={!!error}>
        <StyledSelect {...props}>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </StyledSelect>
        <IconWrapper>
          <FiChevronDown />
        </IconWrapper>
      </SelectWrapper>
      {error && <ErrorText>{error}</ErrorText>}
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

const SelectWrapper = styled.div<{ $hasError: boolean }>`
  position: relative;
  background: white;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 0.75rem;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${props => props.$hasError ? '#ef4444' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #1f2937;
  cursor: pointer;
  appearance: none;

  &:focus {
    outline: none;
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    color: #9ca3af;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  display: flex;
  align-items: center;
`;

const ErrorText = styled.span`
  display: block;
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: #ef4444;
`;

export default Select;
