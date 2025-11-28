import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    // Get order info from localStorage or query params
    const stored = localStorage.getItem('completedOrder');
    if (stored) {
      setOrderInfo(JSON.parse(stored));
      // Clear after reading
      localStorage.removeItem('completedOrder');
    }
  }, []);

  return (
    <Layout>
      <Container>
        <SuccessCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <IconWrapper
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <FiCheckCircle size={80} />
          </IconWrapper>

          <Title>Thanh toán thành công!</Title>
          <Subtitle>Cảm ơn bạn đã đặt hàng tại Fashion Store</Subtitle>

          {orderInfo && (
            <OrderDetails>
              <DetailRow>
                <DetailLabel>Mã đơn hàng:</DetailLabel>
                <DetailValue>{orderInfo.orderNumber || orderInfo.id}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Tổng tiền:</DetailLabel>
                <DetailValue highlight>{orderInfo.total?.toLocaleString('vi-VN')} ₫</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Phương thức:</DetailLabel>
                <DetailValue>
                  {orderInfo.paymentMethod === 'bank' && 'Chuyển khoản ngân hàng'}
                  {orderInfo.paymentMethod === 'momo' && 'Ví MoMo'}
                  {orderInfo.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng'}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Trạng thái:</DetailLabel>
                <StatusBadge>Đã xác nhận</StatusBadge>
              </DetailRow>
            </OrderDetails>
          )}

          <InfoBox>
            <InfoIcon>
              <FiPackage />
            </InfoIcon>
            <InfoText>
              <InfoTitle>Đơn hàng đang được xử lý</InfoTitle>
              <InfoDesc>
                Chúng tôi sẽ gửi email xác nhận và thông tin vận chuyển đến bạn trong thời gian sớm nhất.
              </InfoDesc>
            </InfoText>
          </InfoBox>

          <ButtonGroup>
            <PrimaryButton
              onClick={() => router.push('/orders')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Xem đơn hàng
            </PrimaryButton>
            <SecondaryButton
              onClick={() => router.push('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiHome />
              Về trang chủ
            </SecondaryButton>
          </ButtonGroup>
        </SuccessCard>
      </Container>
    </Layout>
  );
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem 1rem;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
`;

const IconWrapper = styled(motion.div)`
  color: #10b981;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
`;

const OrderDetails = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const DetailValue = styled.span<{ highlight?: boolean }>`
  color: ${props => props.highlight ? '#ef4444' : '#1f2937'};
  font-weight: 600;
  font-size: ${props => props.highlight ? '1.25rem' : '1rem'};
`;

const StatusBadge = styled.span`
  background: #d1fae5;
  color: #065f46;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
`;

const InfoBox = styled.div`
  display: flex;
  gap: 1rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const InfoIcon = styled.div`
  color: #3b82f6;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.25rem;
`;

const InfoDesc = styled.p`
  font-size: 0.875rem;
  color: #3b82f6;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const PrimaryButton = styled(motion.button)`
  flex: 1;
  padding: 1rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1f2937;
  }
`;

const SecondaryButton = styled(motion.button)`
  flex: 1;
  padding: 1rem;
  background: white;
  color: #1f2937;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #000;
    color: #000;
  }
`;
