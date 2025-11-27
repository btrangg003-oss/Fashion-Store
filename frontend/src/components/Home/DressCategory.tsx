import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import ProductCard from '../Product/ProductCard';

const dressTabs = ['Váy đầm công sở', 'Váy đầm dự tiệc', 'Váy đầm maxi dạo phố'];

const mockProducts = [
  {
    id: '1',
    name: 'Váy đầm công sở thanh lịch',
    price: 450000,
    comparePrice: 650000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    rating: 5,
    reviews: 234,
    badge: 'HOT',
    slug: 'vay-dam-cong-so-1'
  },
  {
    id: '2',
    name: 'Váy đầm xòe dự tiệc',
    price: 680000,
    comparePrice: 890000,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80',
    rating: 5,
    reviews: 189,
    slug: 'vay-dam-du-tiec-1'
  },
  {
    id: '3',
    name: 'Váy maxi dạo phố',
    price: 520000,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    rating: 4,
    reviews: 156,
    slug: 'vay-maxi-1'
  },
  {
    id: '4',
    name: 'Váy đầm ôm body',
    price: 380000,
    comparePrice: 550000,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80',
    rating: 5,
    reviews: 278,
    badge: 'NEW',
    slug: 'vay-dam-om-1'
  },
  {
    id: '5',
    name: 'Váy đầm hoa nhí',
    price: 420000,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    rating: 5,
    reviews: 312,
    slug: 'vay-dam-hoa-1'
  },
  {
    id: '6',
    name: 'Váy đầm suông công sở',
    price: 390000,
    comparePrice: 520000,
    image: 'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=600&q=80',
    rating: 4,
    reviews: 145,
    slug: 'vay-dam-suong-1'
  },
  {
    id: '7',
    name: 'Váy đầm dự tiệc sang trọng',
    price: 890000,
    comparePrice: 1200000,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80',
    rating: 5,
    reviews: 198,
    badge: 'HOT',
    slug: 'vay-dam-du-tiec-2'
  },
  {
    id: '8',
    name: 'Váy maxi bohemian',
    price: 580000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    rating: 5,
    reviews: 223,
    slug: 'vay-maxi-2'
  },
  {
    id: '9',
    name: 'Váy đầm xếp ly',
    price: 460000,
    comparePrice: 620000,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80',
    rating: 4,
    reviews: 167,
    slug: 'vay-dam-xep-ly'
  },
  {
    id: '10',
    name: 'Váy đầm vintage',
    price: 550000,
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80',
    rating: 5,
    reviews: 289,
    slug: 'vay-dam-vintage'
  }
];

const DressCategory = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container>
      <SectionTitle>Váy Đầm</SectionTitle>
      
      <TabsWrapper>
        {dressTabs.map((tab, index) => (
          <Tab
            key={index}
            $active={activeTab === index}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </Tab>
        ))}
      </TabsWrapper>
      
      <ProductsGrid>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductsGrid>
      
      <ViewAllButton>
        <Link href="/products?category=vay-dam">Xem Tất Cả</Link>
      </ViewAllButton>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
  background: #f9f9f9;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
`;

const TabsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 30px;
  background: ${props => props.$active ? '#ff6b35' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border: 2px solid ${props => props.$active ? '#ff6b35' : '#e0e0e0'};
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #ff6b35;
    color: ${props => props.$active ? 'white' : '#ff6b35'};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
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

export default DressCategory;
