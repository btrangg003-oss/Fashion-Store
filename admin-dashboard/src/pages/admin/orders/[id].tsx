import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import OrderOutboundSection from '@/components/Admin/OrderOutboundSection';
import { FiArrowLeft, FiPackage, FiUser, FiMapPin, FiDollarSign, FiClock, FiEdit } from 'react-icons/fi';
import { Order } from '@/models/orders';

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders?orderId=${id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/orders');
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingText>Đang tải...</LoadingText>
        </Container>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <Container>
          <ErrorText>Không tìm thấy đơn hàng</ErrorText>
          <BackButton onClick={handleBack}>
            <FiArrowLeft /> Quay lại
          </BackButton>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <BackButton onClick={handleBack}>
            <FiArrowLeft /> Quay lại
          </BackButton>
          <HeaderTitle>
            <Title>Chi Tiết Đơn Hàng</Title>
            <OrderNumber>#{order.orderNumber}</OrderNumber>
          </HeaderTitle>
          <StatusBadge status={order.status}>
            {getStatusLabel(order.status)}
          </StatusBadge>
        </Header>

        <ContentGrid>
          {/* Left Column */}
          <LeftColumn>
            {/* Customer Info */}
            <Card>
              <CardTitle>
                <FiUser /> Thông Tin Khách Hàng
              </CardTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Họ tên:</InfoLabel>
                  <InfoValue>{order.shippingAddress.fullName}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Số điện thoại:</InfoLabel>
                  <InfoValue>{order.shippingAddress.phone}</InfoValue>
                </InfoItem>
                {order.shippingAddress.email && (
                  <InfoItem>
                    <InfoLabel>Email:</InfoLabel>
                    <InfoValue>{order.shippingAddress.email}</InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardTitle>
                <FiMapPin /> Địa Chỉ Giao Hàng
              </CardTitle>
              <AddressText>
                {order.shippingAddress.address}<br />
                {order.shippingAddress.ward}, {order.shippingAddress.district}<br />
                {order.shippingAddress.city}
              </AddressText>
            </Card>

            {/* Products */}
            <Card>
              <CardTitle>
                <FiPackage /> Sản Phẩm ({order.items.length})
              </CardTitle>
              <ProductsList>
                {order.items.map((item, index) => (
                  <ProductItem key={index}>
                    <ProductImage src={item.image} alt={item.name} />
                    <ProductInfo>
                      <ProductName>{item.name}</ProductName>
                      {item.sku && <ProductSKU>SKU: {item.sku}</ProductSKU>}
                      {(item.size || item.color) && (
                        <ProductVariant>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Màu: {item.color}</span>}
                        </ProductVariant>
                      )}
                    </ProductInfo>
                    <ProductQuantity>x{item.quantity}</ProductQuantity>
                    <ProductPrice>{item.price.toLocaleString()}₫</ProductPrice>
                  </ProductItem>
                ))}
              </ProductsList>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardTitle>
                <FiDollarSign /> Thanh Toán
              </CardTitle>
              <SummaryGrid>
                <SummaryRow>
                  <SummaryLabel>Tạm tính:</SummaryLabel>
                  <SummaryValue>{order.subtotal.toLocaleString()}₫</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>Phí vận chuyển:</SummaryLabel>
                  <SummaryValue>{order.shipping.toLocaleString()}₫</SummaryValue>
                </SummaryRow>
                {order.discount && order.discount > 0 && (
                  <SummaryRow>
                    <SummaryLabel>Giảm giá:</SummaryLabel>
                    <SummaryValue discount>-{order.discount.toLocaleString()}₫</SummaryValue>
                  </SummaryRow>
                )}
                <SummaryDivider />
                <SummaryRow highlight>
                  <SummaryLabel><strong>Tổng cộng:</strong></SummaryLabel>
                  <SummaryValue><strong>{order.total.toLocaleString()}₫</strong></SummaryValue>
                </SummaryRow>
              </SummaryGrid>

              <PaymentInfo>
                <PaymentMethod>
                  Phương thức: <strong>{getPaymentMethodLabel(order.paymentMethod)}</strong>
                </PaymentMethod>
                <PaymentStatus status={order.paymentStatus}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </PaymentStatus>
              </PaymentInfo>
            </Card>
          </LeftColumn>

          {/* Right Column */}
          <RightColumn>
            {/* Order Info */}
            <Card>
              <CardTitle>
                <FiClock /> Thông Tin Đơn Hàng
              </CardTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Ngày đặt:</InfoLabel>
                  <InfoValue>{new Date(order.createdAt).toLocaleString('vi-VN')}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Trạng thái:</InfoLabel>
                  <InfoValue>
                    <StatusBadge status={order.status}>
                      {getStatusLabel(order.status)}
                    </StatusBadge>
                  </InfoValue>
                </InfoItem>
                {order.trackingNumber && (
                  <InfoItem>
                    <InfoLabel>Mã vận đơn:</InfoLabel>
                    <InfoValue>
                      <TrackingNumber>{order.trackingNumber}</TrackingNumber>
                    </InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>

              {order.notes && (
                <NotesBox>
                  <NotesLabel>Ghi chú:</NotesLabel>
                  <NotesText>{order.notes}</NotesText>
                </NotesBox>
              )}
            </Card>

            {/* Outbound Section */}
            <OrderOutboundSection 
              orderId={order.id} 
              orderNumber={order.orderNumber}
            />
          </RightColumn>
        </ContentGrid>
      </Container>
    </AdminLayout>
  );
};

// Helper functions
const getStatusLabel = (status: string) => {
  const labels: any = {
    pending: '⏳ Chờ xác nhận',
    confirmed: '✅ Đã xác nhận',
    processing: '⚙️ Đang xử lý',
    shipping: '🚚 Đang giao',
    delivered: '✔️ Đã giao',
    cancelled: '❌ Đã hủy',
    refunded: '💰 Đã hoàn tiền'
  };
  return labels[status] || status;
};

const getPaymentMethodLabel = (method: string) => {
  const labels: any = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng',
    momo: 'Ví MoMo'
  };
  return labels[method] || method;
};

const getPaymentStatusLabel = (status: string) => {
  const labels: any = {
    pending: '⏳ Chờ thanh toán',
    paid: '✅ Đã thanh toán',
    failed: '❌ Thất bại',
    refunded: '💰 Đã hoàn tiền'
  };
  return labels[status] || status;
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  padding: 10px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #f9fafb;
  }
`;

const HeaderTitle = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const OrderNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #3b82f6;
  font-family: 'Courier New', monospace;
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'confirmed': return '#d1fae5';
      case 'processing': return '#dbeafe';
      case 'shipping': return '#e0e7ff';
      case 'delivered': return '#d1fae5';
      case 'cancelled': return '#fee2e2';
      case 'refunded': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#d97706';
      case 'confirmed': return '#059669';
      case 'processing': return '#2563eb';
      case 'shipping': return '#4f46e5';
      case 'delivered': return '#059669';
      case 'cancelled': return '#dc2626';
      case 'refunded': return '#d97706';
      default: return '#6b7280';
    }
  }};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const InfoValue = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #111827;
`;

const AddressText = styled.div`
  font-size: 15px;
  line-height: 1.6;
  color: #374151;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ProductItem = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr auto auto;
  gap: 16px;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const ProductSKU = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
`;

const ProductVariant = styled.div`
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 12px;
`;

const ProductQuantity = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const ProductPrice = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  text-align: right;
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.highlight ? '12px' : '0'};
  background: ${props => props.highlight ? '#f0f9ff' : 'transparent'};
  border-radius: 8px;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const SummaryValue = styled.div<{ discount?: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.discount ? '#ef4444' : '#111827'};
`;

const SummaryDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
`;

const PaymentInfo = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PaymentMethod = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const PaymentStatus = styled.div<{ status: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'paid': return '#d1fae5';
      case 'failed': return '#fee2e2';
      case 'refunded': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#d97706';
      case 'paid': return '#059669';
      case 'failed': return '#dc2626';
      case 'refunded': return '#d97706';
      default: return '#6b7280';
    }
  }};
`;

const TrackingNumber = styled.code`
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  color: #3b82f6;
`;

const NotesBox = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
`;

const NotesLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
`;

const NotesText = styled.div`
  font-size: 14px;
  color: #374151;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 16px;
  color: #6b7280;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 16px;
  color: #dc2626;
`;

export default OrderDetailPage;
