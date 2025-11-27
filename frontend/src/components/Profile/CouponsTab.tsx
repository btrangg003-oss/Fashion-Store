import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCopy, FiCheck, FiGift, FiLock, FiPercent, FiDollarSign, FiTruck } from 'react-icons/fi'
import { Voucher } from '@/models/voucher'

const Container = styled.div`
  max-width: 900px;
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

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`

const FilterTab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
  }
`

const CouponsList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`

const CouponCard = styled(motion.div)<{ status: string }>`
  background: ${props => {
    if (props.status === 'used') return '#f5f5f5'
    if (props.status === 'expired') return '#fef2f2'
    if (props.status === 'locked') return '#f9f9f9'
    return 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)'
  }};
  border: 2px dashed ${props => {
    if (props.status === 'used') return '#d0d0d0'
    if (props.status === 'expired') return '#fca5a5'
    if (props.status === 'locked') return '#d0d0d0'
    return '#667eea'
  }};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: ${props => props.status === 'expired' ? 0.6 : props.status === 'locked' ? 0.7 : 1};
  position: relative;
  min-height: 200px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`

const CouponIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-bottom: 8px;
`

const CouponInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const CouponCode = styled.div<{ blurred?: boolean }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: #667eea;
  font-family: 'Courier New', monospace;
  filter: ${props => props.blurred ? 'blur(4px)' : 'none'};
  letter-spacing: 1px;
`

const CouponValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
`

const CouponDetails = styled.div`
  font-size: 0.8rem;
  color: #666;
  line-height: 1.5;
`

const CouponActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: auto;
`

const Button = styled(motion.button)<{ primary?: boolean; fullWidth?: boolean }>`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  white-space: nowrap;
  grid-column: ${props => props.fullWidth ? 'span 2' : 'auto'};
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  ` : `
    background: white;
    color: #667eea;
    border: 1px solid #667eea;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 0.9rem;
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
  margin: 0;
  color: #666;
  font-size: 0.95rem;
`

const TabContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
`

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 20px;
  border: none;
  background: none;
  color: ${props => props.active ? '#667eea' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 0.95rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;

  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #667eea;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.3s;
  }

  &:hover {
    color: #667eea;
  }
`

const AvailableCouponCard = styled(motion.div)`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`

const LockedCouponCard = styled(motion.div)`
  background: #f9f9f9;
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
  opacity: 0.7;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`

const RequirementsList = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #fff3cd;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #856404;
`

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`

const StatsInfo = styled.div`
  background: #f0f4ff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #333;

  svg {
    color: #667eea;
  }
`

