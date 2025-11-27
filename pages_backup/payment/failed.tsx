import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import { FiXCircle, FiRefreshCw, FiHome, FiHelpCircle } from 'react-icons/fi';

export default function PaymentFailedPage() {
  const router = useRouter();
  const { reason } = router.query;

  const getFailureReason = () => {
    switch (reason) {
      case 'timeout':
        return 'Phiên thanh toán đã hết hạn';
      case 'cancelled':
        return 'Giao dịch đã bị hủy';
      case 'insufficient':
        return 'Số dư không đủ';
      case 'invalid':
        return 'Thông tin thanh toán không hợp lệ';
      default:
        return 'Không thể xác nhận thanh toán';
    }
  };

  const handleRetry = () => {
    router.push('/checkout');
  };

  return (
    <Layout>
      <Container>
        <FailedCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <IconWrapper
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <FiXCircle size={80} />
          </IconWrapper>

          <Title>Thanh toán thất bại</Title>
          <Subtitle>{getFailureReason()}</Subtitle>

          <ReasonBox>
            <ReasonTitle>Có thể do các nguyên nhân sau:</ReasonTitle>
            <ReasonList>
              <ReasonItem>• Phiên thanh toán đã hết hạn (quá 5 phút)</ReasonItem>
              <ReasonItem>• Thông tin thanh toán không chính xác</ReasonItem>
              <ReasonItem>• Số dư tài khoản không đủ</ReasonItem>
              <ReasonItem>• Lỗi kết nối mạng</ReasonItem>
              <ReasonItem>• Giao dịch bị từ chối bởi ngân hàng</ReasonItem>
            </ReasonList>
          </ReasonBox>

          <SupportBox>
            <SupportIcon>
              <FiHelpCircle />
            </SupportIcon>
            <SupportText>
              <SupportTitle>Cần hỗ trợ?</SupportTitle>
              <SupportDesc>
                Liên hệ với chúng tôi qua hotline: <strong>1900 xxxx</strong> hoặc email: <strong>support@fashionstore.com</strong>
              </SupportDesc>
            </SupportText>
          </SupportBox>

          <ButtonGroup>
            <PrimaryButton
              onClick={handleRetry}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiRefreshCw />
              Thử lại
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

          <HelpLinks>
            <HelpLink onClick={() => router.push('/help/payment')}>
              Hướng dẫn thanh toán
            </HelpLink>
            <HelpLink onClick={() => router.push('/contact')}>
              Liên hệ hỗ trợ
            </HelpLink>
          </HelpLinks>
        </FailedCard>
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

const FailedCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
`;

const IconWrapper = styled(motion.div)`
  color: #ef4444;
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

const ReasonBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
`;

const ReasonTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #991b1b;
  margin-bottom: 1rem;
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ReasonItem = styled.div`
  font-size: 0.875rem;
  color: #dc2626;
  line-height: 1.5;
`;

const SupportBox = styled.div`
  display: flex;
  gap: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const SupportIcon = styled.div`
  color: #16a34a;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const SupportText = styled.div`
  flex: 1;
`;

const SupportTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #15803d;
  margin-bottom: 0.25rem;
`;

const SupportDesc = styled.p`
  font-size: 0.875rem;
  color: #16a34a;
  line-height: 1.5;

  strong {
    font-weight: 700;
    color: #15803d;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const PrimaryButton = styled(motion.button)`
  flex: 1;
  padding: 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
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

const HelpLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const HelpLink = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: #1d4ed8;
  }
`;
