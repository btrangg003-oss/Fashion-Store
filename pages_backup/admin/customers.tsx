import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import CustomerManagement from '@/components/Admin/CustomerManagement';
import { FiUsers, FiUserPlus, FiDollarSign, FiShoppingBag, FiTrendingUp, FiDownload } from 'react-icons/fi';

const CustomersPage = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    newThisMonth: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    repeatCustomers: 0
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [segment, setSegment] = useState('all');

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (searchTerm) params.append('search', searchTerm);
      if (segment !== 'all') params.append('segment', segment);

      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm, segment]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const exportCustomers = async () => {
    try {
      const res = await fetch('/api/admin/export/customers');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString()}.csv`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>Quản lý khách hàng</Title>
          <ActionButton onClick={exportCustomers}>
            <FiDownload /> Xuất dữ liệu
          </ActionButton>
        </Header>

        <StatsGrid>
          <StatCard color="#3498db">
            <StatIcon><FiUsers /></StatIcon>
            <StatInfo>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Tổng khách hàng</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard color="#27ae60">
            <StatIcon><FiUserPlus /></StatIcon>
            <StatInfo>
              <StatValue>{stats.newThisMonth}</StatValue>
              <StatLabel>Khách mới tháng này</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard color="#f39c12">
            <StatIcon><FiDollarSign /></StatIcon>
            <StatInfo>
              <StatValue>{stats.totalRevenue.toLocaleString('vi-VN')}đ</StatValue>
              <StatLabel>Tổng doanh thu</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard color="#9b59b6">
            <StatIcon><FiShoppingBag /></StatIcon>
            <StatInfo>
              <StatValue>{stats.avgOrderValue.toLocaleString('vi-VN')}đ</StatValue>
              <StatLabel>Giá trị đơn TB</StatLabel>
            </StatInfo>
          </StatCard>

          <StatCard color="#e74c3c">
            <StatIcon><FiTrendingUp /></StatIcon>
            <StatInfo>
              <StatValue>{stats.repeatCustomers}</StatValue>
              <StatLabel>Khách quay lại</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        <FilterSection>
          <FilterGroup>
            <FilterLabel>Phân khúc:</FilterLabel>
            <Select value={segment} onChange={(e) => setSegment(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="vip">VIP (&gt;10tr)</option>
              <option value="regular">Thường xuyên (5-10tr)</option>
              <option value="new">Khách mới</option>
              <option value="inactive">Không hoạt động</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Lọc theo:</FilterLabel>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="verified">Đã xác thực</option>
              <option value="unverified">Chưa xác thực</option>
              <option value="active">Hoạt động</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Tìm kiếm:</FilterLabel>
            <SearchInput
              type="text"
              placeholder="Tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterGroup>
        </FilterSection>

        <CustomerManagement
          customers={customers}
          onCustomerUpdate={async (id: string, updates: any) => {
            try {
              await fetch(`/api/admin/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              });
              await fetchCustomers();
            } catch (error) {
              console.error('Error updating customer:', error);
            }
          }}
          onCustomerDelete={async (id: string) => {
            try {
              await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
              await fetchCustomers();
            } catch (error) {
              console.error('Error deleting customer:', error);
            }
          }}
          onBulkAction={async (action: string, ids: string[]) => {
            try {
              await fetch('/api/admin/customers/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids })
              });
              await fetchCustomers();
            } catch (error) {
              console.error('Error bulk action:', error);
            }
          }}
        />
      </Container>
    </ResponsiveAdminLayout>
  );
};

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;

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
  color: #2c3e50;
  margin: 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s;

  &:hover {
    background: #2980b9;
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div) <{ color: string }>`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid ${props => props.color};
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: #3498db;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #2c3e50;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.25rem;
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

export default CustomersPage;