const EventLabel = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(102, 126, 234, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #667eea;
`

const LockOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  border-radius: 12px;
`

const LockIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`

const LockText = styled.div`
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  padding: 0 20px;
  color: #666;
`

const CouponsTab: React.FC = () => {
  const router = useRouter()
  const [vouchers, setVouchers] = useState<{
    available: any[];
    locked: any[];
    used: any[];
    expired: any[];
  }>({
    available: [],
    locked: [],
    used: [],
    expired: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'available' | 'locked' | 'used' | 'expired'>('available')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      const response = await fetch('/api/vouchers/my-vouchers', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setVouchers(data)
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleUse = (voucher: any) => {
    // Copy code
    handleCopy(voucher.code)
    
    // Save to localStorage for cart
    const cartVouchers = JSON.parse(localStorage.getItem('cart_vouchers') || '[]')
    
    // Check if not already added
    if (!cartVouchers.some((v: any) => v.code === voucher.code)) {
      cartVouchers.push({
        code: voucher.code,
        discount: 0 // Will be calculated in cart
      })
      localStorage.setItem('cart_vouchers', JSON.stringify(cartVouchers))
    }
    
    // Redirect to cart
    router.push('/cart')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <FiPercent />
      case 'fixed':
        return <FiDollarSign />
      case 'freeship':
        return <FiTruck />
      default:
        return <FiGift />
    }
  }

  const formatValue = (voucher: any) => {
    if (voucher.type === 'percentage') {
      const maxText = voucher.maxDiscount 
        ? ` (tối đa ${formatPrice(voucher.maxDiscount)})`
        : ''
      return `Giảm ${voucher.value}%${maxText}`
    }
    if (voucher.type === 'fixed') {
      return `Giảm ${formatPrice(voucher.value)}`
    }
    return 'Miễn phí vận chuyển'
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const currentVouchers = vouchers[activeTab]

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Đang tải...
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiGift style={{ color: '#f59e0b' }} />
          Ưu Đãi & Mã Giảm Giá
        </Title>
      </Header>

      <TabContainer>
        <Tab active={activeTab === 'available'} onClick={() => setActiveTab('available')}>
          Có thể dùng ({vouchers.available.length})
        </Tab>
        <Tab active={activeTab === 'locked'} onClick={() => setActiveTab('locked')}>
          🔒 Chưa mở khóa ({vouchers.locked.length})
        </Tab>
        <Tab active={activeTab === 'used'} onClick={() => setActiveTab('used')}>
          Đã sử dụng ({vouchers.used.length})
        </Tab>
        <Tab active={activeTab === 'expired'} onClick={() => setActiveTab('expired')}>
          Hết hạn ({vouchers.expired.length})
        </Tab>
      </TabContainer>

      {currentVouchers.length === 0 ? (
        <EmptyState>
          <EmptyIcon><FiGift /></EmptyIcon>
          <EmptyTitle>
            {activeTab === 'available' && 'Bạn chưa có mã giảm giá nào'}
            {activeTab === 'locked' && 'Không có voucher bị khóa'}
            {activeTab === 'used' && 'Bạn chưa sử dụng mã giảm giá nào'}
            {activeTab === 'expired' && 'Không có mã giảm giá hết hạn'}
          </EmptyTitle>
          <EmptyText>
            {activeTab === 'available' && 'Các mã giảm giá sẽ tự động hiển thị khi bạn đủ điều kiện'}
          </EmptyText>
        </EmptyState>
      ) : (
        <CouponsList>
          <AnimatePresence mode="wait">
            {currentVouchers.map((voucher: any, index: number) => (
              <CouponCard
                key={voucher.id}
                status={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                {voucher.eventLabel && (
                  <EventLabel>{voucher.eventLabel}</EventLabel>
                )}
                
                {activeTab === 'locked' && (
                  <LockOverlay>
                    <LockIcon>🔒</LockIcon>
                    <LockText>{voucher.lockReason}</LockText>
                  </LockOverlay>
                )}
                
                <CouponIcon>
                  {activeTab === 'locked' ? <FiLock /> : getTypeIcon(voucher.type)}
                </CouponIcon>

                <CouponInfo>
                  <CouponCode blurred={activeTab === 'locked'}>
                    {activeTab === 'locked' ? '••••••••' : voucher.code}
                  </CouponCode>
                  <CouponValue>{formatValue(voucher)}</CouponValue>
                  <CouponDetails>
                    {voucher.description && (
                      <>
                        {voucher.description}
                        <br />
                      </>
                    )}
                    {voucher.minOrderValue > 0 && (
                      <>
                        📦 Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}
                        <br />
                      </>
                    )}
                    ⏰ HSD: {formatDate(voucher.endDate)}
                    {activeTab === 'available' && (
                      <>
                        <br />
                        🎯 Còn lại: {voucher.maxUsagePerUser - voucher.userUsageCount} lần
                      </>
                    )}
                    {activeTab === 'used' && (
                      <>
                        <br />
                        ✅ Đã dùng: {voucher.userUsageCount} lần
                      </>
                    )}
                  </CouponDetails>
                </CouponInfo>

                <CouponActions>
                  {activeTab === 'available' ? (
                    <>
                      <Button
                        onClick={() => handleCopy(voucher.code)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {copiedCode === voucher.code ? (
                          <><FiCheck /> Copy</>
                        ) : (
                          <><FiCopy /> Copy</>
                        )}
                      </Button>
                      <Button
                        primary
                        onClick={() => handleUse(voucher)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Dùng ngay
                      </Button>
                    </>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() => handleCopy(voucher.code)}
                      disabled={activeTab === 'expired' || activeTab === 'locked'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {copiedCode === voucher.code ? (
                        <><FiCheck /> Đã copy</>
                      ) : (
                        <><FiCopy /> Copy</>
                      )}
                    </Button>
                  )}
                </CouponActions>
              </CouponCard>
            ))}
          </AnimatePresence>
        </CouponsList>
      )}
    </Container>
  )
}

export default CouponsTab
