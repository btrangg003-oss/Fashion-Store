import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import ProductCard from '../Product/ProductCard';

const mockProducts = [
  {
    id: '1',
    name: 'Áo khoác blazer nữ',
    price: 708000,
    comparePrice: 885000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    rating: 5,
    reviews: 1234,
    badge: 'HOT',
    slug: 'ao-blazer-nu'
  },
  {
    id: '2',
    name: 'Váy đầm công sở',
    price: 450000,
    comparePrice: 650000,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
    rating: 5,
    reviews: 987,
    slug: 'vay-dam-cong-so'
  },
  {
    id: '3',
    name: 'Áo sơ mi trắng',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    rating: 5,
    reviews: 856,
    slug: 'ao-so-mi-trang'
  },
  {
    id: '4',
    name: 'Quần jean nữ',
    price: 380000,
    comparePrice: 520000,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
    rating: 4,
    reviews: 745,
    slug: 'quan-jean-nu'
  },
  {
    id: '5',
    name: 'Áo thun basic',
    price: 168000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    rating: 5,
    reviews: 1456,
    badge: 'BEST',
    slug: 'ao-thun-basic'
  }
];

const PopularProducts = () => {
  return (
    <Container>
      <Header>
        <SectionTitle>Sản Phẩm Phổ Biến</SectionTitle>
        <Description>Một trải nghiệm đặc biệt</Description>
      </Header>
      
      <ProductsGrid>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductsGrid>
      
      <ViewAllButton>
        <Link href="/products?sort=popular">Xem Tất Cả</Link>
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

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
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

export default PopularProducts;
