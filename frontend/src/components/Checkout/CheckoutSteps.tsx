import React from 'react';
import styled from 'styled-components';

interface CheckoutStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'Thông tin giao hàng' },
  { number: 2, title: 'Vận chuyển' },
  { number: 3, title: 'Thanh toán' }
];

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ currentStep }) => {
  return (
    <StepsContainer>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <Step $active={currentStep >= step.number} $completed={currentStep > step.number}>
            <StepNumber $active={currentStep >= step.number} $completed={currentStep > step.number}>
              {currentStep > step.number ? '✓' : step.number}
            </StepNumber>
            <StepTitle $active={currentStep >= step.number}>{step.title}</StepTitle>
          </Step>
          {index < steps.length - 1 && (
            <StepLine $completed={currentStep > step.number} />
          )}
        </React.Fragment>
      ))}
    </StepsContainer>
  );
};

const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
  padding: 0 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: ${props => props.$active ? 1 : 0.5};
  transition: opacity 0.3s;

  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
  }
`;

const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: ${props => props.$completed ? '#10b981' : props.$active ? '#3b82f6' : '#e5e7eb'};
  color: ${props => props.$active || props.$completed ? 'white' : '#6b7280'};
  transition: all 0.3s;
`;

const StepTitle = styled.span<{ $active: boolean }>`
  font-size: 0.875rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#1f2937' : '#6b7280'};

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StepLine = styled.div<{ $completed: boolean }>`
  width: 100px;
  height: 2px;
  background: ${props => props.$completed ? '#10b981' : '#e5e7eb'};
  margin: 0 1rem;
  transition: background 0.3s;

  @media (max-width: 768px) {
    display: none;
  }
`;

export default CheckoutSteps;
