import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';
import { FaCheckCircle, FaBox, FaHome } from 'react-icons/fa';
import Layout from '@/components/Layout/Layout';

const CheckoutSuccessPage = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId as string);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/orders?orderId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  };

  return (
    <Layout>
      <Container>
        <SuccessCard>
          <IconWrapper>
            <FaCheckCircle />
          </IconWrapper>

          <Title>Đặt hàng thành công!</Title>
          <Subtitle>Cảm ơn bạn đã mua hàng tại cửa hàng chúng tôi</Subtitle>

          {orderId && (
            <OrderInfo>
              <InfoLabel>Mã đơn hàng:</InfoLabel>
              <OrderId>{orderId}</OrderId>
            </OrderInfo>
          )}

          {orderDetails && (
            <DetailsCard>
              <DetailRow>
                <DetailLabel>Người nhận:</DetailLabel>
                <DetailValue>{orderDetails.shippingInfo?.fullName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Số điện thoại:</DetailLabel>
                <DetailValue>{orderDetails.shippingInfo?.phone}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Địa chỉ:</DetailLabel>
                <DetailValue>
                  {orderDetails.shippingInfo?.address}, {orderDetails.shippingInfo?.ward}, {orderDetails.shippingInfo?.district}, {orderDetails.shippingInfo?.city}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Tổng tiền:</DetailLabel>
                <DetailValue $highlight>
                  {orderDetails.total?.toLocaleString('vi-VN')}đ
                </DetailValue>
              </DetailRow>
            </DetailsCard>
          )}

          <Message>
            Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.
            <br />
            Đơn hàng sẽ được xử lý và giao đến bạn trong thời gian sớm nhất.
          </Message>

          <ButtonGroup>
            <Link href="/profile" passHref legacyBehavior>
              <OrderButton>
                <FaBox /> Xem đơn hàng
              </OrderButton>
            </Link>
            <Link href="/" passHref legacyBehavior>
              <HomeButton>
                <FaHome /> Về trang chủ
              </HomeButton>
            </Link>
          </ButtonGroup>
        </SuccessCard>
      </Container>
    </Layout>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1rem;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
`;

const IconWrapper = styled.div`
  font-size: 5rem;
  color: #10b981;
  margin-bottom: 1.5rem;
  animation: scaleIn 0.5s ease-out;

  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
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

const OrderInfo = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const OrderId = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  font-family: monospace;
`;

const DetailsCard = styled.div`
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  text-align: left;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;

  &:last-child {
    margin-bottom: 0;
    padding-top: 1rem;
    border-top: 2px solid #e5e7eb;
  }
`;

const DetailLabel = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const DetailValue = styled.span<{ $highlight?: boolean }>`
  color: ${props => props.$highlight ? '#3b82f6' : '#1f2937'};
  font-weight: ${props => props.$highlight ? '700' : '500'};
  font-size: ${props => props.$highlight ? '1.125rem' : '0.875rem'};
  text-align: right;
`;

const Message = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;

  &:hover {
    background: #2563eb;
  }
`;

const HomeButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

export default CheckoutSuccessPage;
