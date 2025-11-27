import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import OrderTable from '@/components/Admin/OrderTable';
import { Order } from '@/types/orders';
import {
  FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock,
  FiDownload, FiRefreshCw, FiX, FiSearch
} from 'react-icons/fi';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    revenue: 0
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        credentials: 'include'
      });

      const data = await res.json();
      if (data.success) {
        const ordersList = data.orders || data.data || [];
        setOrders(ordersList);
        calculateStats(ordersList);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate statistics
  const calculateStats = (ordersList: Order[]) => {
    const stats = {
      total: ordersList.length,
      pending: ordersList.filter(o => o.status === 'pending').length,
      confirmed: ordersList.filter(o => o.status === 'confirmed').length,
      processing: ordersList.filter(o => o.status === 'processing').length,
      shipped: ordersList.filter(o => o.status === 'shipping').length,
      delivered: ordersList.filter(o => o.status === 'delivered').length,
      cancelled: ordersList.filter(o => o.status === 'cancelled').length,
      revenue: ordersList.reduce((sum, o) => sum + o.total, 0)
    };
    setStats(stats);
  };

  // Filter orders - All filters work independently and together
  const filteredOrders = orders.filter(order => {
    // Filter 1: Status filter
    const matchesFilter = filter === 'all' || order.status === filter;

    // Filter 2: Search filter
    const matchesSearch = !searchTerm ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.phone.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter 3 & 4: Date range filters
    const orderDate = new Date(order.createdAt);
    const matchesStartDate = !dateRange.start || orderDate >= new Date(dateRange.start);
    const matchesEndDate = !dateRange.end || orderDate <= new Date(dateRange.end + 'T23:59:59');

    // All filters must match (AND logic)
    return matchesFilter && matchesSearch && matchesStartDate && matchesEndDate;
  });

  // Handle status change
  const handleStatusChange = useCallback(async (orderId: string, newStatus: string, note?: string) => {
    console.log('🔄 Updating order status:', { orderId, newStatus, note });

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: newStatus,
          note: note
        })
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        alert(`Lỗi: ${data.error || data.message || 'Không thể cập nhật trạng thái'}`);
        return;
      }

      if (data.success) {
        console.log('✅ Status updated successfully');
        await fetchOrders();
        alert('Cập nhật trạng thái thành công!');
      } else {
        console.error('❌ Update failed:', data);
        alert(`Lỗi: ${data.error || 'Không thể cập nhật trạng thái'}`);
      }
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Lỗi khi cập nhật trạng thái đơn hàng. Vui lòng kiểm tra console.');
    }
  }, [fetchOrders]);

  // Clear filters
  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
  };

  // Export orders
  const exportOrders = () => {
    const csv = [
      ['Order ID', 'Customer', 'Total', 'Status', 'Date'].join(','),
      ...filteredOrders.map(o => [
        o.orderNumber,
        o.shippingAddress.fullName,
        o.total,
        o.status,
        new Date(o.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>Quản lý đơn hàng</Title>
          <Actions>
            <ActionButton onClick={fetchOrders} disabled={loading}>
              <FiRefreshCw /> {loading ? 'Đang tải...' : 'Làm mới'}
            </ActionButton>
            <ActionButton onClick={exportOrders}>
              <FiDownload /> Xuất Excel
            </ActionButton>
            <ActionButton onClick={clearFilters}>
              <FiX /> Xóa bộ lọc
            </ActionButton>
          </Actions>
        </Header>

        {/* Statistics */}
        <StatsGrid>
          <StatCard>
            <StatIcon color="#3b82f6"><FiPackage /></StatIcon>
            <StatInfo>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Tổng đơn hàng</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon color="#f59e0b"><FiClock /></StatIcon>
            <StatInfo>
              <StatValue>{stats.pending}</StatValue>
              <StatLabel>Chờ xử lý</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon color="#8b5cf6"><FiTruck /></StatIcon>
            <StatInfo>
              <StatValue>{stats.processing + stats.shipped}</StatValue>
              <StatLabel>Đang giao</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon color="#10b981"><FiCheckCircle /></StatIcon>
            <StatInfo>
              <StatValue>{stats.delivered}</StatValue>
              <StatLabel>Hoàn thành</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon color="#ef4444"><FiXCircle /></StatIcon>
            <StatInfo>
              <StatValue>{stats.cancelled}</StatValue>
              <StatLabel>Đã hủy</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        {/* Filters */}
        <FiltersBar>
          <FiltersRow>
            <SearchBox>
              <FiSearch />
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>

            <DateFilters>
              <DateInput>
                <label>Từ ngày:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </DateInput>

              <DateInput>
                <label>Đến ngày:</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </DateInput>
            </DateFilters>
          </FiltersRow>

          <FilterButtons>
            <FilterButton $active={filter === 'all'} onClick={() => setFilter('all')}>
              Tất cả ({stats.total})
            </FilterButton>
            <FilterButton $active={filter === 'pending'} onClick={() => setFilter('pending')}>
              Chờ xử lý ({stats.pending})
            </FilterButton>
            <FilterButton $active={filter === 'confirmed'} onClick={() => setFilter('confirmed')}>
              Đã xác nhận ({stats.confirmed})
            </FilterButton>
            <FilterButton $active={filter === 'processing'} onClick={() => setFilter('processing')}>
              Chuẩn bị hàng ({stats.processing})
            </FilterButton>
            <FilterButton $active={filter === 'shipping'} onClick={() => setFilter('shipping')}>
              Đang giao ({stats.shipped})
            </FilterButton>
            <FilterButton $active={filter === 'delivered'} onClick={() => setFilter('delivered')}>
              Hoàn thành ({stats.delivered})
            </FilterButton>
            <FilterButton $active={filter === 'cancelled'} onClick={() => setFilter('cancelled')}>
              Đã hủy ({stats.cancelled})
            </FilterButton>
          </FilterButtons>
        </FiltersBar>

        {/* Orders Table */}
        {loading ? (
          <LoadingState>
            <FiRefreshCw className="spin" size={48} />
            <p>Đang tải đơn hàng...</p>
          </LoadingState>
        ) : filteredOrders.length > 0 ? (
          <OrderTable
            orders={filteredOrders}
            onRefresh={fetchOrders}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <EmptyState>
            <FiPackage size={64} />
            <h3>Không có đơn hàng nào</h3>
            <p>Chưa có đơn hàng nào trong hệ thống</p>
          </EmptyState>
        )}
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f7fafc;
    border-color: #cbd5e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div) <{ highlight?: boolean }>`
  background: ${props => props.highlight ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${props => props.highlight ? 'white' : 'inherit'};
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.8;
`;

const FiltersBar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border-radius: 8px;
  flex: 1;
  min-width: 250px;

  svg {
    color: #718096;
  }

  input {
    flex: 1;
    border: none;
    background: none;
    font-size: 1rem;
    outline: none;

    &::placeholder {
      color: #a0aec0;
    }
  }
`;

const DateFilters = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DateInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
  }

  input[type="date"] {
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e2e8f0'};
  background: ${props => props.$active ? '#3b82f6' : 'white'};
  color: ${props => props.$active ? 'white' : '#4a5568'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: ${props => props.$active ? '#2563eb' : '#eff6ff'};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;

  .spin {
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;

  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #4a5568;
  }
`;

export default OrdersPage;
