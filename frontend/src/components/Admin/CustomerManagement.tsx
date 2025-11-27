import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, FiPhone, FiSearch,
  FiDownload, FiFilter, FiUserPlus, FiTrendingUp, FiTrendingDown,
  FiCalendar, FiShoppingBag, FiEye, FiEdit3, FiTrash2
} from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  addresses: Address[];
  orders: CustomerOrder[];
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'blocked';
  tags: string[];
  notes?: string;
}

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: string;
  itemCount: number;
}

interface CustomerManagementProps {
  customers: Customer[];
  onCustomerUpdate: (id: string, updates: Partial<Customer>) => Promise<void>;
  onCustomerDelete: (id: string) => Promise<void>;
  onBulkAction: (action: string, customerIds: string[]) => Promise<void>;
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

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          border-color: #3182ce;
          background: #3182ce;
          color: white;
          
          &:hover {
            background: #2c5aa0;
            border-color: #2c5aa0;
          }
        `;
      case 'danger':
        return `
          border-color: #e53e3e;
          background: #e53e3e;
          color: white;
          
          &:hover {
            background: #c53030;
            border-color: #c53030;
          }
        `;
      default:
        return `
          border-color: #e2e8f0;
          background: white;
          color: #4a5568;
          
          &:hover {
            border-color: #cbd5e0;
            background: #f7fafc;
          }
        `;
    }
  }}
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const StatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const StatLabel = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatChange = styled.span<{ positive?: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CustomerGrid = styled.div`
  display: grid;
  gap: 1rem;
  padding: 1.5rem;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
`;

const CustomerCard = styled(motion.div)`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CustomerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const CustomerAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.125rem;
`;

const CustomerInfo = styled.div`
  flex: 1;
  margin-left: 1rem;
  min-width: 0;
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
`;

const CustomerEmail = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' | 'blocked' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'inactive':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'blocked':
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const CustomerDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  text-align: center;
`;

const DetailLabel = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 0.875rem;
`;

const CustomerMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const CustomerTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background: #e0e7ff;
  color: #3730a3;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const CustomerActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ variant?: 'edit' | 'delete' | 'view' }>`
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
      case 'view':
        return `
          background: #e0f2fe;
          color: #0891b2;
          
          &:hover {
            background: #bae6fd;
          }
        `;
      case 'edit':
        return `
          background: #ebf8ff;
          color: #3182ce;
          
          &:hover {
            background: #bee3f8;
          }
        `;
      case 'delete':
        return `
          background: #fed7d7;
          color: #e53e3e;
          
          &:hover {
            background: #feb2b2;
          }
        `;
      default:
        return `
          background: #f7fafc;
          color: #4a5568;
          
          &:hover {
            background: #edf2f7;
          }
        `;
    }
  }}
