import React from 'react';
import styled from 'styled-components';
import { SiTiktok } from 'react-icons/si';

const SocialMedia = () => {
  return (
    <Container>
      <ContentWrapper>
        <ImageSection>
          <TikTokImage src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80" alt="TikTok Fashion" />
        </ImageSection>
        
        <TextSection>
          <TikTokHandle>@fashionstoretiktok</TikTokHandle>
          <SectionTitle>Theo dõi chúng tôi trên TikTok</SectionTitle>
          <Description>
            Mang đến cho bạn những cập nhật mới và nhanh nhất về sản phẩm của chúng tôi. 
            Khám phá các video thời trang, tips phối đồ, và những ưu đãi độc quyền chỉ có trên TikTok!
          </Description>
          <FollowButton href="https://tiktok.com/@fashionstore" target="_blank">
            <SiTiktok /> Theo Dõi Ngay
          </FollowButton>
        </TextSection>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  border-radius: 20px;
  padding: 60px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    padding: 40px;
    gap: 40px;
  }
`;

const ImageSection = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
`;

const TikTokImage = styled.img`
  width: 100%;
  height: 500px;
  object-fit: cover;
  
  @media (max-width: 1024px) {
    height: 400px;
  }
`;

const TextSection = styled.div`
  color: white;
`;

const TikTokHandle = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #00f2ea;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin-bottom: 20px;
  line-height: 1.2;
`;

const Description = styled.p`
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  line-height: 1.8;
  margin-bottom: 30px;
`;

const FollowButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 40px;
  background: linear-gradient(135deg, #00f2ea 0%, #ff0050 100%);
  color: white;
  border-radius: 30px;
  font-weight: 700;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 242, 234, 0.4);
  
  svg {
    font-size: 22px;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 30px rgba(0, 242, 234, 0.6);
  }
`;

export default SocialMedia;
