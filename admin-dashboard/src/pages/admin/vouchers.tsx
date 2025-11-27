import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import VoucherFormModal from '@/components/Admin/VoucherFormModal';
import { Voucher, VoucherType, VoucherStatus } from '@/models/voucher';
import { 
  FaPlus, FaEdit, FaTrash, FaPause, FaPlay, FaSearch, FaFilter,
  FaPercentage, FaDollarSign, FaShippingFast, FaCopy
} from 'react-icons/fa';

const VouchersPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [vouchers, searchTerm, statusFilter, typeFilter]);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVouchers(data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vouchers];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.code.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(v => v.type === typeFilter);
    }

    setFilteredVouchers(filtered);
  };

  const handleCreate = () => {
    setSelectedVoucher(null);
    setShowModal(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowModal(true);
  };

  const handleSave = async (data: Partial<Voucher>) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedVoucher
        ? `/api/admin/vouchers/${selectedVoucher.id}`
        : '/api/admin/vouchers';
      
      const method = selectedVoucher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await fetchVouchers();
        setShowModal(false);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchVouchers();
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      alert('Có lỗi xảy ra khi xóa voucher');
    }
  };

  const handleTogglePause = async (voucher: Voucher) => {
    try {
      const token = localStorage.getItem('token');
      const action = voucher.status === 'paused' ? 'resume' : 'pause';
      
      const response = await fetch(`/api/admin/vouchers/${voucher.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchVouchers();
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Đã copy mã voucher!');
  };

  const getStatusBadge = (status: VoucherStatus) => {
    const colors = {
      active: '#10b981',
      expired: '#ef4444',
      paused: '#6b7280',
      upcoming: '#3b82f6'
    };

    const labels = {
      active: 'Đang hoạt động',
      expired: 'Hết hạn',
      paused: 'Tạm dừng',
      upcoming: 'Sắp diễn ra'
    };

    return <StatusBadge color={colors[status]}>{labels[status]}</StatusBadge>;
  };

  const getTypeIcon = (type: VoucherType) => {
    switch (type) {
      case 'percentage':
        return <FaPercentage />;
      case 'fixed':
        return <FaDollarSign />;
      case 'freeship':
        return <FaShippingFast />;
    }
  };

  const formatValue = (voucher: Voucher) => {
    if (voucher.type === 'percentage') {
      const maxDiscountText = voucher.maxDiscount 
        ? ` (tối đa ${formatPrice(voucher.maxDiscount)})`
        : '';
      return `${voucher.value}%${maxDiscountText}`;
    }
    return formatPrice(voucher.value);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingMessage>Đang tải...</LoadingMessage>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>Quản Lý Voucher</Title>
            <Stats>
              <StatItem>
                <StatLabel>Tổng số:</StatLabel>
                <StatValue>{vouchers.length}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Đang hoạt động:</StatLabel>
                <StatValue color="#10b981">
                  {vouchers.filter(v => v.status === 'active').length}
                </StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Hết hạn:</StatLabel>
                <StatValue color="#ef4444">
                  {vouchers.filter(v => v.status === 'expired').length}
                </StatValue>
              </StatItem>
            </Stats>
          </HeaderLeft>
          <CreateButton onClick={handleCreate}>
            <FaPlus /> Tạo Voucher Mới
          </CreateButton>
        </Header>

        <Filters>
          <SearchBox>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="Tìm kiếm mã voucher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          <FilterGroup>
            <FilterLabel><FaFilter /> Lọc:</FilterLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="paused">Tạm dừng</option>
              <option value="expired">Hết hạn</option>
            </Select>

            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Tất cả loại</option>
              <option value="percentage">Phần trăm</option>
              <option value="fixed">Số tiền cố định</option>
              <option value="freeship">Miễn phí ship</option>
            </Select>
          </FilterGroup>
        </Filters>

        {filteredVouchers.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🎫</EmptyIcon>
            <EmptyText>
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Không tìm thấy voucher nào'
                : 'Chưa có voucher nào. Tạo voucher đầu tiên!'}
            </EmptyText>
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Mã Voucher</Th>
                <Th>Loại</Th>
                <Th>Giá Trị</Th>
                <Th>Thời Gian</Th>
                <Th>Sử Dụng</Th>
                <Th>Trạng Thái</Th>
                <Th>Thao Tác</Th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <Td>
                    <CodeCell>
                      <Code>{voucher.code}</Code>
                      <CopyButton onClick={() => copyCode(voucher.code)}>
                        <FaCopy />
                      </CopyButton>
                    </CodeCell>
                    {voucher.eventLabel && (
                      <EventLabel>{voucher.eventLabel}</EventLabel>
                    )}
                    {voucher.description && (
                      <Description>{voucher.description}</Description>
                    )}
                  </Td>
                  <Td>
                    <TypeBadge>
                      {getTypeIcon(voucher.type)}
                      {voucher.type === 'percentage' && 'Phần trăm'}
                      {voucher.type === 'fixed' && 'Cố định'}
                      {voucher.type === 'freeship' && 'Freeship'}
                    </TypeBadge>
                  </Td>
                  <Td>
                    <ValueText>{formatValue(voucher)}</ValueText>
                    {voucher.minOrderValue > 0 && (
                      <MinOrder>Đơn tối thiểu: {formatPrice(voucher.minOrderValue)}</MinOrder>
                    )}
                  </Td>
                  <Td>
                    <DateRange>
                      {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                    </DateRange>
                  </Td>
                  <Td>
                    <UsageText>
                      {voucher.currentUsage} / {voucher.maxUsageTotal}
                    </UsageText>
                    <UsageBar>
                      <UsageProgress 
                        width={(voucher.currentUsage / voucher.maxUsageTotal) * 100}
                      />
                    </UsageBar>
                  </Td>
                  <Td>{getStatusBadge(voucher.status)}</Td>
                  <Td>
                    <Actions>
                      <ActionButton 
                        onClick={() => handleEdit(voucher)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleTogglePause(voucher)}
                        title={voucher.status === 'paused' ? 'Khôi phục' : 'Tạm dừng'}
                        color={voucher.status === 'paused' ? '#10b981' : '#f59e0b'}
                      >
                        {voucher.status === 'paused' ? <FaPlay /> : <FaPause />}
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDelete(voucher.id)}
                        title="Xóa"
                        color="#ef4444"
                      >
                        <FaTrash />
                      </ActionButton>
                    </Actions>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {showModal && (
          <VoucherFormModal
            voucher={selectedVoucher}
            onClose={() => setShowModal(false)}
            onSave={handleSave}
          />
        )}
      </Container>
    </AdminLayout>
  );
};

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
`;

const Stats = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const StatValue = styled.span<{ color?: string }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.color || '#111827'};
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const Filters = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 14px;
  outline: none;
  color: #111827;

  &::placeholder {
    color: #9ca3af;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Select = styled.select`
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  color: #111827;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const Table = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  padding: 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #374151;
`;

const CodeCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Code = styled.span`
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 15px;
  color: #111827;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #3b82f6;
  }
`;

const EventLabel = styled.div`
  display: inline-block;
  margin-top: 4px;
  padding: 2px 8px;
  background: #fef3c7;
  color: #92400e;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
`;

const Description = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const TypeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
`;

const ValueText = styled.div`
  font-weight: 600;
  color: #111827;
`;

const MinOrder = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const DateRange = styled.div`
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
`;

const UsageText = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const UsageBar = styled.div`
  width: 100px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
`;

const UsageProgress = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background: #3b82f6;
  transition: width 0.3s;
`;

const StatusBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 6px 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ color?: string }>`
  padding: 8px;
  background: none;
  border: none;
  color: ${props => props.color || '#6b7280'};
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.color ? `${props.color}15` : '#f3f4f6'};
  }
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  font-size: 16px;
  color: #6b7280;
`;

export default VouchersPage;
