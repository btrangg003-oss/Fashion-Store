import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';

interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: string;
  amount: number;
  orderId: string;
  onSuccess: () => void;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  orderId,
  onSuccess
}) => {
  const [countdown, setCountdown] = useState(15);
  const [qrCode, setQrCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Generate QR code
      generateQRCode();

      // Start countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            simulatePaymentSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  const generateQRCode = async () => {
    try {
      const response = await fetch('/api/payment/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          paymentMethod
        })
      });
      const data = await response.json();
      setQrCode(data.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${orderId}`);
    } catch (error) {
      console.error('Error generating QR:', error);
      setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${orderId}`);
    }
  };

  const simulatePaymentSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>Quét mã QR để thanh toán</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Content>
          {!isProcessing ? (
            <>
              <PaymentInfo>
                <InfoRow>
                  <Label>Phương thức:</Label>
                  <Value>{paymentMethod === 'momo' ? 'Ví MoMo' : 'VNPay'}</Value>
                </InfoRow>
                <InfoRow>
                  <Label>Số tiền:</Label>
                  <ValueHighlight>{amount.toLocaleString('vi-VN')}đ</ValueHighlight>
                </InfoRow>
                <InfoRow>
                  <Label>Mã đơn hàng:</Label>
                  <Value>{orderId}</Value>
                </InfoRow>
              </PaymentInfo>

              <QRContainer>
                {qrCode && (
                  <img src={qrCode} alt="QR Code" width={300} height={300} style={{ borderRadius: '0.5rem' }} />
                )}
              </QRContainer>

              <Instructions>
                <InstructionTitle>Hướng dẫn thanh toán:</InstructionTitle>
                <InstructionList>
                  <li>Mở ứng dụng {paymentMethod === 'momo' ? 'MoMo' : 'VNPay'} trên điện thoại</li>
                  <li>Chọn &quot;Quét mã QR&quot;</li>
                  <li>Quét mã QR trên màn hình</li>
                  <li>Xác nhận thanh toán</li>
                </InstructionList>
              </Instructions>

              <Countdown>
                <CountdownText>Tự động chuyển sau</CountdownText>
                <CountdownNumber>{countdown}s</CountdownNumber>
              </Countdown>
            </>
          ) : (
            <ProcessingContainer>
              <SuccessIcon><FaCheckCircle /></SuccessIcon>
              <ProcessingText>Đang xử lý thanh toán...</ProcessingText>
            </ProcessingContainer>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
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

const Content = styled.div`
  padding: 2rem;
`;

const PaymentInfo = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Value = styled.span`
  color: #1f2937;
  font-weight: 500;
  font-size: 0.875rem;
`;

const ValueHighlight = styled.span`
  color: #3b82f6;
  font-weight: 700;
  font-size: 1rem;
`;

const QRContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
`;



const Instructions = styled.div`
  margin: 1.5rem 0;
`;

const InstructionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const InstructionList = styled.ol`
  padding-left: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const Countdown = styled.div`
  text-align: center;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 0.5rem;
`;

const CountdownText = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const CountdownNumber = styled.div`
  color: #3b82f6;
  font-size: 2rem;
  font-weight: 700;
`;

const ProcessingContainer = styled.div`
  text-align: center;
  padding: 3rem 1rem;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1rem;
  animation: scaleIn 0.3s ease-out;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`;

const ProcessingText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

export default QRPaymentModal;