import React, { useState } from 'react';
import styled from 'styled-components';
import { FiTag, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

interface VoucherInputProps {
  onApply: (code: string, discount: number) => void;
  onRemove: (code: string) => void;
  orderValue: number;
  appliedVouchers?: Array<{
    code: string;
    discount: number;
  }>;
}

const VoucherInput: React.FC<VoucherInputProps> = ({
  onApply,
  onRemove,
  orderValue,
  appliedVouchers = []
}) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState(false);

  const handleApply = async () => {
    if (!voucherCode.trim()) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          code: voucherCode.toUpperCase(),
          orderValue
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        onApply(voucherCode.toUpperCase(), data.discountAmount);
        setVoucherCode('');
        setShowInput(false);
        setError('');
      } else {
        setError(data.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
      setError('Có lỗi xảy ra. Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (code: string) => {
    onRemove(code);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <Container>
      {appliedVouchers.length > 0 && (
        <AppliedVouchersContainer>
          {appliedVouchers.map((voucher) => (
            <AppliedVoucher key={voucher.code}>
              <VoucherInfo>
                <FiCheck style={{ color: '#10b981', fontSize: '20px' }} />
                <div>
                  <VoucherCode>{voucher.code}</VoucherCode>
                  <DiscountText>
                    Giảm {formatPrice(voucher.discount)}
                  </DiscountText>
                </div>
              </VoucherInfo>
              <RemoveButton onClick={() => handleRemove(voucher.code)}>
                <FiX />
              </RemoveButton>
            </AppliedVoucher>
          ))}
        </AppliedVouchersContainer>
      )}

      {!showInput ? (
        <ShowInputButton onClick={() => setShowInput(true)}>
          <FiTag /> {appliedVouchers.length > 0 ? 'Thêm mã giảm giá' : 'Nhập mã giảm giá'}
        </ShowInputButton>
      ) : (
        <InputContainer>
          <InputWrapper>
            <StyledInput
              type="text"
              placeholder="Nhập mã giảm giá"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <ApplyButton onClick={handleApply} disabled={loading || !voucherCode.trim()}>
              {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
            </ApplyButton>
          </InputWrapper>
          {error && (
            <ErrorMessage>
              <FiAlertCircle /> {error}
            </ErrorMessage>
          )}
          <CancelButton onClick={() => {
            setShowInput(false);
            setVoucherCode('');
            setError('');
          }}>
            Hủy
          </CancelButton>
        </InputContainer>
      )}
    </Container>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const Container = styled.div`
  margin: 1rem 0;
`;

const ShowInputButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
  }

  svg {
    font-size: 1rem;
  }
`;

const InputContainer = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const StyledInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  &::placeholder {
    text-transform: none;
    font-weight: 400;
    letter-spacing: normal;
  }
`;

const ApplyButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.5rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #374151;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  margin-top: 0.5rem;

  svg {
    flex-shrink: 0;
  }
`;

const AppliedVouchersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const AppliedVoucher = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #10b981;
  border-radius: 0.5rem;
`;

const VoucherInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const VoucherCode = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #065f46;
  letter-spacing: 0.5px;
`;

const DiscountText = styled.div`
  font-size: 0.75rem;
  color: #047857;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  padding: 0.5rem;
  background: white;
  border: none;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  svg {
    font-size: 1.25rem;
  }
`;

export default VoucherInput;
