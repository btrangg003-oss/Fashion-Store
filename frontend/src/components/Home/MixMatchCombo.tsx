import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { motion } from 'framer-motion';

const combos = [
  {
    id: 1,
    title: 'Combo Công Sở Thanh Lịch',
    description: 'Áo sơ mi + Chân váy + Giày cao gót',
    price: 890000,
    comparePrice: 1200000,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
    items: 3
  },
  {
    id: 2,
    title: 'Combo Dạo Phố Năng Động',
    description: 'Áo thun + Quần jean + Sneakers',
    price: 650000,
    comparePrice: 850000,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
    items: 3
  },
  {
    id: 3,
    title: 'Combo Dự Tiệc Sang Trọng',
    description: 'Váy đầm + Clutch + Giày cao gót',
    price: 1200000,
    comparePrice: 1600000,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80',
    items: 3
  },
  {
    id: 4,
    title: 'Combo Mùa Đông Ấm Áp',
    description: 'Áo len + Quần dài + Boots',
    price: 980000,
    comparePrice: 1350000,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    items: 3
  }
];

const MixMatchCombo = () => {
  return (
    <Container>
      <Header>
        <SectionTitle>Combo Mix & Match</SectionTitle>
        <Description>Tạo nên phong cách riêng cho bạn</Description>
      </Header>
      
      <ComboGrid>
        {combos.map((combo, index) => (
          <ComboCard
            key={combo.id}
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ComboImage src={combo.image} alt={combo.title} />
            <ComboContent>
              <ComboTitle>{combo.title}</ComboTitle>
              <ComboDesc>{combo.description}</ComboDesc>
              <ComboItems>{combo.items} sản phẩm</ComboItems>
              <PriceWrapper>
                <Price>{combo.price.toLocaleString('vi-VN')}đ</Price>
                {combo.comparePrice && (
                  <ComparePrice>{combo.comparePrice.toLocaleString('vi-VN')}đ</ComparePrice>
                )}
              </PriceWrapper>
            </ComboContent>
          </ComboCard>
        ))}
      </ComboGrid>
      
      <ViewAllButton>
        <Link href="/collections/mix-match">Khám Phá Ngay</Link>
      </ViewAllButton>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
`;

const ComboGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ComboCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
  
  &:hover img {
    transform: scale(1.1);
  }
`;

const ComboImage = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: transform 0.5s ease;
`;

const ComboContent = styled.div`
  padding: 20px;
`;

const ComboTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
`;

const ComboDesc = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const ComboItems = styled.div`
  font-size: 13px;
  color: #ff6b35;
  font-weight: 600;
  margin-bottom: 12px;
`;

const PriceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Price = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #ff6b35;
`;

const ComparePrice = styled.div`
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
`;

const ViewAllButton = styled.div`
  text-align: center;
  margin-top: 40px;
  
  a {
    display: inline-block;
    padding: 12px 40px;
    background: #ff6b35;
    color: white;
    border-radius: 25px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      background: #ff5722;
      transform: translateY(-2px);
    }
  }
`;

export default MixMatchCombo;
