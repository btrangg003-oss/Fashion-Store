import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'

interface RelatedProductsProps {
  currentProductId: number
}

const Section = styled.section`
  padding: 80px 0;
  background: #f8f9fa;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
`

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
`

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
`

const ProductImageContainer = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  
  img {
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.1);
  }
`

const ProductActions = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  opacity: 0;
  transform: translateX(20px);
  transition: all 0.3s ease;
  
  ${ProductCard}:hover & {
    opacity: 1;
    transform: translateX(0);
  }
`

const ActionButton = styled(motion.button)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    background: #000;
    color: white;
    transform: scale(1.1);
  }
`

const ProductBadge = styled.div`
  position: absolute;
  top: 15px;
  left: 15px;
  background: #e74c3c;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 2;
`

const ProductInfo = styled.div`
  padding: 24px;
`

const ProductBrand = styled.span`
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 8px 0 12px;
  color: #000;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`

const CurrentPrice = styled.span`
  font-size: 1.3rem;
  font-weight: 700;
  color: #e74c3c;
`

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`

const AddToCartButton = styled(motion.button)`
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #000 0%, #333 100%);
  color: white;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #333 0%, #555 100%);
    transform: translateY(-2px);
  }
`

const relatedProducts = [
  {
    id: 3,
    name: 'Blazer nam thời trang',
    brand: 'Luxury Collection',
    currentPrice: '1.599.000đ',
    originalPrice: '2.100.000đ',
    discount: '-24%',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    name: 'Túi xách da thật',
    brand: 'Fashion Store',
    currentPrice: '1.299.000đ',
    originalPrice: '1.800.000đ',
    discount: '-28%',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    name: 'Quần jeans slim fit',
    brand: 'Premium Line',
    currentPrice: '799.000đ',
    originalPrice: '1.100.000đ',
    discount: '-27%',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 6,
    name: 'Áo khoác dạ nữ',
    brand: 'Luxury Collection',
    currentPrice: '1.899.000đ',
    originalPrice: '2.500.000đ',
    discount: '-24%',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }
]

const RelatedProducts = ({ currentProductId }: RelatedProductsProps) => {
  const filteredProducts = relatedProducts.filter(product => product.id !== currentProductId)

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionTitle>Sản phẩm liên quan</SectionTitle>
          <SectionSubtitle>
            Khám phá thêm những sản phẩm tương tự có thể bạn sẽ thích
          </SectionSubtitle>
        </SectionHeader>
        
        <ProductGrid>
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
            >
              <Link href={`/products/${product.id}`}>
                <ProductImageContainer>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <ProductBadge>{product.discount}</ProductBadge>
                </ProductImageContainer>
              </Link>
              
              <ProductActions>
                <ActionButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiHeart />
                </ActionButton>
                <ActionButton
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiShoppingCart />
                </ActionButton>
              </ProductActions>
              
              <ProductInfo>
                <ProductBrand>{product.brand}</ProductBrand>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>
                  <CurrentPrice>{product.currentPrice}</CurrentPrice>
                  <OriginalPrice>{product.originalPrice}</OriginalPrice>
                </ProductPrice>
                <AddToCartButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiShoppingCart />
                  Thêm vào giỏ
                </AddToCartButton>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
      </Container>
    </Section>
  )
}

export default RelatedProducts