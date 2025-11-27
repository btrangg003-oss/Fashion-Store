import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const Section = styled.section`
  padding: 100px 0;
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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  }
`

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
`

const ProductInfo = styled.div`
  padding: 20px;
`

const ProductName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
`

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
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
`

const products = [
  {
    id: 1,
    name: 'Áo sơ mi trắng cao cấp',
    currentPrice: '899.000đ',
    originalPrice: '1.200.000đ',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    name: 'Váy dạ hội sang trọng',
    currentPrice: '2.499.000đ',
    originalPrice: '3.200.000đ',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    name: 'Blazer nam thời trang',
    currentPrice: '1.599.000đ',
    originalPrice: '2.100.000đ',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 4,
    name: 'Túi xách da thật',
    currentPrice: '1.299.000đ',
    originalPrice: '1.800.000đ',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }
]

const FeaturedProducts = () => {
  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionTitle>Sản phẩm nổi bật</SectionTitle>
          <SectionSubtitle>
            Khám phá những sản phẩm được yêu thích nhất với chất lượng cao và thiết kế độc đáo
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
              <Link href={`/products/${product.id}`}>
                <ProductImage>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </ProductImage>
              </Link>
              
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <ProductPrice>
                  <CurrentPrice>{product.currentPrice}</CurrentPrice>
                  <OriginalPrice>{product.originalPrice}</OriginalPrice>
                </ProductPrice>
                <AddToCartButton>
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

export default FeaturedProducts