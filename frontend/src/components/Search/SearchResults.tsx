import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiSearch } from 'react-icons/fi'

interface SearchResultsProps {
  searchQuery: string
}

interface Product {
  id: number
  name: string
  brand: string
  currentPrice: string
  originalPrice: string
  discount: string
  image: string
  rating: number
  reviews: number
}

const Section = styled.section`
  padding: 60px 0;
  background: white;
  min-height: 60vh;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`

const ResultsCount = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #000;
`

const SortSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    border-color: #667eea;
    outline: none;
  }
`

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

const NoResults = styled.div`
  text-align: center;
  padding: 80px 20px;
  
  .icon {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 24px;
  }
  
  h3 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #333;
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;
  }
`

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
`

const LoadingCard = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  overflow: hidden;
  
  .image-placeholder {
    height: 300px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }
  
  .content-placeholder {
    padding: 24px;
    
    .line {
      height: 16px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 12px;
      
      &.short {
        width: 60%;
      }
      
      &.medium {
        width: 80%;
      }
    }
  }
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`

const SearchResults = ({ searchQuery }: SearchResultsProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery) {
        setProducts([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        
        if (data.success) {
          setProducts(data.data)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchQuery])

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseInt(a.currentPrice.replace(/[^\d]/g, '')) - parseInt(b.currentPrice.replace(/[^\d]/g, ''))
      case 'price-high':
        return parseInt(b.currentPrice.replace(/[^\d]/g, '')) - parseInt(a.currentPrice.replace(/[^\d]/g, ''))
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  if (!searchQuery) {
    return (
      <Section>
        <Container>
          <NoResults>
            <div className="icon">
              <FiSearch />
            </div>
            <h3>Bắt đầu tìm kiếm</h3>
            <p>Nhập từ khóa vào ô tìm kiếm để khám phá các sản phẩm thời trang tuyệt vời của chúng tôi.</p>
          </NoResults>
        </Container>
      </Section>
    )
  }

  return (
    <Section>
      <Container>
        <ResultsHeader>
          <ResultsCount>
            {loading ? 'Đang tìm kiếm...' : `Tìm thấy ${products.length} sản phẩm`}
          </ResultsCount>
          {!loading && products.length > 0 && (
            <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="relevance">Liên quan nhất</option>
              <option value="price-low">Giá thấp đến cao</option>
              <option value="price-high">Giá cao đến thấp</option>
              <option value="name">Tên A-Z</option>
            </SortSelect>
          )}
        </ResultsHeader>

        {loading ? (
          <LoadingGrid>
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingCard key={index}>
                <div className="image-placeholder" />
                <div className="content-placeholder">
                  <div className="line short" />
                  <div className="line medium" />
                  <div className="line" />
                </div>
              </LoadingCard>
            ))}
          </LoadingGrid>
        ) : products.length > 0 ? (
          <ProductGrid>
            {sortedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
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
        ) : (
          <NoResults>
            <div className="icon">
              <FiSearch />
            </div>
            <h3>Không tìm thấy kết quả</h3>
            <p>
              Không tìm thấy sản phẩm nào phù hợp với từ khóa &quot;{searchQuery}&quot;. 
              Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
            </p>
          </NoResults>
        )}
      </Container>
    </Section>
  )
}

export default SearchResults