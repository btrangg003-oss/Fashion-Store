import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { FiStar, FiHeart, FiShoppingCart } from 'react-icons/fi';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    image: string;
    rating?: number;
    reviews?: number;
    badge?: string;
    slug: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Card>
      <Link href={`/products/${product.slug}`}>
        <ImageWrapper>
          <ProductImage src={product.image} alt={product.name} />
          {product.badge && <Badge type={product.badge}>{product.badge}</Badge>}
          {discount > 0 && <DiscountBadge>-{discount}%</DiscountBadge>}
          <QuickActions>
            <ActionButton><FiHeart /></ActionButton>
            <ActionButton><FiShoppingCart /></ActionButton>
          </QuickActions>
        </ImageWrapper>
      </Link>
      
      <ProductInfo>
        <ProductName>{product.name}</ProductName>
        
        {product.rating && (
          <Rating>
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                fill={i < product.rating! ? '#ffc107' : 'none'}
                color={i < product.rating! ? '#ffc107' : '#ddd'}
                size={14}
              />
            ))}
            {product.reviews && <ReviewCount>({product.reviews})</ReviewCount>}
          </Rating>
        )}
        
        <PriceWrapper>
          <Price>{product.price.toLocaleString()}₫</Price>
          {product.comparePrice && (
            <ComparePrice>{product.comparePrice.toLocaleString()}₫</ComparePrice>
          )}
        </PriceWrapper>
      </ProductInfo>
    </Card>
  );
};

const Card = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
  
  &:hover button {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  overflow: hidden;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const Badge = styled.div<{ type: string }>`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  background: ${props => {
    switch(props.type) {
      case 'NEW': return '#10b981';
      case 'HOT': return '#ef4444';
      case 'SALE': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 10px;
  background: #dc2626;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
`;

const QuickActions = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  
  &:hover {
    background: #ff6b35;
    color: white;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProductInfo = styled.div`
  padding: 15px;
`;

const ProductName = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  min-height: 40px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

const ReviewCount = styled.span`
  font-size: 12px;
  color: #999;
  margin-left: 4px;
`;

const PriceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Price = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ff6b35;
`;

const ComparePrice = styled.div`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
`;

export default ProductCard;
