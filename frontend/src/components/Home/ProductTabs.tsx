import React, { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import ProductCard from '../Product/ProductCard';

const tabs = ['Hàng Mới Về', 'Sản Phẩm Bán Chạy', 'Sản Phẩm Nổi Bật'];

const mockProducts = [
  {
    id: '1',
    name: 'Áo khoác blazer nữ',
    price: 708000,
    comparePrice: 885000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    rating: 5,
    reviews: 234,
    badge: 'HOT',
    slug: 'ao-blazer-nu'
  },
  {
    id: '2',
    name: 'Áo thun trắng basic',
    price: 168000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    rating: 5,
    reviews: 456,
    slug: 'ao-thun-trang'
  },
  {
    id: '3',
    name: 'Áo khoác Cardigan',
    price: 850000,
    comparePrice: 1200000,
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80',
    rating: 5,
    reviews: 189,
    slug: 'ao-cardigan'
  },
  {
    id: '4',
    name: 'Áo khoác Trench Coat',
    price: 768000,
    comparePrice: 960000,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',
    rating: 4,
    reviews: 123,
    slug: 'trench-coat'
  },
  {
    id: '5',
    name: 'Áo kiểu trễ vai nữ',
    price: 168000,
    comparePrice: 210000,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80',
    rating: 5,
    reviews: 345,
    badge: 'HOT',
    slug: 'ao-tre-vai'
  },
  {
    id: '6',
    name: 'Váy đầm công sở',
    price: 450000,
    comparePrice: 650000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    rating: 5,
    reviews: 278,
    slug: 'vay-dam-cong-so'
  },
  {
    id: '7',
    name: 'Quần jean nữ',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
    rating: 4,
    reviews: 156,
    slug: 'quan-jean-nu'
  },
  {
    id: '8',
    name: 'Áo sơ mi trắng',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    rating: 5,
    reviews: 412,
    badge: 'NEW',
    slug: 'ao-so-mi-trang'
  },
  {
    id: '9',
    name: 'Chân váy xòe',
    price: 320000,
    comparePrice: 450000,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80',
    rating: 5,
    reviews: 189,
    slug: 'chan-vay-xoe'
  },
  {
    id: '10',
    name: 'Áo len cổ lọ',
    price: 420000,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80',
    rating: 4,
    reviews: 234,
    slug: 'ao-len-co-lo'
  }
];

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container>
      <Header>
        <SectionTitle>Tất Cả Sản Phẩm</SectionTitle>
        <TabsWrapper>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              $active={activeTab === index}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </Tab>
          ))}
        </TabsWrapper>
      </Header>
      
      <ProductsGrid>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductsGrid>
      
      <ViewAllButton>
        <Link href="/products">Xem Tất Cả</Link>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #333;
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: 40px;
  border-bottom: 2px solid #e5e7eb;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 0;
  background: transparent;
  color: ${props => props.$active ? '#ff6b35' : '#666'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#ff6b35' : 'transparent'};
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: -2px;
  
  &:hover {
    color: #ff6b35;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 30px;
  
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
    background: white;
    color: #ff6b35;
    border: 2px solid #ff6b35;
    border-radius: 25px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      background: #ff6b35;
      color: white;
    }
  }
`;

export default ProductTabs;
