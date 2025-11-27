import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';

interface PaymentMethodsProps {
  orderId: string;
  amount: number;
  onPaymentCreated: (paymentData: any) => void;
  onError: (error: string) => void;
}

const PaymentContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
`;

const PaymentTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #1a202c;
`;

const PaymentAmount = styled.div`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #e53e3e;
  margin-bottom: 2rem;
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PaymentOption = styled.button<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? '#3182ce' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.selected ? '#ebf8ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3182ce;
    background: #f7fafc;
  }
`;

const PaymentIcon = styled.div`
  font-size: 1.5rem;
  color: #3182ce;
`;

const PaymentInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const PaymentName = styled.div`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
`;

const PaymentDesc = styled.div`
  font-size: 0.875rem;
  color: #718096;
`;

const PayButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PaymentResult = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
`;

const QRCode = styled.img`
  max-width: 300px;
  width: 100%;
  height: auto;
  margin: 1rem auto;
  display: block;
`;

const BankInfo = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const BankInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BankInfoLabel = styled.span`
  font-weight: 600;
  color: #4a5568;
`;

const BankInfoValue = styled.span`
  color: #1a202c;
  font-family: monospace;
`;

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  orderId,
  amount,
  onPaymentCreated,
  onError
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const paymentOptions = [
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: <FiSmartphone />
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản qua QR Code hoặc số tài khoản',
      icon: <FiCreditCard />
    },
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: <FiDollarSign />
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      onError('Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (selectedMethod === 'cod') {
      // COD doesn't need payment processing
      onPaymentCreated({
        paymentMethod: 'cod',
        message: 'Đơn hàng sẽ được thanh toán khi nhận hàng'
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          paymentMethod: selectedMethod
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment creation failed');
      }

      setPaymentData(result.data);
      onPaymentCreated(result.data);

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentResult = () => {
    if (!paymentData) return null;

    switch (paymentData.paymentMethod) {
      case 'momo':
        return (
          <PaymentResult>
            <h3>Thanh toán MoMo</h3>
            {paymentData.qrCodeUrl && (
              <div>
                <p>Quét mã QR để thanh toán:</p>
                <QRCode src={paymentData.qrCodeUrl} alt="MoMo QR Code" />
              </div>
            )}
            {paymentData.payUrl && (
              <div>
                <p>Hoặc nhấn vào link để mở ứng dụng MoMo:</p>
                <a 
                  href={paymentData.payUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#3182ce', textDecoration: 'underline' }}
                >
                  Mở ứng dụng MoMo
                </a>
              </div>
            )}
          </PaymentResult>
        );

      case 'bank_transfer':
        return (
          <PaymentResult>
            <h3>Chuyển khoản ngân hàng</h3>
            {paymentData.qrCode && (
              <div>
                <p>Quét mã QR để chuyển khoản:</p>
                <QRCode src={paymentData.qrCode} alt="Bank QR Code" />
              </div>
            )}
            {paymentData.bankInfo && (
              <BankInfo>
                <h4>Thông tin chuyển khoản:</h4>
                <BankInfoRow>
                  <BankInfoLabel>Ngân hàng:</BankInfoLabel>
                  <BankInfoValue>{paymentData.bankInfo.bankName}</BankInfoValue>
                </BankInfoRow>
                <BankInfoRow>
                  <BankInfoLabel>Số tài khoản:</BankInfoLabel>
                  <BankInfoValue>{paymentData.bankInfo.accountNo}</BankInfoValue>
                </BankInfoRow>
                <BankInfoRow>
                  <BankInfoLabel>Tên tài khoản:</BankInfoLabel>
                  <BankInfoValue>{paymentData.bankInfo.accountName}</BankInfoValue>
                </BankInfoRow>
                <BankInfoRow>
                  <BankInfoLabel>Số tiền:</BankInfoLabel>
                  <BankInfoValue>{formatCurrency(paymentData.bankInfo.amount)}</BankInfoValue>
                </BankInfoRow>
                <BankInfoRow>
                  <BankInfoLabel>Nội dung:</BankInfoLabel>
                  <BankInfoValue>{paymentData.bankInfo.description}</BankInfoValue>
                </BankInfoRow>
              </BankInfo>
            )}
            <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '1rem' }}>
              Sau khi chuyển khoản, đơn hàng sẽ được xác nhận trong vòng 1-2 giờ làm việc.
            </p>
          </PaymentResult>
        );

      default:
        return null;
    }
  };

  return (
    <PaymentContainer>
      <PaymentTitle>Chọn phương thức thanh toán</PaymentTitle>
      
      <PaymentAmount>
        Số tiền: {formatCurrency(amount)}
      </PaymentAmount>

      <PaymentOptions>
        {paymentOptions.map(option => (
          <PaymentOption
            key={option.id}
            selected={selectedMethod === option.id}
            onClick={() => setSelectedMethod(option.id)}
          >
            <PaymentIcon>{option.icon}</PaymentIcon>
            <PaymentInfo>
              <PaymentName>{option.name}</PaymentName>
              <PaymentDesc>{option.description}</PaymentDesc>
            </PaymentInfo>
          </PaymentOption>
        ))}
      </PaymentOptions>

      <PayButton
        onClick={handlePayment}
        disabled={!selectedMethod || loading}
      >
        {loading ? 'Đang xử lý...' : 'Thanh toán'}
      </PayButton>

      {renderPaymentResult()}
    </PaymentContainer>
  );
};

export default PaymentMethods;