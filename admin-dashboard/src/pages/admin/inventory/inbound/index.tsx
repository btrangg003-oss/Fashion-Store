import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { StockMovement } from '@/models/inventory';

const InboundListPage = () => {
  const router = useRouter();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadMovements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, searchTerm, statusFilter, typeFilter, dateFrom, dateTo]);

  const loadMovements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/movements?type=inbound', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(m => m.subType === typeFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(m => new Date(m.receiptDate) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(m => new Date(m.receiptDate) <= new Date(dateTo));
    }

    setFilteredMovements(filtered);
  };

  const handleView = (id: string) => {
    router.push(`/admin/inventory/inbound/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/inventory/inbound/${id}?mode=edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/movements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Xóa phiếu thành công!');
        loadMovements();
      } else {
        alert('Không thể xóa phiếu này');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: '📝 Nháp', color: '#6b7280', bg: '#f3f4f6' },
      pending: { label: '⏳ Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
      approved: { label: '✅ Đã duyệt', color: '#059669', bg: '#d1fae5' },
      completed: { label: '✔️ Hoàn thành', color: '#2563eb', bg: '#dbeafe' }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      new_stock: { label: '📦 Nhập mới', color: '#3b82f6' },
      return: { label: '↩️ Hoàn hàng', color: '#10b981' },
      adjustment: { label: '🔧 Điều chỉnh', color: '#f59e0b' }
    };
    return badges[type as keyof typeof badges] || badges.new_stock;
  };

  // Calculate statistics
  const stats = {
    total: filteredMovements.length,
    draft: filteredMovements.filter(m => m.status === 'draft').length,
    pending: filteredMovements.filter(m => m.status === 'pending').length,
    approved: filteredMovements.filter(m => m.status === 'approved').length,
    totalValue: filteredMovements.reduce((sum, m) => sum + (m.finalTotal || 0), 0)
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>⬇️ Danh Sách Phiếu Nhập Kho</Title>
          <HeaderActions>
            <ExportButton onClick={() => alert('Xuất Excel')}>
              <FiDownload /> Xuất Excel
            </ExportButton>
            <CreateButton onClick={() => router.push('/admin/inventory/inbound/create')}>
              <FiPlus /> Tạo phiếu nhập
            </CreateButton>
          </HeaderActions>
        </Header>

        {/* Statistics */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Tổng phiếu</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Nháp</StatLabel>
            <StatValue color="#6b7280">{stats.draft}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Chờ duyệt</StatLabel>
            <StatValue color="#d97706">{stats.pending}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Đã duyệt</StatLabel>
            <StatValue color="#059669">{stats.approved}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Tổng giá trị</StatLabel>
            <StatValue color="#3b82f6">{stats.totalValue.toLocaleString()}₫</StatValue>
          </StatCard>
        </StatsGrid>

        {/* Filters */}
        <FiltersCard>
          <FiltersRow>
            <SearchBox>
              <FiSearch />
              <SearchInput
                type="text"
                placeholder="Tìm theo mã phiếu, NCC, số hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>

            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">📝 Nháp</option>
              <option value="pending">⏳ Chờ duyệt</option>
              <option value="approved">✅ Đã duyệt</option>
              <option value="completed">✔️ Hoàn thành</option>
            </FilterSelect>

            <FilterSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Tất cả loại</option>
              <option value="new_stock">📦 Nhập mới</option>
              <option value="return">↩️ Hoàn hàng</option>
              <option value="adjustment">🔧 Điều chỉnh</option>
            </FilterSelect>

            <DateInput
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Từ ngày"
            />

            <DateInput
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Đến ngày"
            />
          </FiltersRow>
        </FiltersCard>

        {/* Table */}
        <TableCard>
          {loading ? (
            <LoadingState>Đang tải...</LoadingState>
          ) : filteredMovements.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📦</EmptyIcon>
              <EmptyText>Chưa có phiếu nhập kho nào</EmptyText>
              <CreateButton onClick={() => router.push('/admin/inventory/inbound/create')}>
                <FiPlus /> Tạo phiếu đầu tiên
              </CreateButton>
            </EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Mã phiếu</Th>
                  <Th>Ngày nhập</Th>
                  <Th>Loại</Th>
                  <Th>Nhà cung cấp</Th>
                  <Th>Nhân viên</Th>
                  <Th>Số lượng</Th>
                  <Th>Tổng tiền</Th>
                  <Th>Trạng thái</Th>
                  <Th>Ghi chú</Th>
                  <Th>Thao tác</Th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => {
                  const statusBadge = getStatusBadge(movement.status);
                  const typeBadge = getTypeBadge(movement.subType || 'new_stock');

                  return (
                    <tr key={movement.id}>
                      <Td>
                        <ReceiptNumber>{movement.receiptNumber}</ReceiptNumber>
                      </Td>
                      <Td>
                        {new Date(movement.receiptDate).toLocaleDateString('vi-VN')}
                      </Td>
                      <Td>
                        <TypeBadge color={typeBadge.color}>
                          {typeBadge.label}
                        </TypeBadge>
                      </Td>
                      <Td>{movement.supplierName || '-'}</Td>
                      <Td>
                        <StaffName>{movement.createdBy || 'Admin'}</StaffName>
                      </Td>
                      <Td>
                        <QuantityBadge>{movement.totalItems || movement.items?.length || 0} SP</QuantityBadge>
                      </Td>
                      <Td>
                        <Price>{(movement.finalTotal || 0).toLocaleString()}₫</Price>
                      </Td>
                      <Td>
                        <StatusBadge color={statusBadge.color} bg={statusBadge.bg}>
                          {statusBadge.label}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <NoteText>{movement.notes || '-'}</NoteText>
                      </Td>
                      <Td>
                        <Actions>
                          <ActionButton
                            onClick={() => handleView(movement.id)}
                            title="Xem chi tiết"
                          >
                            <FiEye />
                          </ActionButton>
                          {movement.status === 'draft' && (
                            <>
                              <ActionButton
                                onClick={() => handleEdit(movement.id)}
                                title="Chỉnh sửa"
                              >
                                <FiEdit />
                              </ActionButton>
                              <ActionButton
                                onClick={() => handleDelete(movement.id)}
                                title="Xóa"
                                danger
                              >
                                <FiTrash2 />
                              </ActionButton>
                            </>
                          )}
                          <ActionButton
                            onClick={() => window.print()}
                            title="In phiếu"
                          >
                            📄
                          </ActionButton>
                          <ActionButton
                            onClick={() => alert('Tải file')}
                            title="Tải file"
                          >
                            <FiDownload />
                          </ActionButton>
                        </Actions>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TableCard>
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CreateButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const ExportButton = styled(Button)`
  background: #10b981;
  color: white;
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;
`;
const StatCard = styled.div`
  background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;
const StatLabel = styled.div`font-size: 13px; color: #6b7280; margin-bottom: 8px;`;
const StatValue = styled.div<{ color?: string }>`
  font-size: 24px; font-weight: 700; color: ${props => props.color || '#111827'};
`;

const FiltersCard = styled.div`
  background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); margin-bottom: 24px;
`;
const FiltersRow = styled.div`
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 12px;
  @media (max-width: 1024px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid #d1d5db;
  border-radius: 8px; background: white;
  svg { color: #6b7280; }
`;
const SearchInput = styled.input`
  flex: 1; border: none; font-size: 14px; outline: none;
`;
const FilterSelect = styled.select`
  padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;
  background: white; cursor: pointer;
  &:focus { outline: none; border-color: #3b82f6; }
`;
const DateInput = styled.input`
  padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;
  &:focus { outline: none; border-color: #3b82f6; }
`;

const TableCard = styled.div`
  background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden;
`;
const Table = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  text-align: left; padding: 16px; background: #f9fafb; font-size: 13px; font-weight: 600;
  color: #6b7280; border-bottom: 2px solid #e5e7eb;
`;
const Td = styled.td`padding: 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;`;
const ReceiptNumber = styled.code`
  padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 13px;
  font-family: 'Courier New', monospace; color: #3b82f6; font-weight: 600;
`;
const TypeBadge = styled.span<{ color: string }>`
  padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
  background: ${props => props.color}15; color: ${props => props.color};
`;
const StaffName = styled.span`
  font-size: 13px; color: #374151; font-weight: 500;
`;
const QuantityBadge = styled.span`
  padding: 4px 10px; background: #eff6ff; color: #3b82f6; border-radius: 6px;
  font-size: 12px; font-weight: 600;
`;
const Price = styled.span`font-weight: 600; color: #111827;`;
const StatusBadge = styled.span<{ color: string; bg: string }>`
  padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
  background: ${props => props.bg}; color: ${props => props.color};
`;
const NoteText = styled.span`
  font-size: 12px; color: #6b7280; max-width: 150px; 
  display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;
const Actions = styled.div`display: flex; gap: 8px; flex-wrap: wrap;`;
const ActionButton = styled.button<{ danger?: boolean }>`
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: ${props => props.danger ? '#fef2f2' : '#f3f4f6'}; 
  color: ${props => props.danger ? '#ef4444' : '#6b7280'};
  border: none; border-radius: 6px; cursor: pointer; font-size: 14px;
  &:hover { background: ${props => props.danger ? '#fee2e2' : '#e5e7eb'}; }
`;

const LoadingState = styled.div`
  padding: 60px; text-align: center; color: #6b7280; font-size: 16px;
`;
const EmptyState = styled.div`
  padding: 60px; text-align: center;
`;
const EmptyIcon = styled.div`font-size: 64px; margin-bottom: 16px;`;
const EmptyText = styled.p`font-size: 16px; color: #6b7280; margin-bottom: 24px;`;

export default InboundListPage;
