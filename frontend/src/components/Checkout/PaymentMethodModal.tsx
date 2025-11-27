import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCreditCard, FaWallet, FaTimes } from 'react-icons/fa';

interface PaymentMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMethod: (method: PaymentMethod) => void;
    amount: number;
}

export interface PaymentMethod {
    id: string;
    name: string;
    type: 'cod' | 'card' | 'ewallet';
    provider?: 'momo' | 'vnpay';
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
    isOpen,
    onClose,
    onSelectMethod,
    amount
}) => {
    const [selectedCategory, setSelectedCategory] = useState<'cod' | 'card' | 'ewallet'>('cod');

    if (!isOpen) return null;

    const handleSelectMethod = (method: PaymentMethod) => {
        onSelectMethod(method);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>Chọn phương thức thanh toán</Title>
                    <CloseButton onClick={onClose}>
                        <FaTimes />
                    </CloseButton>
                </Header>

                <Amount>Số tiền: {amount.toLocaleString('vi-VN')}đ</Amount>

                <Categories>
                    <CategoryButton
                        $active={selectedCategory === 'cod'}
                        onClick={() => setSelectedCategory('cod')}
                    >
                        Thanh toán khi nhận hàng
                    </CategoryButton>
                    <CategoryButton
                        $active={selectedCategory === 'card'}
                        onClick={() => setSelectedCategory('card')}
                    >
                        <FaCreditCard /> Thẻ ATM/Visa
                    </CategoryButton>
                    <CategoryButton
                        $active={selectedCategory === 'ewallet'}
                        onClick={() => setSelectedCategory('ewallet')}
                    >
                        <FaWallet /> Ví điện tử
                    </CategoryButton>
                </Categories>

                <MethodsList>
                    {selectedCategory === 'cod' && (
                        <MethodCard onClick={() => handleSelectMethod({ id: 'cod', name: 'Thanh toán khi nhận hàng', type: 'cod' })}>
                            <MethodIcon>💵</MethodIcon>
                            <MethodInfo>
                                <MethodName>Thanh toán khi nhận hàng (COD)</MethodName>
                                <MethodDesc>Thanh toán bằng tiền mặt khi nhận hàng</MethodDesc>
                            </MethodInfo>
                        </MethodCard>
                    )}

                    {selectedCategory === 'card' && (
                        <>
                            <MethodCard onClick={() => handleSelectMethod({ id: 'atm', name: 'Thẻ ATM', type: 'card' })}>
                                <MethodIcon><FaCreditCard /></MethodIcon>
                                <MethodInfo>
                                    <MethodName>Thẻ ATM nội địa</MethodName>
                                    <MethodDesc>Thanh toán qua thẻ ATM các ngân hàng Việt Nam</MethodDesc>
                                </MethodInfo>
                            </MethodCard>
                            <MethodCard onClick={() => handleSelectMethod({ id: 'visa', name: 'Thẻ Visa/Mastercard', type: 'card' })}>
                                <MethodIcon><FaCreditCard /></MethodIcon>
                                <MethodInfo>
                                    <MethodName>Thẻ Visa/Mastercard/JCB</MethodName>
                                    <MethodDesc>Thanh toán qua thẻ quốc tế</MethodDesc>
                                </MethodInfo>
                            </MethodCard>
                        </>
                    )}

                    {selectedCategory === 'ewallet' && (
                        <>
                            <MethodCard onClick={() => handleSelectMethod({ id: 'momo', name: 'Ví MoMo', type: 'ewallet', provider: 'momo' })}>
                                <MethodIcon style={{ color: '#d82d8b' }}>💳</MethodIcon>
                                <MethodInfo>
                                    <MethodName>Ví MoMo</MethodName>
                                    <MethodDesc>Thanh toán qua ví điện tử MoMo</MethodDesc>
                                </MethodInfo>
                            </MethodCard>
                            <MethodCard onClick={() => handleSelectMethod({ id: 'vnpay', name: 'VNPay', type: 'ewallet', provider: 'vnpay' })}>
                                <MethodIcon style={{ color: '#0066b2' }}><FaWallet /></MethodIcon>
                                <MethodInfo>
                                    <MethodName>VNPay</MethodName>
                                    <MethodDesc>Thanh toán qua ví điện tử VNPay</MethodDesc>
                                </MethodInfo>
                            </MethodCard>
                        </>
                    )}
                </MethodsList>
            </Modal>
        </Overlay>
    );
};

export default PaymentMethodModal;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #1f2937;
  }
`;

const Amount = styled.div`
  padding: 1rem 1.5rem;
  background: #f9fafb;
  font-size: 1.125rem;
  font-weight: 600;
  color: #3b82f6;
  text-align: center;
`;

const Categories = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  overflow-x: auto;
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.25rem;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    border-color: #3b82f6;
  }
`;

const MethodsList = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MethodCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: #f9fafb;
  }
`;

const MethodIcon = styled.div`
  font-size: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MethodInfo = styled.div`
  flex: 1;
`;

const MethodName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const MethodDesc = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;
