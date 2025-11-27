import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiShoppingBag, FiTruck, FiShield, FiClock } from 'react-icons/fi'

const SummaryContainer = styled.div`
  position: sticky;
  top: 120px;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
`

const SummaryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #667eea;
  }
`

const OrderItems = styled.div`
  margin-bottom: 24px;
  max-height: 300px;
  overflow-y: auto;
`

const OrderItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`

const ItemImage = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
`

const ItemInfo = styled.div`
  flex: 1;
  
  .item-name {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 4px;
    color: #000;
    line-height: 1.3;
  }
  
  .item-details {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 4px;
  }
  
  .item-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .quantity {
      font-size: 0.8rem;
      color: #666;
    }
    
    .price {
      font-weight: 600;
      color: #e74c3c;
    }
  }
`

const SummaryRow = styled.div<{ $isTotal?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: ${props => props.$isTotal ? '2px solid #000' : '1px solid #eee'};
  
  &:last-child {
    border-bottom: none;
    margin-top: 8px;
  }
  
  .label {
    font-weight: ${props => props.$isTotal ? '700' : '500'};
    font-size: ${props => props.$isTotal ? '1.2rem' : '1rem'};
    color: ${props => props.$isTotal ? '#000' : '#666'};
  }
  
  .value {
    font-weight: ${props => props.$isTotal ? '700' : '600'};
    font-size: ${props => props.$isTotal ? '1.3rem' : '1rem'};
    color: ${props => props.$isTotal ? '#e74c3c' : '#000'};
  }
  
  .discount {
    color: #28a745;
  }
`

const PlaceOrderButton = styled(motion.button)<{ $isLoading: boolean }>`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  font-size: 1.1rem;
  margin-top: 24px;
  transition: all 0.3s ease;
  opacity: ${props => props.$isLoading ? 0.7 : 1};
  cursor: ${props => props.$isLoading ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
`

const Benefits = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
`

const Benefit = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  svg {
    color: #28a745;
    font-size: 1.1rem;
  }
  
  span {
    font-size: 0.9rem;
    color: #666;
  }
`

const CheckoutSummary = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [orderItems, setOrderItems] = useState<any[]>([])

  useEffect(() => {
    try {
      const buyNowRaw = typeof window !== 'undefined' ? localStorage.getItem('buyNow') : null
      const cartRaw = typeof window !== 'undefined' ? localStorage.getItem('cart') : null
      if (buyNowRaw) {
        setOrderItems(JSON.parse(buyNowRaw))
      } else if (cartRaw) {
        setOrderItems(JSON.parse(cartRaw))
      } else {
        setOrderItems([])
      }
    } catch (e) {
      console.error('Failed to load checkout items', e)
      setOrderItems([])
    }
  }, [])

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discount = 429700 // 10% discount
  const shipping = subtotal >= 500000 ? 0 : 30000
  const total = subtotal - discount + shipping

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to success page
      router.push('/checkout/success')
    } catch (error) {
      console.error('Order placement error:', error)
      router.push('/checkout/failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SummaryContainer>
      <SummaryTitle>
        <FiShoppingBag />
        Đơn hàng của bạn
      </SummaryTitle>
      
      <OrderItems>
        {orderItems.map((item) => (
          <OrderItem key={item.id}>
            <ItemImage>
              <Image
                src={item.image}
                alt={item.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </ItemImage>
            
            <ItemInfo>
              <div className="item-name">{item.name}</div>
              <div className="item-details">
                Size: {item.size} • Màu: {item.color}
              </div>
              <div className="item-price">
                <span className="quantity">SL: {item.quantity}</span>
                <span className="price">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </ItemInfo>
          </OrderItem>
        ))}
      </OrderItems>
      
      <SummaryRow>
        <span className="label">Tạm tính ({orderItems.length} sản phẩm)</span>
        <span className="value">{formatPrice(subtotal)}</span>
      </SummaryRow>
      
      <SummaryRow>
        <span className="label">Giảm giá</span>
        <span className="value discount">-{formatPrice(discount)}</span>
      </SummaryRow>
      
      <SummaryRow>
        <span className="label">Phí vận chuyển</span>
        <span className="value">
          {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
        </span>
      </SummaryRow>
      
      <SummaryRow $isTotal>
        <span className="label">Tổng cộng</span>
        <span className="value">{formatPrice(total)}</span>
      </SummaryRow>

      <PlaceOrderButton
        $isLoading={isLoading}
        disabled={isLoading}
        onClick={handlePlaceOrder}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ 
                width: '20px', 
                height: '20px', 
                border: '2px solid #fff', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%',
                display: 'inline-block',
                marginRight: '8px'
              }}
            />
            Đang xử lý...
          </>
        ) : (
          `Đặt hàng • ${formatPrice(total)}`
        )}
      </PlaceOrderButton>

      <Benefits>
        <Benefit>
          <FiTruck />
          <span>Miễn phí vận chuyển cho đơn hàng từ 500K</span>
        </Benefit>
        <Benefit>
          <FiShield />
          <span>Bảo hành chất lượng - Đổi trả trong 30 ngày</span>
        </Benefit>
        <Benefit>
          <FiClock />
          <span>Giao hàng nhanh trong 1-3 ngày làm việc</span>
        </Benefit>
      </Benefits>
    </SummaryContainer>
  )
}

export default CheckoutSummary