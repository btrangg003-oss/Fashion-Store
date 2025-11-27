import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiPackage, FiEye, FiMoreHorizontal, FiCheck,
  FiClock, FiTruck, FiX, FiRefreshCw
} from 'react-icons/fi';
import Link from 'next/link';

const OrdersContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-top: 2rem;
`;

const OrdersHeader = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
`;

const OrdersTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewAllButton = styled(Link)`
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #eff6ff;
  }
`;

const OrdersTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem 1.5rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableCell = styled.td`
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #1f2937;
  vertical-align: middle;
`;

const OrderId = styled.div`
  font-weight: 600;
  color: #1a202c;
`;

const OrderDate = styled.div`
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const CustomerInfo = styled.div``;

const CustomerName = styled.div`
  font-weight: 500;
  color: #1a202c;
`;

const CustomerEmail = styled.div`
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const OrderAmount = styled.div`
  font-weight: 600;
  color: #1a202c;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'processing':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'shipped':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'delivered':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'cancelled':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
        `;
    }
  }}
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1a202c;
  }
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: number;
}

interface RecentOrdersProps {
  orders: Order[] | null;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <FiClock />;
    case 'processing':
      return <FiRefreshCw />;
    case 'shipped':
      return <FiTruck />;
    case 'delivered':
      return <FiCheck />;
    case 'cancelled':
      return <FiX />;
    default:
      return <FiPackage />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Chờ xử lý';
    case 'processing':
      return 'Đang xử lý';
    case 'shipped':
      return 'Đã gửi';
    case 'delivered':
      return 'Đã giao';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Mock data for demonstration
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nguyenvana@email.com',
    amount: 1250000,
    status: 'processing',
    createdAt: new Date().toISOString(),
    items: 3
  },
  {
    id: 'ORD-002',
    customerName: 'Trần Thị B',
    customerEmail: 'tranthib@email.com',
    amount: 890000,
    status: 'shipped',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: 2
  },
  {
    id: 'ORD-003',
    customerName: 'Lê Văn C',
    customerEmail: 'levanc@email.com',
    amount: 2100000,
    status: 'pending',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    items: 5
  },
  {
    id: 'ORD-004',
    customerName: 'Phạm Thị D',
    customerEmail: 'phamthid@email.com',
    amount: 750000,
    status: 'delivered',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    items: 1
  },
  {
    id: 'ORD-005',
    customerName: 'Hoàng Văn E',
    customerEmail: 'hoangvane@email.com',
    amount: 1680000,
    status: 'cancelled',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    items: 4
  }
];

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  const displayOrders = orders || mockOrders;

  if (!displayOrders || displayOrders.length === 0) {
    return (
      <OrdersContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <OrdersHeader>
          <OrdersTitle>
            <FiPackage />
            Đơn hàng gần đây
          </OrdersTitle>
        </OrdersHeader>
        
        <EmptyState>
          <EmptyIcon>
            <FiPackage />
          </EmptyIcon>
          <div>Chưa có đơn hàng nào</div>
        </EmptyState>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <OrdersHeader>
        <OrdersTitle>
          <FiPackage />
          Đơn hàng gần đây
        </OrdersTitle>
        <ViewAllButton href="/admin/orders">
          Xem tất cả
        </ViewAllButton>
      </OrdersHeader>

      <OrdersTable>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Đơn hàng</TableHeaderCell>
              <TableHeaderCell>Khách hàng</TableHeaderCell>
              <TableHeaderCell>Số tiền</TableHeaderCell>
              <TableHeaderCell>Trạng thái</TableHeaderCell>
              <TableHeaderCell>Thao tác</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {displayOrders.slice(0, 5).map((order, index) => (
              <TableRow
                key={order.id}
                as={motion.tr}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TableCell>
                  <OrderId>{order.id}</OrderId>
                  <OrderDate>{formatDate(order.createdAt)}</OrderDate>
                </TableCell>
                <TableCell>
                  <CustomerInfo>
                    <CustomerName>{order.customerName}</CustomerName>
                    <CustomerEmail>{order.customerEmail}</CustomerEmail>
                  </CustomerInfo>
                </TableCell>
                <TableCell>
                  <OrderAmount>{formatCurrency(order.amount)}</OrderAmount>
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/orders/${order.id}`}>
                      <ActionButton title="Xem chi tiết">
                        <FiEye />
                      </ActionButton>
                    </Link>
                    <ActionButton title="Thêm tùy chọn">
                      <FiMoreHorizontal />
                    </ActionButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </OrdersTable>
    </OrdersContainer>
  );
}