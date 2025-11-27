import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiSearch, FiFilter, FiDownload, FiEdit2, FiTrash2, 
  FiEye, FiMail, FiPhone, FiMapPin, FiShoppingBag,
  FiMoreVertical, FiUserX, FiUserCheck
} from 'react-icons/fi';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  tier?: string;
  segment?: string;
}

interface CustomerTableProps {
  customers: Customer[];
  loading?: boolean;
  onView?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
  onBlock?: (customerId: string) => void;
  onUnblock?: (customerId: string) => void;
  onExport?: () => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  onView,
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
  onExport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (customer.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'blocked': return 'Đã chặn';
      default: return status;
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <SearchContainer>
            <SearchIcon><FiSearch /></SearchIcon>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="blocked">Đã chặn</option>
          </FilterSelect>
        </HeaderLeft>

        <HeaderRight>
          {selectedCustomers.length > 0 && (
            <SelectedInfo>
              Đã chọn {selectedCustomers.length} khách hàng
            </SelectedInfo>
          )}
          <ActionButton onClick={onExport}>
            <FiDownload /> Xuất Excel
          </ActionButton>
        </HeaderRight>
      </Header>

      {loading ? (
        <LoadingContainer>Đang tải...</LoadingContainer>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th width="40px">
                  <Checkbox
                    type="checkbox"
                    checked={selectedCustomers.length === filteredCustomers.length}
                    onChange={handleSelectAll}
                  />
                </Th>
                <Th>Khách hàng</Th>
                <Th>Liên hệ</Th>
                <Th>Hạng</Th>
                <Th>Phân loại</Th>
                <Th>Đơn hàng</Th>
                <Th>Tổng chi tiêu</Th>
                <Th>Trạng thái</Th>
                <Th>Ngày tham gia</Th>
                <Th width="100px">Thao tác</Th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <Tr key={customer.id}>
                  <Td>
                    <Checkbox
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                    />
                  </Td>
                  <Td>
                    <CustomerName>{customer.name}</CustomerName>
                  </Td>
                  <Td>
                    <ContactInfo>
                      <ContactItem>
                        <FiMail size={14} />
                        {customer.email}
                      </ContactItem>
                      {customer.phone && (
                        <ContactItem>
                          <FiPhone size={14} />
                          {customer.phone}
                        </ContactItem>
                      )}
                    </ContactInfo>
                  </Td>
                  <Td>
                    {customer.tier ? (
                      <TierBadge tier={customer.tier}>
                        {customer.tier === 'new' ? '🆕 Mới' :
                         customer.tier === 'regular' ? '👤 Thân thiết' :
                         customer.tier === 'loyal' ? '🏆 Lâu năm' :
                         customer.tier === 'vip' ? '⭐ VIP' : customer.tier}
                      </TierBadge>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </Td>
                  <Td>
                    {customer.segment ? (
                      <CustomerSegment segment={customer.segment}>
                        {customer.segment === 'new' ? '🆕 Mới' :
                         customer.segment === 'regular' ? '👤 Bình thường' :
                         customer.segment === 'loyal' ? '🏆 Lâu năm' :
                         customer.segment === 'vip' ? '⭐ VIP' : customer.segment}
                      </CustomerSegment>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    )}
                  </Td>
                  <Td>
                    <OrderInfo>
                      <FiShoppingBag size={16} />
                      {customer.totalOrders} đơn
                    </OrderInfo>
                  </Td>
                  <Td>
                    <Amount>{formatCurrency(customer.totalSpent)}</Amount>
                  </Td>
                  <Td>
                    <StatusBadge status={customer.status}>
                      {getStatusText(customer.status)}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <DateText>{formatDate(customer.createdAt)}</DateText>
                  </Td>
                  <Td>
                    <ActionsContainer>
                      <ActionIcon
                        onClick={() => onView?.(customer)}
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => onEdit?.(customer)}
                        title="Chỉnh sửa"
                      >
                        <FiEdit2 />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => setShowActions(showActions === customer.id ? null : customer.id)}
                        title="Thêm"
                      >
                        <FiMoreVertical />
                      </ActionIcon>
                      
                      {showActions === customer.id && (
                        <ActionsMenu>
                          {customer.status === 'blocked' ? (
                            <MenuItem onClick={() => onUnblock?.(customer.id)}>
                              <FiUserCheck /> Bỏ chặn
                            </MenuItem>
                          ) : (
                            <MenuItem onClick={() => onBlock?.(customer.id)}>
                              <FiUserX /> Chặn khách hàng
                            </MenuItem>
                          )}
                          <MenuItem danger onClick={() => onDelete?.(customer.id)}>
                            <FiTrash2 /> Xóa
                          </MenuItem>
                        </ActionsMenu>
                      )}
                    </ActionsContainer>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>

          {filteredCustomers.length === 0 && (
            <EmptyState>
              <FiSearch size={48} />
              <p>Không tìm thấy khách hàng</p>
            </EmptyState>
          )}
        </TableContainer>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.625rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SelectedInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const LoadingContainer = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th<{ width?: string }>`
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  ${props => props.width && `width: ${props.width};`}
`;

const Tr = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #1f2937;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CustomerName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const TierBadge = styled.span<{ tier: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.813rem;
  font-weight: 600;
  background: ${props => {
    switch (props.tier.toLowerCase()) {
      case 'new': return '#d1fae5';
      case 'regular': return '#f3f4f6';
      case 'loyal': return '#ede9fe';
      case 'vip': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.tier.toLowerCase()) {
      case 'new': return '#065f46';
      case 'regular': return '#374151';
      case 'loyal': return '#6b21a8';
      case 'vip': return '#92400e';
      default: return '#6b7280';
    }
  }};
  border: 1px solid ${props => {
    switch (props.tier.toLowerCase()) {
      case 'new': return '#10b981';
      case 'regular': return '#d1d5db';
      case 'loyal': return '#8b5cf6';
      case 'vip': return '#f59e0b';
      default: return '#e5e7eb';
    }
  }};
`;

const CustomerSegment = styled.span<{ segment: string }>`
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.segment.toLowerCase()) {
      case 'vip': return '#fef3c7';
      case 'loyal': return '#ede9fe';
      case 'regular': return '#f3f4f6';
      case 'new': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.segment.toLowerCase()) {
      case 'vip': return '#92400e';
      case 'loyal': return '#5b21b6';
      case 'regular': return '#374151';
      case 'new': return '#065f46';
      default: return '#6b7280';
    }
  }};
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.813rem;
`;

const OrderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
`;

const Amount = styled.div`
  font-weight: 600;
  color: #059669;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#d1fae5';
      case 'inactive': return '#f3f4f6';
      case 'blocked': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#065f46';
      case 'inactive': return '#374151';
      case 'blocked': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const DateText = styled.div`
  color: #6b7280;
  font-size: 0.813rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
`;

const ActionIcon = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const ActionsMenu = styled(motion.div).attrs({
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
})`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 180px;
`;

const MenuItem = styled.button<{ danger?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: ${props => props.danger ? '#dc2626' : '#374151'};
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${props => props.danger ? '#fee2e2' : '#f3f4f6'};
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #9ca3af;
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

export default CustomerTable;
