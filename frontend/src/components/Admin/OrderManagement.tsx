import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiTruck, FiClock, FiMoreHorizontal, FiPhone, FiCheck, FiPackage, FiX, FiSearch, FiDownload, FiFilter, FiCalendar, FiMail, FiMapPin, FiDollarSign, FiEye
} from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';
import { Order } from '@/models/orders';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';

interface OrderManagementProps {
  orders: Order[];
  onOrderUpdate: (id: string, updates: Partial<Order>) => Promise<void>;
  onStatusChange: (id: string, status: OrderStatus, note?: string) => Promise<void>;
  onBulkAction: (action: string, orderIds: string[]) => Promise<void>;
  loading?: boolean;
}

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f7fafc;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    background: white;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
`;

const FilterTab = styled.button<{ active?: boolean }>`
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: ${props => props.active ? '#3182ce' : '#6b7280'};
  font-weight: ${props => props.active ? '600' : '500'};
  border-bottom: 2px solid ${props => props.active ? '#3182ce' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    color: #3182ce;
  }
`;

const OrderGrid = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
`;

const OrderCard = styled(motion.div) <{ status: OrderStatus }>`
  background: white;
  border: 1px solid #e2e8f0;
  border-left: 4px solid ${props => getStatusColor(props.status)};
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 1.125rem;
`;

const OrderDate = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatusBadge = styled.span<{ status: OrderStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => getStatusBgColor(props.status)};
  color: ${props => getStatusColor(props.status)};
`;

const CustomerInfo = styled.div`
  margin-bottom: 1rem;
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
`;

const CustomerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const CustomerDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrderItems = styled.div`
  margin-bottom: 1rem;
`;

const ItemsHeader = styled.div`
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 6px;
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #1a202c;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ItemDetails = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 0.875rem;
`;

const OrderFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const TotalAmount = styled.div`
  font-weight: 700;
  color: #1a202c;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #3182ce;
          color: white;
          &:hover { background: #2c5aa0; }
        `;
      case 'success':
        return `
          background: #10b981;
          color: white;
          &:hover { background: #059669; }
        `;
      case 'danger':
        return `
          background: #e53e3e;
          color: white;
          &:hover { background: #c53030; }
        `;
      default:
        return `
          background: #f7fafc;
          color: #4a5568;
          &:hover { background: #edf2f7; }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
  grid-column: 1 / -1;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

// Helper functions
const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'confirmed': return '#3b82f6';
    case 'processing': return '#8b5cf6';
    case 'shipping': return '#06b6d4';
    case 'delivered': return '#10b981';
    case 'cancelled': return '#ef4444';
    case 'refunded': return '#6b7280';
    default: return '#6b7280';
  }
};

const getStatusBgColor = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return '#fef3c7';
    case 'confirmed': return '#dbeafe';
    case 'processing': return '#ede9fe';
    case 'shipping': return '#cffafe';
    case 'delivered': return '#dcfce7';
    case 'cancelled': return '#fee2e2';
    case 'refunded': return '#f3f4f6';
    default: return '#f3f4f6';
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'confirmed': return 'Đã xác nhận';
    case 'processing': return 'Đang xử lý';
    case 'shipping': return 'Đang giao';
    case 'delivered': return 'Đã giao';
    case 'cancelled': return 'Đã hủy';
    case 'refunded': return 'Đã hoàn tiền';
    default: return status;
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return <FiClock size={12} />;
    case 'confirmed': return <FiCheck size={12} />;
    case 'processing': return <FiPackage size={12} />;
    case 'shipping': return <FiTruck size={12} />;
    case 'delivered': return <FiCheck size={12} />;
    case 'cancelled': return <FiX size={12} />;
    case 'refunded': return <FiX size={12} />;
    default: return <FiClock size={12} />;
  }
};

