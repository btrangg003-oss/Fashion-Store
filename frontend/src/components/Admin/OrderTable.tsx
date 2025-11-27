import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPrinter, FiEye } from 'react-icons/fi';
import { useRouter } from 'next/router';
import ProductViewModal from '../Orders/ProductViewModal';
import StatusChangeModal from '../Orders/StatusChangeModal';
import { Order } from '@/models/orders';

interface OrderTableProps {
  orders: Order[];
  onStatusChange?: (orderId: string, newStatus: string, note?: string) => void;
  onPrint?: (order: Order) => void;
  onRefresh?: () => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onStatusChange, onPrint }) => {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      processing: 'Chuẩn bị hàng',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipping: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return map[status] || '#6b7280';
  };

  const handleViewDetail = (order: Order) => {
    router.push(`/admin/orders/${order.id}`);
  };

  const handleViewProducts = (order: Order) => {
    console.log('View products clicked:', order);
    setSelectedOrder(order);
    setShowProductModal(true);
  };

  const handleChangeStatus = (order: Order) => {
    console.log('Change status clicked:', order);
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, note?: string) => {
    if (onStatusChange) {
      onStatusChange(orderId, newStatus, note);
    }
  };

  const handlePrint = (order: Order) => {
    // Import print function dynamically
    import('../../lib/printInvoice').then(({ printInvoice }) => {
      printInvoice(order);
    });

    if (onPrint) {
      onPrint(order);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <>
      <TableContainer data-table-container tabIndex={0}>
        <Table>
          <thead>
            <tr>
              <Th>STT</Th>
              <Th>Mã đơn hàng</Th>
              <Th>Thời gian</Th>
              <Th>Khách hàng</Th>
              <Th>Gmail</Th>
              <Th>SĐT</Th>
              <Th>Sản phẩm</Th>
              <Th>Số tiền</Th>
              <Th>Trạng thái</Th>
              <Th>Nhân viên</Th>
              <Th>Thao tác</Th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <Tr
                key={order.id}
                as={motion.tr}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Td>{index + 1}</Td>
                <Td>
                  <OrderCode>#{order.orderNumber || 'N/A'}</OrderCode>
                </Td>
                <Td>
                  <TimeText>{formatDate(order.createdAt)}</TimeText>
                </Td>
                <Td>
                  <CustomerName>
                    {order.shippingAddress.fullName}
                  </CustomerName>
                </Td>
                <Td>
                  <EmailText>{order.customerEmail || order.userEmail || order.shippingAddress?.email || 'N/A'}</EmailText>
                </Td>
                <Td>
                  <PhoneText>
                    {order.shippingAddress.phone}
                  </PhoneText>
                </Td>
                <Td>
                  <ProductInfo>
                    {order.items?.length || 0} sản phẩm
                    {order.items && order.items.length > 0 && (
                      <ProductTooltip>
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx}>• {item.name} (x{item.quantity})</div>
                        ))}
                      </ProductTooltip>
                    )}
                  </ProductInfo>
                </Td>
                <Td>
                  <PriceText>{formatPrice(order.total || 0)}</PriceText>
                </Td>
                <Td>
                  <StatusBadge $color={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </StatusBadge>
                </Td>
                <Td>
                  <StaffText>Admin</StaffText>
                </Td>
                <Td>
                  <ActionButtons>
                    <ActionButton
                      title="Xem chi tiết"
                      $color="#10b981"
                      onClick={() => handleViewDetail(order)}
                    >
                      <FiEye />
                    </ActionButton>
                    <ActionButton
                      title="Xem sản phẩm"
                      $color="#3b82f6"
                      onClick={() => handleViewProducts(order)}
                    >
                      👁️
                    </ActionButton>
                    <ActionButton
                      title="Thay đổi trạng thái"
                      $color="#8b5cf6"
                      onClick={() => handleChangeStatus(order)}
                    >
                      👤
                    </ActionButton>
                    <ActionButton
                      title="In đơn hàng"
                      $color="#059669"
                      onClick={() => handlePrint(order)}
                    >
                      <FiPrinter />
                    </ActionButton>
                  </ActionButtons>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>

        {orders.length === 0 && (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyText>Không có đơn hàng nào</EmptyText>
          </EmptyState>
        )}
      </TableContainer>

      <ProductViewModal
        order={selectedOrder}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      <StatusChangeModal
        order={selectedOrder}
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onStatusChange={handleStatusUpdate}
      />
    </>
  );
};

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: 70vh;
  position: relative;
  
  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 1200px;
  border-collapse: collapse;
  font-size: 0.9rem;

  @media (max-width: 1200px) {
    font-size: 0.85rem;
  }
`;

const Th = styled.th`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;

  &:first-child {
    border-top-left-radius: 12px;
  }

  &:last-child {
    border-top-right-radius: 12px;
  }
`;

const Tr = styled.tr`
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 1rem 0.75rem;
  vertical-align: middle;
  color: #333;
  white-space: nowrap;
  
  &:last-child {
    min-width: 140px;
    width: 140px;
  }
`;

const OrderCode = styled.div`
  font-weight: 600;
  color: #667eea;
  font-family: 'Courier New', monospace;
`;

const TimeText = styled.div`
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
`;

const CustomerName = styled.div`
  font-weight: 500;
  color: #333;
`;

const EmailText = styled.div`
  font-size: 0.85rem;
  color: #666;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PhoneText = styled.div`
  font-size: 0.85rem;
  color: #666;
  white-space: nowrap;
`;

const ProductInfo = styled.div`
  position: relative;
  cursor: help;
  color: #667eea;
  font-weight: 500;

  &:hover > div {
    display: block;
  }
`;

const ProductTooltip = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: #333;
  color: white;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  margin-top: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 20px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #333;
  }

  div {
    margin-bottom: 0.25rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const PriceText = styled.div`
  font-weight: 600;
  color: #10b981;
  white-space: nowrap;
`;

const StatusBadge = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
`;

const StaffText = styled.div`
  font-size: 0.85rem;
  color: #666;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  min-width: 120px;
  flex-wrap: nowrap;
`;

const ActionButton = styled.button<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;

  svg {
    width: 16px !important;
    height: 16px !important;
    display: none !important;
  }

  &:hover {
    background: ${props => props.$color};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${props => props.color}40;
    z-index: 2;
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1.1rem;
  color: #999;
`;

export default OrderTable;
