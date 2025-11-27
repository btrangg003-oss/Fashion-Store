import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { 
  FiActivity, FiUser, FiPackage, FiShoppingCart, 
  FiSettings, FiFilter, FiDownload, FiSearch 
} from 'react-icons/fi';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    fetchLogs();
  }, [dateRange]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/admin/activity-log?range=${dateRange}`);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/admin/activity-log/export?range=${dateRange}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${dateRange}.csv`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.entity !== filter) return false;
    if (searchTerm && !log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !log.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getIcon = (entity: string) => {
    switch (entity) {
      case 'user': return <FiUser />;
      case 'product': return <FiPackage />;
      case 'order': return <FiShoppingCart />;
      case 'settings': return <FiSettings />;
      default: return <FiActivity />;
    }
  };

  const getColor = (action: string) => {
    if (action.includes('create')) return '#10b981';
    if (action.includes('update')) return '#3b82f6';
    if (action.includes('delete')) return '#ef4444';
    return '#6b7280';
  };

  if (loading) return <ResponsiveAdminLayout><Loading>Đang tải...</Loading></ResponsiveAdminLayout>;

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>
            <FiActivity /> Nhật Ký Hoạt Động
          </Title>
          <Actions>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="day">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="all">Tất cả</option>
            </Select>
            <ExportButton onClick={handleExport}>
              <FiDownload /> Xuất CSV
            </ExportButton>
          </Actions>
        </Header>

        <Filters>
          <SearchBox>
            <FiSearch />
            <SearchInput
              placeholder="Tìm kiếm hoạt động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          <FilterButtons>
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
              Tất cả
            </FilterButton>
            <FilterButton active={filter === 'user'} onClick={() => setFilter('user')}>
              Người dùng
            </FilterButton>
            <FilterButton active={filter === 'product'} onClick={() => setFilter('product')}>
              Sản phẩm
            </FilterButton>
            <FilterButton active={filter === 'order'} onClick={() => setFilter('order')}>
              Đơn hàng
            </FilterButton>
            <FilterButton active={filter === 'settings'} onClick={() => setFilter('settings')}>
              Cài đặt
            </FilterButton>
          </FilterButtons>
        </Filters>

        <LogsList>
          {filteredLogs.map((log, index) => (
            <LogCard
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LogIcon color={getColor(log.action)}>
                {getIcon(log.entity)}
              </LogIcon>

              <LogContent>
                <LogHeader>
                  <LogUser>{log.userName}</LogUser>
                  <LogAction color={getColor(log.action)}>{log.action}</LogAction>
                </LogHeader>
                <LogDetails>{log.details}</LogDetails>
                <LogMeta>
                  <LogTime>{new Date(log.timestamp).toLocaleString('vi-VN')}</LogTime>
                  <LogIP>IP: {log.ipAddress}</LogIP>
                </LogMeta>
              </LogContent>
            </LogCard>
          ))}

          {filteredLogs.length === 0 && (
            <EmptyState>
              <FiActivity size={48} />
              <EmptyText>Không có hoạt động nào</EmptyText>
            </EmptyState>
          )}
        </LogsList>

        <Stats>
          <StatCard>
            <StatLabel>Tổng hoạt động</StatLabel>
            <StatValue>{logs.length}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Hôm nay</StatLabel>
            <StatValue>
              {logs.filter(l => {
                const today = new Date().toDateString();
                return new Date(l.timestamp).toDateString() === today;
              }).length}
            </StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Người dùng hoạt động</StatLabel>
            <StatValue>
              {new Set(logs.map(l => l.userId)).size}
            </StatValue>
          </StatCard>
        </Stats>
      </Container>
    </ResponsiveAdminLayout>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
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
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const Filters = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: 1px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
`;

const LogsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const LogCard = styled(motion.div)`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const LogIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const LogContent = styled.div`
  flex: 1;
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const LogUser = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const LogAction = styled.span<{ color: string }>`
  padding: 0.25rem 0.75rem;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const LogDetails = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const LogMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
`;

const LogTime = styled.span``;
const LogIP = styled.span``;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
`;

const EmptyText = styled.p`
  margin-top: 1rem;
  font-size: 1.125rem;
  color: #6b7280;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;
