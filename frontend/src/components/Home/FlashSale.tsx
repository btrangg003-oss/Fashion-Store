import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FiClock, FiChevronLeft, FiChevronRight, FiZap } from 'react-icons/fi'
import Link from 'next/link'

const mockProducts = [
  {
    id: '1',
    name: 'Áo khoác blazer',
    price: 705000,
    comparePrice: 950000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
    discount: 26,
    sold: 156,
    stock: 200
  },
  {
    id: '2',
    name: 'Áo đệt kim nữ sát nách',
    price: 168000,
    comparePrice: 280000,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80',
    discount: 40,
    sold: 234,
    stock: 300
  },
  {
    id: '3',
    name: 'Giày leo núi chống thấm',
    price: 699000,
    comparePrice: 1200000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    discount: 42,
    sold: 89,
    stock: 150
  },
  {
    id: '4',
    name: 'Chân váy xếp ly tennis',
    price: 199000,
    comparePrice: 350000,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80',
    discount: 43,
    sold: 312,
    stock: 400
  },
  {
    id: '5',
    name: 'Găng tay trekking giữ ấm',
    price: 89000,
    comparePrice: 150000,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80',
    discount: 41,
    sold: 178,
    stock: 250
  }
]

const FlashSale = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 12,
    minutes: 40,
    seconds: 43
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) {
              hours--
            } else {
              hours = 23
              if (days > 0) {
                days--
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <FlashIcon>
            <FiZap />
          </FlashIcon>
          <HeaderTitle>
            <MainTitle>FLASH SALE</MainTitle>
            <SubTitle>Giảm giá sốc - Số lượng có hạn</SubTitle>
          </HeaderTitle>
        </HeaderLeft>
        
        <Timer>
          <TimerLabel>
            <FiClock /> Kết thúc sau:
          </TimerLabel>
          <TimeBoxes>
            {timeLeft.days > 0 && (
              <>
                <TimeBox>
                  <TimeValue>{String(timeLeft.days).padStart(2, '0')}</TimeValue>
                  <TimeLabel>Ngày</TimeLabel>
                </TimeBox>
                <TimeSeparator>:</TimeSeparator>
              </>
            )}
            <TimeBox>
              <TimeValue>{String(timeLeft.hours).padStart(2, '0')}</TimeValue>
              <TimeLabel>Giờ</TimeLabel>
            </TimeBox>
            <TimeSeparator>:</TimeSeparator>
            <TimeBox>
              <TimeValue>{String(timeLeft.minutes).padStart(2, '0')}</TimeValue>
              <TimeLabel>Phút</TimeLabel>
            </TimeBox>
            <TimeSeparator>:</TimeSeparator>
            <TimeBox>
              <TimeValue>{String(timeLeft.seconds).padStart(2, '0')}</TimeValue>
              <TimeLabel>Giây</TimeLabel>
            </TimeBox>
          </TimeBoxes>
        </Timer>
      </Header>

      <ProductGrid>
        {mockProducts.map((product) => (
          <ProductCard key={product.id}>
            <Link href={`/products/${product.id}`}>
              <ImageWrapper>
                <ProductImage src={product.image} alt={product.name} />
                <DiscountBadge>-{product.discount}%</DiscountBadge>
                <ProgressWrapper>
                  <ProgressBar>
                    <ProgressFill width={(product.sold / product.stock) * 100} />
                  </ProgressBar>
                  <ProgressText>Đã bán {product.sold}/{product.stock}</ProgressText>
                </ProgressWrapper>
              </ImageWrapper>
              
              <ProductInfo>
                <ProductName>{product.name}</ProductName>
                <PriceWrapper>
                  <CurrentPrice>{product.price.toLocaleString('vi-VN')}đ</CurrentPrice>
                  <OriginalPrice>{product.comparePrice.toLocaleString('vi-VN')}đ</OriginalPrice>
                </PriceWrapper>
              </ProductInfo>
            </Link>
          </ProductCard>
        ))}
      </ProductGrid>

      <ViewAllButton href="/flash-sale">
        Xem tất cả Flash Sale
      </ViewAllButton>
    </Container>
  )
}

const Container = styled.section`
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 20px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 25px 30px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

const FlashIcon = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`

const HeaderTitle = styled.div``

const MainTitle = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
`

const SubTitle = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  margin: 5px 0 0 0;
`

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

const TimerLabel = styled.div`
  font-size: 16px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`

const TimeBoxes = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const TimeBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 60px;
  text-align: center;
`

const TimeValue = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #ff6b35;
  line-height: 1;
`

const TimeLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`

const TimeSeparator = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: white;
`

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
`

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  
  a {
    text-decoration: none;
    color: inherit;
  }
`

const ImageWrapper = styled.div`
  position: relative;
  padding-top: 133%;
  overflow: hidden;
  background: #f8f8f8;
`

const ProductImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ProductCard}:hover & {
    transform: scale(1.05);
  }
`

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff6b35;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(255, 107, 53, 0.4);
`

const ProgressWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 10px;
`

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
`

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 3px;
  transition: width 0.3s ease;
`

const ProgressText = styled.div`
  font-size: 11px;
  color: white;
  text-align: center;
  font-weight: 600;
`

const ProductInfo = styled.div`
  padding: 15px;
`

const ProductName = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PriceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const CurrentPrice = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #ff6b35;
`

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
`

const ViewAllButton = styled(Link)`
  display: block;
  width: fit-content;
  margin: 0 auto;
  padding: 14px 40px;
  background: #ff6b35;
  color: white;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff5722;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
  }
`

export default FlashSale
