import React from 'react';
import styled from 'styled-components';
import { ShippingData } from './ShippingForm';
import { ShippingMethodData } from './ShippingMethod';

interface OrderSummaryProps {
  shippingInfo: ShippingData;
  shippingMethod: ShippingMethodData;
  cartItems: any[];
  subtotal: number;
  discount?: number;
  voucherCodes?: string[];
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  shippingInfo,
  shippingMethod,
  cartItems,
  subtotal,
  discount = 0,
  voucherCodes = []
}) => {
  const total = subtotal + shippingMethod.price - discount;

  return (
    <Container>
      <Section>
        <SectionTitle>Thông tin giao hàng</SectionTitle>
        <InfoRow>
          <Label>Người nhận:</Label>
          <Value>{shippingInfo.fullName}</Value>
        </InfoRow>
        <InfoRow>
          <Label>Số điện thoại:</Label>
          <Value>{shippingInfo.phone}</Value>
        </InfoRow>
        <InfoRow>
          <Label>Địa chỉ:</Label>
          <Value>
            {shippingInfo.address}, {shippingInfo.ward}, {shippingInfo.district}, {shippingInfo.city}
          </Value>
        </InfoRow>
      </Section>

      <Section>
        <SectionTitle>Phương thức vận chuyển</SectionTitle>
        <InfoRow>
          <Value>{shippingMethod.name}</Value>
          <Value>{shippingMethod.price.toLocaleString('vi-VN')}đ</Value>
        </InfoRow>
        <InfoRow>
          <SmallText>Dự kiến: {shippingMethod.estimatedDays}</SmallText>
        </InfoRow>
      </Section>

      <Section>
        <SectionTitle>Sản phẩm ({cartItems.length})</SectionTitle>
        {cartItems.map((item, index) => (
          <ProductRow key={index}>
            <ProductInfo>
              <ProductName>{item.name}</ProductName>
              <ProductDetails>
                {item.size && <span>Size: {item.size}</span>}
                {item.color && <span> • Màu: {item.color}</span>}
                <span> • SL: {item.quantity}</span>
              </ProductDetails>
            </ProductInfo>
            <ProductPrice>
              {(item.price * item.quantity).toLocaleString('vi-VN')}đ
            </ProductPrice>
          </ProductRow>
        ))}
      </Section>

      <Divider />

      <TotalSection>
        <TotalRow>
          <Label>Tạm tính:</Label>
          <Value>{subtotal.toLocaleString('vi-VN')}đ</Value>
        </TotalRow>
        <TotalRow>
          <Label>Phí vận chuyển:</Label>
          <Value>{shippingMethod.price.toLocaleString('vi-VN')}đ</Value>
        </TotalRow>
        {discount > 0 && (
          <DiscountRow>
            <DiscountLabel>
              Giảm giá {voucherCodes.length > 0 && `(${voucherCodes.length} mã)`}:
            </DiscountLabel>
            <DiscountValue>-{discount.toLocaleString('vi-VN')}đ</DiscountValue>
          </DiscountRow>
        )}
        <FinalTotal>
          <TotalLabel>Tổng cộng:</TotalLabel>
          <TotalValue>{total.toLocaleString('vi-VN')}đ</TotalValue>
        </FinalTotal>
      </TotalSection>
    </Container>
  );
};

const Container = styled.div`
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  gap: 1rem;
`;

const Label = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const Value = styled.span`
  color: #1f2937;
  font-size: 0.875rem;
  text-align: right;
`;

const SmallText = styled.span`
  color: #9ca3af;
  font-size: 0.75rem;
`;

const ProductRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const ProductDetails = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ProductPrice = styled.div`
  font-weight: 500;
  color: #1f2937;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
`;

const TotalSection = styled.div``;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const DiscountRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #d1fae5;
  border-radius: 0.375rem;
`;

const DiscountLabel = styled.span`
  color: #065f46;
  font-size: 0.875rem;
  font-weight: 600;
`;

const DiscountValue = styled.span`
  color: #047857;
  font-size: 0.875rem;
  font-weight: 700;
`;

const FinalTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
`;

const TotalLabel = styled.span`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

const TotalValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
`;

export default OrderSummary;
