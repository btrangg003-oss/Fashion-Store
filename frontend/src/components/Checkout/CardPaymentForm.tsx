import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCreditCard, FaLock } from 'react-icons/fa';

interface CardPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cardData: CardData) => void;
  amount: number;
}

export interface CardData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  amount
}) => {
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [errors, setErrors] = useState<Partial<CardData>>({});

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleChange = (field: keyof CardData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value.replace(/\D/g, '').slice(0, 16));
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value.slice(0, 5));
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    
    setCardData({ ...cardData, [field]: formattedValue });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    const newErrors: Partial<CardData> = {};
    
    if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Số thẻ không hợp lệ';
    }
    
    if (!cardData.cardName) {
      newErrors.cardName = 'Vui lòng nhập tên chủ thẻ';
    }
    
    if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
      newErrors.expiryDate = 'Ngày hết hạn không hợp lệ';
    }
    
    if (!cardData.cvv || cardData.cvv.length !== 3) {
      newErrors.cvv = 'CVV không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(cardData);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Thanh toán bằng thẻ</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Amount>
          <FaLock /> Thanh toán an toàn: {amount.toLocaleString('vi-VN')}đ
        </Amount>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Số thẻ *</Label>
            <InputWrapper>
              <FaCreditCard />
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={(e) => handleChange('cardNumber', e.target.value)}
                $error={!!errors.cardNumber}
              />
            </InputWrapper>
            {errors.cardNumber && <ErrorText>{errors.cardNumber}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label>Tên chủ thẻ *</Label>
            <Input
              type="text"
              placeholder="NGUYEN VAN A"
              value={cardData.cardName}
              onChange={(e) => handleChange('cardName', e.target.value.toUpperCase())}
              $error={!!errors.cardName}
            />
            {errors.cardName && <ErrorText>{errors.cardName}</ErrorText>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Ngày hết hạn *</Label>
              <Input
                type="text"
                placeholder="MM/YY"
                value={cardData.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                $error={!!errors.expiryDate}
              />
              {errors.expiryDate && <ErrorText>{errors.expiryDate}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>CVV *</Label>
              <Input
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleChange('cvv', e.target.value)}
                $error={!!errors.cvv}
              />
              {errors.cvv && <ErrorText>{errors.cvv}</ErrorText>}
            </FormGroup>
          </FormRow>

          <SecurityNote>
            <FaLock />
            Thông tin thẻ của bạn được mã hóa và bảo mật tuyệt đối
          </SecurityNote>

          <SubmitButton type="submit">
            Xác nhận thanh toán
          </SubmitButton>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default CardPaymentForm;

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
  z-index: 1002;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
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
  background: #eff6ff;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e40af;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 1rem;
    color: #6b7280;
  }
`;

const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  padding-left: ${props => props.type === 'text' && props.placeholder?.includes('1234') ? '3rem' : '0.75rem'};
  border: 2px solid ${props => props.$error ? '#ef4444' : '#d1d5db'};
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$error ? '#ef4444' : '#3b82f6'};
    box-shadow: 0 0 0 3px ${props => props.$error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
  }
`;

const ErrorText = styled.span`
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #166534;
  margin-bottom: 1.5rem;
  
  svg {
    color: #16a34a;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
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