`;

const LastOrder = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
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

const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  onCustomerUpdate,
  onCustomerDelete,
  onBulkAction,
  loading = false
}) => {
  const { success, error } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  // // const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || 
           customer.email.toLowerCase().includes(query) ||
           (customer.phone && customer.phone.includes(query));
  });

  // Calculate stats
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length || 0
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getCustomerInitials = (customer: Customer) => {
    return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusText = (status: 'active' | 'inactive' | 'blocked') => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'blocked': return 'Bị chặn';
      default: return status;
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Quản lý khách hàng</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm khách hàng..."
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
            Xuất
          </ActionButton>
          
          <ActionButton>
            <FiFilter size={16} />
            Bộ lọc
          </ActionButton>
          
          <ActionButton variant="primary">
            <FiUserPlus size={16} />
            Thêm khách hàng
          </ActionButton>
        </HeaderRight>
      </Header>

      <StatsBar>
        <StatCard>
          <StatLabel>Tổng khách hàng</StatLabel>
          <StatValue>
            {stats.totalCustomers.toLocaleString()}
            <StatChange positive>
              <FiTrendingUp size={14} />
              +12%
            </StatChange>
          </StatValue>
        </StatCard>
        
        <StatCard>
          <StatLabel>Khách hàng hoạt động</StatLabel>
          <StatValue>
            {stats.activeCustomers.toLocaleString()}
            <StatChange positive>
              <FiTrendingUp size={14} />
              +8%
            </StatChange>
          </StatValue>
        </StatCard>
        
        <StatCard>
          <StatLabel>Tổng doanh thu</StatLabel>
          <StatValue>
            {formatPrice(stats.totalRevenue)}
            <StatChange positive>
              <FiTrendingUp size={14} />
              +15%
            </StatChange>
          </StatValue>
        </StatCard>
        
        <StatCard>
          <StatLabel>Giá trị đơn hàng TB</StatLabel>
          <StatValue>
            {formatPrice(stats.averageOrderValue)}
            <StatChange>
              <FiTrendingDown size={14} />
              -3%
            </StatChange>
          </StatValue>
        </StatCard>
      </StatsBar>

      <CustomerGrid>
        {filteredCustomers.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FiUsers size={24} />
            </EmptyIcon>
            <div>Không tìm thấy khách hàng nào</div>
          </EmptyState>
        ) : (
          filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CustomerHeader>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CustomerAvatar>
                    {getCustomerInitials(customer)}
                  </CustomerAvatar>
                  <CustomerInfo>
                    <CustomerName>
                      {customer.firstName} {customer.lastName}
                    </CustomerName>
                    <CustomerEmail>{customer.email}</CustomerEmail>
                  </CustomerInfo>
                </div>
                <StatusBadge status={customer.status}>
                  {getStatusText(customer.status)}
                </StatusBadge>
              </CustomerHeader>

              <CustomerDetails>
                <DetailItem>
                  <DetailLabel>Đơn hàng</DetailLabel>
                  <DetailValue>{customer.totalOrders}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Tổng chi tiêu</DetailLabel>
                  <DetailValue>{formatPrice(customer.totalSpent)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Đơn hàng TB</DetailLabel>
                  <DetailValue>{formatPrice(customer.averageOrderValue)}</DetailValue>
                </DetailItem>
              </CustomerDetails>

              <CustomerMeta>
                {customer.phone && (
                  <MetaItem>
                    <FiPhone size={14} />
                    {customer.phone}
                  </MetaItem>
                )}
                <MetaItem>
                  <FiCalendar size={14} />
                  Tham gia: {formatDate(customer.createdAt)}
                </MetaItem>
                {customer.lastOrderDate && (
                  <MetaItem>
                    <FiShoppingBag size={14} />
                    Đơn cuối: {formatDate(customer.lastOrderDate)}
                  </MetaItem>
                )}
              </CustomerMeta>

              {customer.tags && customer.tags.length > 0 && (
                <CustomerTags>
                  {customer.tags.slice(0, 3).map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                  {customer.tags.length > 3 && (
                    <Tag>+{customer.tags.length - 3}</Tag>
                  )}
                </CustomerTags>
              )}

              <CustomerActions>
                <LastOrder>
                  {customer.lastOrderDate 
                    ? `Đơn cuối: ${formatDate(customer.lastOrderDate)}`
                    : 'Chưa có đơn hàng'
                  }
                </LastOrder>
                
                <ActionButtons>
                  <IconButton variant="view">
                    <FiEye size={14} />
                  </IconButton>
                  <IconButton variant="edit">
                    <FiEdit3 size={14} />
                  </IconButton>
                  <IconButton 
                    variant="delete"
                    onClick={() => onCustomerDelete(customer.id)}
                  >
                    <FiTrash2 size={14} />
                  </IconButton>
                </ActionButtons>
              </CustomerActions>
            </CustomerCard>
          ))
        )}
      </CustomerGrid>
    </Container>
  );
};

export default CustomerManagement;