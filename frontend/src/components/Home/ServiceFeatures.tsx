import React from 'react';
import styled from 'styled-components';
import { FiTruck, FiPackage, FiCreditCard, FiPhone } from 'react-icons/fi';

const features = [
  {
    icon: <FiTruck />,
    title: 'Miễn phí vận chuyển',
    subtitle: 'Đơn từ 399K'
  },
  {
    icon: <FiPackage />,
    title: 'Đổi hàng tận nhà',
    subtitle: 'Trong vòng 15 ngày'
  },
  {
    icon: <FiCreditCard />,
    title: 'Thanh toán COD',
    subtitle: 'Yên tâm mua sắm'
  },
  {
    icon: <FiPhone />,
    title: 'Hotline: 1800 6750',
    subtitle: 'Hỗ trợ bạn từ 8h00-22h00'
  }
];

const ServiceFeatures = () => {
  return (
    <Container>
      <FeaturesGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <IconWrapper>{feature.icon}</IconWrapper>
            <TextContent>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureSubtitle>{feature.subtitle}</FeatureSubtitle>
            </TextContent>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 50%;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const FeatureSubtitle = styled.div`
  font-size: 13px;
  color: #666;
`;

export default ServiceFeatures;