const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onOrderUpdate,
  onStatusChange,
  onBulkAction,
  loading = false
}) => {
  const { success, error } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  // // const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const statusTabs = [
    { key: 'all', label: 'Tất cả', count: orders.length },
    { key: 'pending', label: 'Chờ xử lý', count: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: 'Đã xác nhận', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'processing', label: 'Đang xử lý', count: orders.filter(o => o.status === 'processing').length },
    { key: 'shipping', label: 'Đang giao', count: orders.filter(o => o.status === 'shipping').length },
    { key: 'delivered', label: 'Đã giao', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const customerName = order.shippingAddress?.fullName || order.customerName || '';
    const customerEmail = order.customerEmail || '';
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await onStatusChange(orderId, newStatus);
      success(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"`);
    } catch (err) {
      error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Quản lý đơn hàng</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>
              <FiSearch size={16} />
            </SearchIcon>
          </SearchContainer>
        </HeaderLeft>

        <HeaderRight>
          <ActionButton>
            <FiDownload size={16} />
          </ActionButton>
          <ActionButton>
            <FiFilter size={16} />
          </ActionButton>
        </HeaderRight>
      </Header>

      <FilterTabs>
        {statusTabs.map(tab => (
          <FilterTab
            key={tab.key}
            active={filterStatus === tab.key}
            onClick={() => setFilterStatus(tab.key as OrderStatus | 'all')}
          >
            {tab.label} ({tab.count})
          </FilterTab>
        ))}
      </FilterTabs>

      <OrderGrid>
        {filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FiPackage size={24} />
            </EmptyIcon>
            <div>Không tìm thấy đơn hàng nào</div>
          </EmptyState>
        ) : (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              status={order.status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <OrderHeader>
                <div>
                  <OrderNumber>#{order.orderNumber}</OrderNumber>
                  <OrderDate>
                    <FiCalendar size={14} />
                    {formatDate(order.createdAt)}
                  </OrderDate>
                </div>
                <StatusBadge status={order.status}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </StatusBadge>
              </OrderHeader>

              <CustomerInfo>
                <CustomerName>{order.shippingAddress?.fullName || order.customerName || 'N/A'}</CustomerName>
                <CustomerDetails>
                  <CustomerDetail>
                    <FiMail size={14} />
                    {order.customerEmail || 'N/A'}
                  </CustomerDetail>
                  <CustomerDetail>
                    <FiPhone size={14} />
                    {order.shippingAddress?.phone || order.customerPhone || 'N/A'}
                  </CustomerDetail>
                  <CustomerDetail>
                    <FiMapPin size={14} />
                    {order.shippingAddress?.address || 'N/A'}
                  </CustomerDetail>
                </CustomerDetails>
              </CustomerInfo>

              <OrderItems>
                <ItemsHeader>Sản phẩm ({order.items.length})</ItemsHeader>
                <ItemsList>
                  {order.items.slice(0, 2).map((item, index) => (
                    <OrderItem key={index}>
                      <ItemInfo>
                        <ItemName>{item.name}</ItemName>
                        <ItemDetails>
                          SL: {item.quantity} × {formatPrice(item.price)}
                        </ItemDetails>
                      </ItemInfo>
                      <ItemPrice>
                        {formatPrice(item.quantity * item.price)}
                      </ItemPrice>
                    </OrderItem>
                  ))}
                  {order.items.length > 2 && (
                    <div style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center' }}>
                      +{order.items.length - 2} sản phẩm khác
                    </div>
                  )}
                </ItemsList>
              </OrderItems>

              <OrderFooter>
                <TotalAmount>
                  <FiDollarSign size={16} />
                  {formatPrice(order.total)}
                </TotalAmount>

                <ActionButtons>
                  <ActionButton>
                    <FiEye size={14} />
                  </ActionButton>

                  {order.status === 'pending' && (
                    <ActionButton
                      variant="success"
                      onClick={() => handleStatusChange(order.id, 'confirmed')}
                    >
                      <FiCheck size={14} />
                    </ActionButton>
                  )}

                  {order.status === 'confirmed' && (
                    <ActionButton
                      variant="primary"
                      onClick={() => handleStatusChange(order.id, 'processing')}
                    >
                      <FiPackage size={14} />
                    </ActionButton>
                  )}

                  {order.status === 'processing' && (
                    <ActionButton
                      variant="primary"
                      onClick={() => handleStatusChange(order.id, 'shipping')}
                    >
                      <FiTruck size={14} />
                    </ActionButton>
                  )}

                  <ActionButton>
                    <FiMoreHorizontal size={14} />
                  </ActionButton>
                </ActionButtons>
              </OrderFooter>
            </OrderCard>
          ))
        )}
      </OrderGrid>
    </Container>
  );
};

export default OrderManagement;