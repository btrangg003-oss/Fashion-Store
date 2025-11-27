import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPackage } from 'react-icons/fi';

interface ProductViewModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!order) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Modal
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Header>
              <HeaderLeft>
                <FiPackage />
                <Title>Thông tin sản phẩm - #{order.orderNumber}</Title>
              </HeaderLeft>
              <CloseButton onClick={onClose}>
                <FiX />
              </CloseButton>
            </Header>

            <Content>
              <OrderInfo>
                <InfoRow>
                  <InfoLabel>Mã đơn hàng:</InfoLabel>
                  <InfoValue>#{order.orderNumber}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Ngày đặt:</InfoLabel>
                  <InfoValue>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Khách hàng:</InfoLabel>
                  <InfoValue>
                    {order.shippingAddress?.fullName || order.customerName || 'N/A'}
                  </InfoValue>
                </InfoRow>
              </OrderInfo>

              <ProductsSection>
                <SectionTitle>Danh sách sản phẩm ({order.items?.length || 0})</SectionTitle>
                <ProductsList>
                  {order.items?.map((item: any, index: number) => (
                    <ProductItem key={index}>
                      <ProductImage
                        src={item.image?.url || item.image || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80';
                        }}
                      />
                      <ProductDetails>
                        <ProductName>{item.name}</ProductName>
                        <ProductMeta>
                          {item.size && <MetaItem>Size: {item.size}</MetaItem>}
                          {item.color && <MetaItem>Màu: {item.color}</MetaItem>}
                          <MetaItem>Số lượng: {item.quantity}</MetaItem>
                        </ProductMeta>
                        <ProductPrice>
                          <PriceLabel>Đơn giá:</PriceLabel>
                          <Price>{formatPrice(item.price)}₫</Price>
                        </ProductPrice>
                      </ProductDetails>
                      <ProductTotal>
                        <TotalLabel>Thành tiền:</TotalLabel>
                        <TotalPrice>{formatPrice(item.price * item.quantity)}₫</TotalPrice>
                      </ProductTotal>
                    </ProductItem>
                  ))}
                </ProductsList>
              </ProductsSection>

              <SummarySection>
                <SummaryRow>
                  <SummaryLabel>Tạm tính:</SummaryLabel>
                  <SummaryValue>{formatPrice(order.subtotal || 0)}₫</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>Phí vận chuyển:</SummaryLabel>
                  <SummaryValue>{formatPrice(order.shipping || order.shippingFee || 0)}₫</SummaryValue>
                </SummaryRow>
                <SummaryRow total>
                  <SummaryLabel>Tổng cộng:</SummaryLabel>
                  <SummaryValue>{formatPrice(order.total || 0)}₫</SummaryValue>
                </SummaryRow>
              </SummarySection>
            </Content>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled(motion.div)`
  position: relative;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    font-size: 1.5rem;
  }
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 0, 0, 0.3);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const OrderInfo = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const InfoRow = styled.div`
  display: flex;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  font-weight: 600;
  color: #666;
  min-width: 120px;
`;

const InfoValue = styled.div`
  color: #333;
  flex: 1;
`;

const ProductsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const ProductMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
`;

const MetaItem = styled.span`
  font-size: 0.85rem;
  color: #666;
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PriceLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
`;

const Price = styled.span`
  font-weight: 600;
  color: #667eea;
`;

const ProductTotal = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const TotalLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const TotalPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
`;

const SummarySection = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
`;

const SummaryRow = styled.div<{ total?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  
  ${props => props.total && `
    border-top: 2px solid #667eea;
    margin-top: 0.5rem;
    padding-top: 1rem;
    font-size: 1.1rem;
    font-weight: 700;
  `}
`;

const SummaryLabel = styled.div`
  color: #666;
`;

const SummaryValue = styled.div`
  font-weight: 600;
  color: #333;
`;

export default ProductViewModal;