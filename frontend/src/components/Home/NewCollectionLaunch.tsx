import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import ProductCard from '../Product/ProductCard';

const mockProducts = [
  {
    id: '1',
    name: 'Áo len Giáng Sinh',
    price: 420000,
    comparePrice: 580000,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80',
    rating: 5,
    reviews: 156,
    badge: 'NEW',
    slug: 'ao-len-giang-sinh'
  },
  {
    id: '2',
    name: 'Váy đầm Giáng Sinh',
    price: 650000,
    comparePrice: 890000,
    image: 'https://images.unsplash.com/photo-1544441892-794166f1e3be?w=600&q=80',
    rating: 5,
    reviews: 234,
    slug: 'vay-dam-giang-sinh'
  },
  {
    id: '3',
    name: 'Áo khoác Giáng Sinh',
    price: 780000,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    rating: 4,
    reviews: 189,
    slug: 'ao-khoac-giang-sinh'
  },
  {
    id: '4',
    name: 'Set đồ Giáng Sinh',
    price: 890000,
    comparePrice: 1200000,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    rating: 5,
    reviews: 278,
    badge: 'HOT',
    slug: 'set-do-giang-sinh'
  }
];

const NewCollectionLaunch = () => {
  return (
    <Container>
      <ContentWrapper>
        <BannerSection>
          <BannerImage src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80" alt="Bộ Sưu Tập Giáng Sinh" />
          <BannerOverlay>
            <Badge>RA MẮT</Badge>
            <BannerTitle>Bộ Sưu Tập Giáng Sinh</BannerTitle>
          </BannerOverlay>
        </BannerSection>
        
        <TextSection>
          <SectionTitle>Chính Thức Ra Mắt</SectionTitle>
          <SectionSubtitle>Bộ Sưu Tập Trang Phục Giáng Sinh</SectionSubtitle>
          <Description>
            Đón chào mùa lễ hội với bộ sưu tập Giáng Sinh đặc biệt. Những thiết kế ấm áp, 
            tràn đầy sắc màu và niềm vui, mang đến cho bạn phong cách hoàn hảo cho những 
            ngày lễ đáng nhớ bên gia đình và người thân.
          </Description>
          <ShopButton>
            <Link href="/collections/giang-sinh">Khám Phá Ngay</Link>
          </ShopButton>
          
          <ProductsGrid>
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductsGrid>
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
  grid-template-columns: 500px 1fr;
  gap: 40px;
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const BannerSection = styled.div`
  position: relative;
  height: 700px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  
  @media (max-width: 1024px) {
    height: 500px;
  }
`;

const BannerImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BannerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 40px;
`;

const Badge = styled.div`
  display: inline-block;
  padding: 8px 20px;
  background: #ff6b35;
  color: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 15px;
  align-self: flex-start;
  letter-spacing: 1px;
`;

const BannerTitle = styled.h2`
  color: white;
  font-size: 36px;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

const TextSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: #ff6b35;
  font-weight: 600;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SectionSubtitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.2;
`;

const Description = styled.p`
  color: #666;
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 30px;
`;

const ShopButton = styled.div`
  margin-bottom: 40px;
  
  a {
    display: inline-block;
    padding: 14px 40px;
    background: #ff6b35;
    color: white;
    border-radius: 30px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
    
    &:hover {
      background: #ff5722;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
    }
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export default NewCollectionLaunch;
