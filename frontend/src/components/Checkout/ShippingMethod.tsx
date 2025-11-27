import React, { useState } from 'react';
import styled from 'styled-components';

interface ShippingMethodProps {
  onNext: (method: ShippingMethodData) => void;
  onBack: () => void;
  initialMethod?: ShippingMethodData;
}

export interface ShippingMethodData {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

const shippingMethods: ShippingMethodData[] = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    price: 30000,
    estimatedDays: '3-5 ngày'
  },
  {
    id: 'express',
    name: 'Giao hàng nhanh',
    price: 50000,
    estimatedDays: '1-2 ngày'
  },
  {
    id: 'super-express',
    name: 'Giao hàng hỏa tốc',
    price: 80000,
    estimatedDays: 'Trong ngày'
  }
];

const ShippingMethod: React.FC<ShippingMethodProps> = ({ onNext, onBack, initialMethod }) => {
  const [selectedMethod, setSelectedMethod] = useState<ShippingMethodData>(
    initialMethod || shippingMethods[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(selectedMethod);
  };

  return (
    <Container>
      <FormTitle>Chọn phương thức vận chuyển</FormTitle>
      
      <Form onSubmit={handleSubmit}>
        <MethodsList>
          {shippingMethods.map((method) => (
            <MethodCard
              key={method.id}
              $selected={selectedMethod.id === method.id}
              onClick={() => setSelectedMethod(method)}
            >
              <Radio
                type="radio"
                name="shippingMethod"
                checked={selectedMethod.id === method.id}
                onChange={() => setSelectedMethod(method)}
              />
              <MethodInfo>
                <MethodName>{method.name}</MethodName>
                <MethodTime>{method.estimatedDays}</MethodTime>
              </MethodInfo>
              <MethodPrice>{method.price.toLocaleString('vi-VN')}đ</MethodPrice>
            </MethodCard>
          ))}
        </MethodsList>

        <ButtonGroup>
          <BackButton type="button" onClick={onBack}>
            Quay lại
          </BackButton>
          <SubmitButton type="submit">
            Tiếp tục
          </SubmitButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Form = styled.form``;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
`;

const MethodsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MethodCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$selected ? '#eff6ff' : 'white'};

  &:hover {
    border-color: #3b82f6;
  }
`;

const Radio = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const MethodInfo = styled.div`
  flex: 1;
`;

const MethodName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const MethodTime = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const MethodPrice = styled.div`
  font-weight: 600;
  color: #3b82f6;
  font-size: 1.125rem;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BackButton = styled.button`
  padding: 1rem;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

export default ShippingMethod;
