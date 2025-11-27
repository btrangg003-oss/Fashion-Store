import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Section = styled.section`
  padding: 100px 0;
  background: white;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
`;

const NewBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: #48bb78;
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 1;
`;

const ProductImage = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  
  img {
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  padding: 20px;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`;

const CurrentPrice = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: #e74c3c;
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #000;
  color: white;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #333;
    transform: translateY(-1px);
  }
`;

const NewProducts: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewProducts();
  }, []);

  const loadNewProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=8&sort=newest');
      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error loading new products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleProductClick = (product: any) => {
    router.push(`/products/${product.id}`);
  };

  if (loading) {
    return (
      <Section>
        <SectionHeader>
          <SectionTitle>Đang tải...</SectionTitle>
        </SectionHeader>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionTitle>Sản phẩm mới</SectionTitle>
          <SectionSubtitle>
            Khám phá những sản phẩm mới nhất với thiết kế độc đáo và chất lượng cao
          </SectionSubtitle>
        </SectionHeader>

        <ProductGrid>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <NewBadge>MỚI</NewBadge>
              <Link href={`/products/${product.id}`}>
                <ProductImage>
                  <Image
                    src={product.featuredImage || product.images?.[0] || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    quality={85}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    onError={(e: any) => {
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </ProductImage>
              </Link>
              
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>
                  <CurrentPrice>{formatCurrency(product.price)}</CurrentPrice>
                </ProductPrice>
                <AddToCartButton onClick={() => handleProductClick(product)}>
                  Thêm vào giỏ hàng
                </AddToCartButton>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
      </Container>
    </Section>
  );
};

export default NewProducts;