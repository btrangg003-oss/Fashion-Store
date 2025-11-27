import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'

const Section = styled.section`
  padding: 60px 0;
  background: white;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
`

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
`

const ProductImageContainer = styled.div`
  position: relative;
  height: 350px;
  overflow: hidden;
  
  img {
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
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

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: #000;
    color: white;
    transform: scale(1.1);
  }
`

const ProductInfo = styled.div`
  padding: 20px;
`

const ProductBrand = styled.span`
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const ProductName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 8px 0;
  color: #000;
  line-height: 1.4;
`

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
`

const CurrentPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #e74c3c;
`

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #999;
  text-decoration: line-through;
`

const Discount = styled.span`
  font-size: 0.8rem;
  background: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
`

const AddToCartButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #000;
  color: white;
  font-weight: 600;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: #333;
    transform: translateY(-1px);
  }
`

const products = [
  {
    id: 1,
    name: 'Áo sơ mi trắng cao cấp',
    brand: 'Fashion Store',
    currentPrice: '899.000đ',
    originalPrice: '1.200.000đ',
    discount: '-25%',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    name: 'Váy dạ hội sang trọng',
    brand: 'Premium Line',
    currentPrice: '2.499.000đ',
    originalPrice: '3.200.000đ',
    discount: '-22%',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
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
  },
  {
    id: 7,
    name: 'Giày cao gót thanh lịch',
    brand: 'Fashion Store',
    currentPrice: '1.199.000đ',
    originalPrice: '1.600.000đ',
    discount: '-25%',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 8,
    name: 'Đầm cocktail đen',
    brand: 'Premium Line',
    currentPrice: '1.799.000đ',
    originalPrice: '2.300.000đ',
    discount: '-22%',
    image: 'https://images.unsplash.com/photo-1566479179817-c0b2b2b5b5b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }
]

const ProductGridComponent = () => {
  return (
    <Section>
      <Container>
        <ProductGrid>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/products/${product.id}`}>
                <ProductImageContainer>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </ProductImageContainer>
              </Link>
              
              <ProductActions>
                <ActionButton>
                  <FiHeart />
                </ActionButton>
                <ActionButton>
                  <FiShoppingCart />
                </ActionButton>
              </ProductActions>
              
              <ProductInfo>
                <ProductBrand>{product.brand}</ProductBrand>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>
                  <CurrentPrice>{product.currentPrice}</CurrentPrice>
                  <OriginalPrice>{product.originalPrice}</OriginalPrice>
                  <Discount>{product.discount}</Discount>
                </ProductPrice>
                <AddToCartButton>
                  <FiShoppingCart />
                  Thêm vào giỏ hàng
                </AddToCartButton>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductGrid>
      </Container>
    </Section>
  )
}

export default ProductGridComponent