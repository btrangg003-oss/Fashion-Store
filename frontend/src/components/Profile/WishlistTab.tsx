import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi'
import { WishlistItem } from '@/models/orders'

const Container = styled.div`
  max-width: 1200px;
`

const Header = styled.div`
  margin-bottom: 24px;
`

const Title = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
`

const Count = styled.span`
  font-size: 1rem;
  color: #666;
  font-weight: normal;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
`

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`

const ImageContainer = styled.div`
  position: relative;
  padding-top: 133%;
  overflow: hidden;
  background: #f5f5f5;
`

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const RemoveButton = styled(motion.button)`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  color: #ef4444;
  font-size: 1.2rem;
  
  &:hover {
    background: #fee;
  }
`

const Info = styled.div`
  padding: 12px;
`

const ProductName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PriceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`

const Price = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #667eea;
`

const OriginalPrice = styled.div`
  font-size: 0.85rem;
  color: #999;
  text-decoration: line-through;
`

const StockStatus = styled.div<{ inStock: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.inStock ? '#10b981' : '#ef4444'};
  margin-bottom: 12px;
`

const AddToCartButton = styled(motion.button)`
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
`

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
  color: #ddd;
`

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2rem;
`

const EmptyText = styled.p`
  margin: 0 0 24px 0;
  color: #666;
  font-size: 0.95rem;
`

const ShopButton = styled(motion.button)`
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
`

const WishlistTab: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setWishlist(data.wishlist)
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    try {
      const response = await fetch(`/api/wishlist/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setWishlist(prev => prev.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Remove wishlist error:', error)
    }
  }

  const handleAddToCart = (item: WishlistItem) => {
    // Add to cart logic (localStorage or API)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    cart.push({
      id: item.productId,
      name: item.productName,
      image: item.productImage,
      price: item.price,
      quantity: 1
    })
    localStorage.setItem('cart', JSON.stringify(cart))

    // Optionally remove from wishlist after adding to cart
    handleRemove(item.id)

    alert('Đã thêm vào giỏ hàng!')
  }

  if (loading) {
    return <Container>Đang tải...</Container>
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiHeart style={{ color: '#ef4444' }} />
          Yêu Thích
          <Count>({wishlist.length} sản phẩm)</Count>
        </Title>
      </Header>

      {wishlist.length === 0 ? (
        <EmptyState>
          <EmptyIcon><FiHeart /></EmptyIcon>
          <EmptyTitle>Chưa có sản phẩm yêu thích</EmptyTitle>
          <EmptyText>
            Thêm sản phẩm vào danh sách yêu thích để mua sau
          </EmptyText>
          <ShopButton
            onClick={() => window.location.href = '/products'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Khám phá sản phẩm
          </ShopButton>
        </EmptyState>
      ) : (
        <Grid>
          {wishlist.map((item, index) => (
            <ProductCard
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ImageContainer>
                <ProductImage
                  src={item.productImage}
                  alt={item.productName}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300'
                  }}
                />
                <RemoveButton
                  onClick={() => handleRemove(item.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiTrash2 />
                </RemoveButton>
              </ImageContainer>

              <Info>
                <ProductName>{item.productName}</ProductName>

                <PriceRow>
                  <Price>{item.price.toLocaleString('vi-VN')}₫</Price>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <OriginalPrice>
                      {item.originalPrice.toLocaleString('vi-VN')}₫
                    </OriginalPrice>
                  )}
                </PriceRow>

                <StockStatus inStock={item.inStock}>
                  {item.inStock ? '✓ Còn hàng' : '✗ Hết hàng'}
                </StockStatus>

                <AddToCartButton
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.inStock}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiShoppingCart />
                  Thêm vào giỏ
                </AddToCartButton>
              </Info>
            </ProductCard>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default WishlistTab
