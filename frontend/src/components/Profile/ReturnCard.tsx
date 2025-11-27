import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiEye, FiXCircle, FiTrash2 } from 'react-icons/fi'
import { Return, RETURN_STATUSES } from '@/models/returns'

const Card = styled(motion.div)`
  background: white;
  border-radius: 16px;
  border: 2px solid #f3f4f6;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
    transform: translateY(-2px);
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-bottom: 2px solid #f3f4f6;
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const ReturnNumber = styled.div`
  font-weight: 700;
  font-size: 1.05rem;
  color: #111827;
  letter-spacing: -0.01em;
`

const OrderNumber = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`

const StatusBadge = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border: 2px solid ${props => props.color}30;
  border-radius: 24px;
  font-size: 0.875rem;
  font-weight: 700;
  box-shadow: 0 2px 8px ${props => props.color}10;
`

const Body = styled.div`
  padding: 1.5rem;
`

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
`

const ProductItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`

const ProductImage = styled.img`
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`

const ProductDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const ProductName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  line-height: 1.4;
`

const ProductMeta = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
`

const Reason = styled.div`
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #92400e;
  line-height: 1.6;
  
  strong {
    color: #78350f;
    font-weight: 700;
  }
`

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-top: 2px solid #f3f4f6;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const RefundAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 500;
  
  span {
    font-size: 1.25rem;
    font-weight: 800;
    color: #10b981;
    letter-spacing: -0.02em;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 640px) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`

const Button = styled(motion.button)<{ danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid ${props => props.danger ? '#ef4444' : '#667eea'};
  background: ${props => props.danger ? 'white' : '#667eea'};
  color: ${props => props.danger ? '#ef4444' : 'white'};
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: ${props => props.danger 
    ? '0 2px 8px rgba(239, 68, 68, 0.1)' 
    : '0 2px 8px rgba(102, 126, 234, 0.2)'};

  &:hover {
    background: ${props => props.danger ? '#fef2f2' : '#5568d3'};
    transform: translateY(-2px);
    box-shadow: ${props => props.danger 
      ? '0 4px 12px rgba(239, 68, 68, 0.2)' 
      : '0 4px 12px rgba(102, 126, 234, 0.3)'};
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    font-size: 1rem;
  }
`

interface ReturnCardProps {
  return: Return
  onCancel: (id: string) => void
  onDelete?: (id: string) => void
  delay?: number
}

const ReturnCard: React.FC<ReturnCardProps> = ({ return: returnItem, onCancel, onDelete, delay = 0 }) => {
  const status = RETURN_STATUSES[returnItem.status]

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Header>
        <Info>
          <ReturnNumber>Yêu cầu #{returnItem.returnNumber}</ReturnNumber>
          <OrderNumber>Đơn hàng: #{returnItem.orderNumber}</OrderNumber>
        </Info>
        <StatusBadge color={status.color}>
          {status.icon} {status.label}
        </StatusBadge>
      </Header>

      <Body>
        <ProductsList>
          {returnItem.items.slice(0, 2).map((item, idx) => (
            <ProductItem key={idx}>
              <ProductImage
                src={item.image}
                alt={item.productName}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/60'
                }}
              />
              <ProductDetails>
                <ProductName>{item.productName}</ProductName>
                <ProductMeta>
                  {item.size && `Size: ${item.size}`}
                  {item.color && ` • Màu: ${item.color}`}
                  {` • x${item.quantity}`}
                </ProductMeta>
              </ProductDetails>
            </ProductItem>
          ))}
          {returnItem.items.length > 2 && (
            <div style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
              +{returnItem.items.length - 2} sản phẩm khác
            </div>
          )}
        </ProductsList>

        <Reason>
          <strong>Lý do:</strong> {returnItem.reasonText}
        </Reason>
      </Body>

      <Footer>
        <RefundAmount>
          Hoàn tiền dự kiến:
          <span>{returnItem.refundAmount.toLocaleString('vi-VN')}₫</span>
        </RefundAmount>
        <Actions>
          <Button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <FiEye /> Chi tiết
          </Button>
          {returnItem.status === 'pending' && (
            <Button
              danger
              onClick={() => onCancel(returnItem.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiXCircle /> Hủy
            </Button>
          )}
          {(returnItem.status === 'rejected' || returnItem.status === 'completed' || returnItem.status === 'cancelled') && onDelete && (
            <Button
              danger
              onClick={() => onDelete(returnItem.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiTrash2 /> Xóa
            </Button>
          )}
        </Actions>
      </Footer>
    </Card>
  )
}

export default ReturnCard
