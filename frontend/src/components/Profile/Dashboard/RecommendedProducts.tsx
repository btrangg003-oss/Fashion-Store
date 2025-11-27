import React from 'react';
import styled from 'styled-components';
import { useRecommendations } from '@/hooks/useRecommendations';
import { FiGift, FiShoppingCart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Reason = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ProductCard = styled(motion.div)`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div<{ $image: string }>`
  width: 100%;
  padding-top: 100%;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const ProductInfo = styled.div`
  padding: 12px;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ff6b6b;
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

export const RecommendedProducts: React.FC = () => {
  const { products, reason, isLoading, isError } = useRecommendations();

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Đang tải sản phẩm đề xuất...</LoadingState>
      </Container>
    );
  }

  if (isError || products.length === 0) {
    return (
      <Container>
        <Header>
          <Title>
            <FiGift />
            Sản phẩm đề xuất
          </Title>
        </Header>
        <EmptyState>
          <FiShoppingCart />
          <div>Chưa có sản phẩm đề xuất</div>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiGift />
          Sản phẩm đề xuất
        </Title>
      </Header>
      
      <Reason>{reason}</Reason>

      <ProductsGrid>
        {products.map((product, index) => (
          <Link key={product.id} href={`/products/${product.id}`} passHref legacyBehavior>
            <ProductCard
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductImage $image={product.featuredImage || product.images?.[0] || '/placeholder.jpg'} />
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>
                  {product.price?.toLocaleString('vi-VN')}đ
                </ProductPrice>
              </ProductInfo>
            </ProductCard>
          </Link>
        ))}
      </ProductsGrid>
    </Container>
  );
};
