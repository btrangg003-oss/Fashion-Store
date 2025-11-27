import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiGift, FiTruck, FiPercent, FiAward } from 'react-icons/fi'

const vouchers = [
  {
    id: 1,
    code: 'FREESHIP',
    icon: <FiTruck />,
    title: 'Miễn phí vận chuyển',
    description: 'Cho mọi đơn hàng',
    color: '#4CAF50',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
  },
  {
    id: 2,
    code: 'GIAM30K',
    icon: <FiGift />,
    title: 'Giảm 30K',
    description: 'Đơn hàng từ 200K',
    color: '#2196F3',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)'
  },
  {
    id: 3,
    code: 'GIAM30',
    icon: <FiPercent />,
    title: 'Giảm 30%',
    description: 'Đơn hàng từ 500K',
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)'
  },
  {
    id: 4,
    code: 'VIP25',
    icon: <FiAward />,
    title: 'Giảm 25%',
    description: 'Khách hàng từ hạng Bạc',
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)'
  }
]

const DefaultVouchers = () => {
  return (
    <Container>
      <VoucherGrid>
        {vouchers.map((voucher, index) => (
          <VoucherCard
            key={voucher.id}
            gradient={voucher.gradient}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <VoucherPattern />
            <VoucherContent>
              <IconWrapper color={voucher.color}>
                {voucher.icon}
              </IconWrapper>
              
              <VoucherInfo>
                <VoucherTitle>{voucher.title}</VoucherTitle>
                <VoucherDescription>{voucher.description}</VoucherDescription>
              </VoucherInfo>
              
              <VoucherCodeBox>
                <CodeLabel>Mã:</CodeLabel>
                <Code>{voucher.code}</Code>
              </VoucherCodeBox>
              
              <CopyButton>
                Sao chép mã
              </CopyButton>
            </VoucherContent>
            
            <VoucherCorner />
          </VoucherCard>
        ))}
      </VoucherGrid>
    </Container>
  )
}

const Container = styled.section`
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 20px;
`

const VoucherGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 25px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const VoucherCard = styled(motion.div)<{ gradient: string }>`
  background: ${props => props.gradient};
  border-radius: 16px;
  padding: 25px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    background: #f8f8f8;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
    background: #f8f8f8;
    border-radius: 50%;
  }
`

const VoucherPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.05) 10px,
      rgba(255, 255, 255, 0.05) 20px
    );
  pointer-events: none;
`

const VoucherContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`

const IconWrapper = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: ${props => props.color};
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`

const VoucherInfo = styled.div`
  margin-bottom: 15px;
`

const VoucherTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 5px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const VoucherDescription = styled.p`
  font-size: 15px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
`

const VoucherCodeBox = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 12px 20px;
  margin-bottom: 15px;
  width: 100%;
`

const CodeLabel = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
`

const Code = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: white;
  letter-spacing: 2px;
  font-family: 'Courier New', monospace;
`

const CopyButton = styled.button`
  background: white;
  color: #333;
  border: none;
  padding: 10px 25px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const VoucherCorner = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  
  &::before {
    content: '✨';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;
  }
`

export default DefaultVouchers
