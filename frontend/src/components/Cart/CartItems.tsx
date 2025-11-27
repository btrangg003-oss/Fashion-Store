import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'

interface CartItem {
  id: number
  name: string
  brand: string
  price: string
  originalPrice: string
  image: string
  size: string
  color: string
  quantity: number
}

const Section = styled.section`
  padding: 120px 0 60px;
  background: #f8f9fa;
  min-height: 70vh;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const Header = styled.div`
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

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: #000;
  }
`

const CartContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`

const ItemsList = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`

const CartItem = styled(motion.div)`
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 20px;
  padding: 24px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 80px 1fr;
    gap: 16px;
  }
`

const ItemImage = styled.div`
  position: relative;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 80px;
  }
`

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const ItemName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`

const ItemBrand = styled.span`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
`

const ItemDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  
  span {
    font-size: 0.9rem;
    color: #666;
  }
`

const ItemPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  .current {
    font-size: 1.2rem;
    font-weight: 700;
    color: #e74c3c;
  }
  
  .original {
    font-size: 1rem;
    color: #999;
    text-decoration: line-through;
  }
`

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    grid-column: 1 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
  }
`

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    margin-bottom: 0;
  }
`

const QuantityButton = styled.button`
  padding: 8px 12px;
  background: #f8f9fa;
  border: none;
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const QuantityDisplay = styled.span`
  padding: 8px 16px;
  background: white;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
`

const RemoveButton = styled(motion.button)`
  padding: 8px;
  color: #e74c3c;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fee;
    transform: scale(1.1);
  }
`

const EmptyCart = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  
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
    margin-bottom: 30px;
    line-height: 1.6;
  }
`

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
`

const CartItems = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
      if (raw) {
        const parsed = JSON.parse(raw)
        setCartItems(parsed.map((i: any, idx: number) => ({
          id: idx + 1,
          name: i.name,
          brand: i.brand || 'Fashion Store',
          price: new Intl.NumberFormat('vi-VN').format(i.price) + 'đ',
          originalPrice: i.displayOriginalPrice || '',
          image: i.image,
          size: i.size,
          color: i.color,
          quantity: i.quantity || 1
        })))
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e)
    }
  }, [])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(items => {
      const updated = items.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
      try {
        const toStore = updated.map(i => ({
          name: i.name,
          brand: i.brand,
          price: parseInt((i.price || '0').toString().replace(/[^0-9]/g, '')),
          image: i.image,
          size: i.size,
          color: i.color,
          quantity: i.quantity
        }))
        localStorage.setItem('cart', JSON.stringify(toStore))
      } catch {}
      return updated
    })
  }

  const removeItem = (id: number) => {
    setCartItems(items => {
      const updated = items.filter(item => item.id !== id)
      try {
        const toStore = updated.map(i => ({
          name: i.name,
          brand: i.brand,
          price: parseInt((i.price || '0').toString().replace(/[^0-9]/g, '')),
          image: i.image,
          size: i.size,
          color: i.color,
          quantity: i.quantity
        }))
        localStorage.setItem('cart', JSON.stringify(toStore))
      } catch {}
      return updated
    })
  }

  if (cartItems.length === 0) {
    return (
      <Section>
        <Container>
          <Header>
            <Title>Giỏ hàng</Title>
            <BackButton href="/products">
              <FiArrowLeft />
              Tiếp tục mua sắm
            </BackButton>
          </Header>
          
          <EmptyCart>
            <div className="icon">
              <FiShoppingBag />
            </div>
            <h3>Giỏ hàng trống</h3>
            <p>
              Bạn chưa có sản phẩm nào trong giỏ hàng. 
              Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!
            </p>
            <ShopButton href="/products">
              <FiShoppingBag />
              Bắt đầu mua sắm
            </ShopButton>
          </EmptyCart>
        </Container>
      </Section>
    )
  }

  return (
    <Section>
      <Container>
        <Header>
          <Title>Giỏ hàng ({cartItems.length} sản phẩm)</Title>
          <BackButton href="/products">
            <FiArrowLeft />
            Tiếp tục mua sắm
          </BackButton>
        </Header>

        <CartContainer>
          <ItemsList>
            <AnimatePresence>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ItemImage>
                    <Image
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e: any) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }}
                    />
                  </ItemImage>

                  <ItemInfo>
                    <div>
                      <ItemName>{item.name}</ItemName>
                      <ItemBrand>{item.brand}</ItemBrand>
                      <ItemDetails>
                        <span>Size: {item.size}</span>
                        <span>Màu: {item.color}</span>
                      </ItemDetails>
                    </div>
                    <ItemPrice>
                      <span className="current">{item.price}</span>
                      <span className="original">{item.originalPrice}</span>
                    </ItemPrice>
                  </ItemInfo>

                  <ItemActions>
                    <QuantityControls>
                      <QuantityButton
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </QuantityButton>
                      <QuantityDisplay>{item.quantity}</QuantityDisplay>
                      <QuantityButton
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FiPlus />
                      </QuantityButton>
                    </QuantityControls>

                    <RemoveButton
                      onClick={() => removeItem(item.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiTrash2 />
                    </RemoveButton>
                  </ItemActions>
                </CartItem>
              ))}
            </AnimatePresence>
          </ItemsList>
        </CartContainer>
      </Container>
    </Section>
  )
}

export default CartItems