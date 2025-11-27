import React from 'react';
import styled from 'styled-components';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    badge: 'MỚI 100%',
    title: 'KHÁM PHÁ NGAY',
    subtitle: 'BST CARO',
    buttonText: 'MUA NGAY'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    badge: 'SALE',
    title: 'THÁNG 10',
    subtitle: '50% OFF',
    buttonText: 'MUA NGAY'
  }
];

const DoubleBanner = () => {
  return (
    <Container>
      <BannersGrid>
        {banners.map((banner) => (
          <BannerCard key={banner.id}>
            <BannerImage src={banner.image} alt={banner.title} />
            <BannerOverlay>
              <Badge>{banner.badge}</Badge>
              <BannerTitle>{banner.title}</BannerTitle>
              <BannerSubtitle>{banner.subtitle}</BannerSubtitle>
              <ShopButton>{banner.buttonText}</ShopButton>
            </BannerOverlay>
          </BannerCard>
        ))}
      </BannersGrid>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
`;

const BannersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BannerCard = styled.div`
  position: relative;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,107,53,0.8) 0%, rgba(255,140,66,0.6) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const Badge = styled.div`
  padding: 6px 20px;
  background: white;
  color: #ff6b35;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 20px;
`;

const BannerTitle = styled.h3`
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
  text-align: center;
  letter-spacing: 2px;
`;

const BannerSubtitle = styled.div`
  color: white;
  font-size: 56px;
  font-weight: 900;
  margin-bottom: 25px;
  text-align: center;
  line-height: 1;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
`;

const ShopButton = styled.button`
  padding: 12px 40px;
  background: white;
  color: #ff6b35;
  border: none;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
`;

export default DoubleBanner;
