import { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiTruck, FiShield, FiCreditCard, FiGift } from 'react-icons/fi'
import Link from 'next/link'

const Section = styled.section`
  padding: 0 0 80px;
  background: #f8f9fa;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`

const PromoSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`

const PromoTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000;
`

const PromoForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const PromoInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #667eea;
    outline: none;
  }
`

const PromoButton = styled.button`
  padding: 12px 24px;
  background: #667eea;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5a6fd8;
  }
`

const Benefits = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`

const Benefit = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  
  svg {
    color: #28a745;
    font-size: 1.2rem;
  }
  
  div {
    h5 {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 0.9rem;
    }
    
    p {
      font-size: 0.8rem;
      color: #666;
      margin: 0;
    }
  }
`

const OrderSummary = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 120px;
`

const SummaryTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #000;
`

const SummaryRow = styled.div<{ isTotal?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: ${props => props.isTotal ? '2px solid #000' : '1px solid #eee'};
  
  &:last-child {
    border-bottom: none;
    margin-top: 8px;
  }
  
  .label {
    font-weight: ${props => props.isTotal ? '700' : '500'};
    font-size: ${props => props.isTotal ? '1.2rem' : '1rem'};
    color: ${props => props.isTotal ? '#000' : '#666'};
  }
  
  .value {
    font-weight: ${props => props.isTotal ? '700' : '600'};
    font-size: ${props => props.isTotal ? '1.3rem' : '1rem'};
    color: ${props => props.isTotal ? '#e74c3c' : '#000'};
  }
  
  .discount {
    color: #28a745;
  }
`

const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  font-size: 1.1rem;
  margin-top: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
`

const PaymentMethods = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  
  h5 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #666;
  }
  
  .methods {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .method {
    padding: 6px 12px;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.8rem;
    color: #666;
  }
`

const CartSummary = () => {
  const [promoCode, setPromoCode] = useState('')
  const [appliedVouchers, setAppliedVouchers] = useState<Array<{
    code: string;
    discount: number;
  }>>([])
  const [loading, setLoading] = useState(false)

  const subtotal = 4297000 // 899k*2 + 2499k
  const totalDiscount = appliedVouchers.reduce((sum, v) => sum + v.discount, 0)
  const shipping = subtotal >= 500000 ? 0 : 30000
  const total = subtotal - totalDiscount + shipping

  // Load vouchers from localStorage on mount
  useState(() => {
    const savedVouchers = localStorage.getItem('cart_vouchers')
    if (savedVouchers) {
      try {
        const vouchers = JSON.parse(savedVouchers)
        setAppliedVouchers(vouchers)
      } catch (error) {
        console.error('Error loading vouchers:', error)
      }
    }
  })

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    // Check duplicate
    if (appliedVouchers.some(v => v.code.toUpperCase() === promoCode.toUpperCase())) {
      alert('Mã giảm giá này đã được áp dụng rồi!')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          orderValue: subtotal
        })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        const newVouchers = [...appliedVouchers, {
          code: data.code,
          discount: data.discountAmount
        }]
        
        setAppliedVouchers(newVouchers)
        localStorage.setItem('cart_vouchers', JSON.stringify(newVouchers))
        setPromoCode('')
      } else {
        alert(data.message || 'Mã giảm giá không hợp lệ')
      }
    } catch (error) {
      console.error('Error validating voucher:', error)
      alert('Có lỗi xảy ra khi kiểm tra mã giảm giá')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveVoucher = (code: string) => {
    const newVouchers = appliedVouchers.filter(v => v.code !== code)
    setAppliedVouchers(newVouchers)
    localStorage.setItem('cart_vouchers', JSON.stringify(newVouchers))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
  }

  return (
    <Section>
      <Container>
        <SummaryContainer>
          <PromoSection>
            <PromoTitle>Mã giảm giá & Ưu đãi</PromoTitle>
            
            <PromoForm onSubmit={handlePromoSubmit}>
              <PromoInput
                type="text"
                placeholder="Nhập mã giảm giá"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={loading}
              />
              <PromoButton type="submit" disabled={loading}>
                {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
              </PromoButton>
            </PromoForm>

            {appliedVouchers.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {appliedVouchers.map((voucher) => (
                  <motion.div
                    key={voucher.code}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: '12px 16px',
                      background: '#d4edda',
                      color: '#155724',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiGift />
                      <span>
                        Mã {voucher.code} - Giảm {formatPrice(voucher.discount)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveVoucher(voucher.code)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#155724',
                        cursor: 'pointer',
                        padding: '4px',
                        fontSize: '1.2rem'
                      }}
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            <div style={{ 
              marginBottom: '24px', 
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <Link 
                href="/profile?tab=vouchers" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FiGift />
                Xem ưu đãi & mã giảm giá
              </Link>
            </div>

            <Benefits>
              <Benefit>
                <FiTruck />
                <div>
                  <h5>Miễn phí vận chuyển</h5>
                  <p>Đơn hàng từ 500K</p>
                </div>
              </Benefit>
              <Benefit>
                <FiShield />
                <div>
                  <h5>Bảo hành chất lượng</h5>
                  <p>Đổi trả trong 30 ngày</p>
                </div>
              </Benefit>
              <Benefit>
                <FiCreditCard />
                <div>
                  <h5>Thanh toán an toàn</h5>
                  <p>Bảo mật SSL 256-bit</p>
                </div>
              </Benefit>
              <Benefit>
                <FiGift />
                <div>
                  <h5>Tích điểm thưởng</h5>
                  <p>Nhận 1% giá trị đơn hàng</p>
                </div>
              </Benefit>
            </Benefits>
          </PromoSection>

          <OrderSummary>
            <SummaryTitle>Tóm tắt đơn hàng</SummaryTitle>
            
            <SummaryRow>
              <span className="label">Tạm tính (3 sản phẩm)</span>
              <span className="value">{formatPrice(subtotal)}</span>
            </SummaryRow>
            
            {totalDiscount > 0 && (
              <SummaryRow>
                <span className="label">Giảm giá ({appliedVouchers.length} mã)</span>
                <span className="value discount">-{formatPrice(totalDiscount)}</span>
              </SummaryRow>
            )}
            
            <SummaryRow>
              <span className="label">Phí vận chuyển</span>
              <span className="value">
                {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
              </span>
            </SummaryRow>
            
            <SummaryRow isTotal>
              <span className="label">Tổng cộng</span>
              <span className="value">{formatPrice(total)}</span>
            </SummaryRow>

            <CheckoutButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/checkout'}
            >
              Tiến hành thanh toán
            </CheckoutButton>

            <PaymentMethods>
              <h5>Phương thức thanh toán</h5>
              <div className="methods">
                <span className="method">Visa</span>
                <span className="method">Mastercard</span>
                <span className="method">Momo</span>
                <span className="method">ZaloPay</span>
                <span className="method">COD</span>
              </div>
            </PaymentMethods>
          </OrderSummary>
        </SummaryContainer>
      </Container>
    </Section>
  )
}

export default CartSummary