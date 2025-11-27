import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import VoucherFormModal from '@/components/Admin/VoucherFormModal';
import { useAuth } from '@/contexts/AuthContext';
import { Voucher } from '@/models/voucher';
import {
  FiPercent, FiTarget, FiPlus, FiEdit2, FiTrash2, FiPause, FiPlay, FiCopy
} from 'react-icons/fi';

const AdminMarketing = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    loadVouchers();
  }, [user, loading, router]);

  const loadVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVouchers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
    }
  };

  const handleSaveVoucher = async (data: Partial<Voucher>) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingVoucher
        ? `/api/admin/vouchers/${editingVoucher.id}`
        : '/api/admin/vouchers';
      
      const method = editingVoucher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        await loadVouchers();
        setShowVoucherModal(false);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
      throw error;
    }
  };

  const handleDeleteVoucher = async (id: string) => {
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
        await loadVouchers();
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
        await loadVouchers();
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const stats = {
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter(v => v.status === 'active').length,
    totalUsage: vouchers.reduce((sum, v) => sum + v.currentUsage, 0)
  };

  if (loading) return <LoadingContainer>Đang tải...</LoadingContainer>;
  if (!user) return null;

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>
              <FiTarget />
              Marketing & Khuyến Mãi
            </Title>
            <Subtitle>Quản lý chiến dịch marketing và mã giảm giá</Subtitle>
          </HeaderLeft>
          <Actions>
            <PrimaryButton onClick={() => {
              setEditingVoucher(null);
              setShowVoucherModal(true);
            }}>
              <FiPlus /> Tạo Mã Giảm Giá
            </PrimaryButton>
          </Actions>
        </Header>

        <StatsGrid>
          <StatCard onClick={() => router.push('/admin/campaigns')} style={{ cursor: 'pointer' }}>
            <StatIcon color="#3b82f6">
              <FiTarget />
            </StatIcon>
            <StatContent>
              <StatLabel>Chiến dịch</StatLabel>
              <StatValue>Xem tất cả →</StatValue>
              <StatSubtext>Click để quản lý</StatSubtext>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#10b981">
              <FiPercent />
            </StatIcon>
            <StatContent>
              <StatLabel>Mã giảm giá</StatLabel>
              <StatValue>{stats.activeVouchers}/{stats.totalVouchers}</StatValue>
              <StatSubtext>Đang hoạt động</StatSubtext>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#f59e0b">
              <FiCopy />
            </StatIcon>
            <StatContent>
              <StatLabel>Lượt sử dụng</StatLabel>
              <StatValue>{stats.totalUsage}</StatValue>
              <StatSubtext>Tổng cộng</StatSubtext>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <TabsContainer>
          <Tab active={false} onClick={() => router.push('/admin/campaigns')}>
            <FiTarget /> Chiến dịch
          </Tab>
          <Tab active={true}>
            <FiPercent /> Mã giảm giá ({vouchers.length})
          </Tab>
        </TabsContainer>

        <VouchersSection>
          <SectionHeader>
            <SectionTitle>Danh sách mã giảm giá</SectionTitle>
          </SectionHeader>

          <VouchersTable>
            <thead>
              <tr>
                <Th>Mã</Th>
                <Th>Loại</Th>
                <Th>Giá trị</Th>
                <Th>Sử dụng</Th>
                <Th>Thời gian</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(voucher => (
                <VoucherRow key={voucher.id}>
                  <Td>
                    <VoucherCode>{voucher.code}</VoucherCode>
                    {voucher.eventLabel && (
                      <EventLabel>{voucher.eventLabel}</EventLabel>
                    )}
                  </Td>
                  <Td>
                    <TypeBadge type={voucher.type}>
                      {voucher.type === 'percentage' && 'Phần trăm'}
                      {voucher.type === 'fixed' && 'Số tiền'}
                      {voucher.type === 'freeship' && 'Freeship'}
                    </TypeBadge>
                  </Td>
                  <Td>
                    <VoucherValue>
                      {voucher.type === 'percentage' && `${voucher.value}%`}
                      {voucher.type === 'fixed' && `${voucher.value.toLocaleString('vi-VN')} ₫`}
                      {voucher.type === 'freeship' && 'Miễn phí ship'}
                    </VoucherValue>
                    {voucher.maxDiscount && (
                      <MaxDiscount>Tối đa: {voucher.maxDiscount.toLocaleString('vi-VN')} ₫</MaxDiscount>
                    )}
                  </Td>
                  <Td>
                    <UsageText>
                      {voucher.currentUsage} / {voucher.maxUsageTotal}
                    </UsageText>
                  </Td>
                  <Td>
                    <DateText>
                      {new Date(voucher.startDate).toLocaleDateString('vi-VN')} -<br/>
                      {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                    </DateText>
                  </Td>
                  <Td>
                    <StatusBadge status={voucher.status}>
                      {voucher.status === 'active' && 'Hoạt động'}
                      {voucher.status === 'paused' && 'Tạm dừng'}
                      {voucher.status === 'expired' && 'Hết hạn'}
                      {voucher.status === 'upcoming' && 'Sắp diễn ra'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButtons>
                      <IconButton onClick={() => {
                        setEditingVoucher(voucher);
                        setShowVoucherModal(true);
                      }}>
                        <FiEdit2 />
                      </IconButton>
                      {voucher.status === 'active' && (
                        <IconButton onClick={() => handleTogglePause(voucher)}>
                          <FiPause />
                        </IconButton>
                      )}
                      {voucher.status === 'paused' && (
                        <IconButton onClick={() => handleTogglePause(voucher)}>
                          <FiPlay />
                        </IconButton>
                      )}
                      <IconButton danger onClick={() => handleDeleteVoucher(voucher.id)}>
                        <FiTrash2 />
                      </IconButton>
                    </ActionButtons>
                  </Td>
                </VoucherRow>
              ))}
            </tbody>
          </VouchersTable>

          {vouchers.length === 0 && (
            <EmptyState>
              <FiPercent size={64} />
              <h3>Chưa có mã giảm giá nào</h3>
              <p>Tạo mã giảm giá để thu hút khách hàng</p>
              <PrimaryButton onClick={() => {
                setEditingVoucher(null);
                setShowVoucherModal(true);
              }}>
                <FiPlus /> Tạo mã giảm giá
              </PrimaryButton>
            </EmptyState>
          )}
        </VouchersSection>

        {showVoucherModal && (
          <VoucherFormModal
            voucher={editingVoucher}
            onClose={() => setShowVoucherModal(false)}
            onSave={handleSaveVoucher}
          />
        )}
      </Container>
    </ResponsiveAdminLayout>
  );
};

export default AdminMarketing;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  margin-bottom: -2px;

  &:hover {
    color: #3b82f6;
  }
`;

const VouchersSection = styled.div``;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const VouchersTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
`;

const VoucherRow = styled.tr`
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const VoucherCode = styled.code`
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Courier New', monospace;
  display: block;
  margin-bottom: 4px;
`;

const EventLabel = styled.div`
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 600;
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.type === 'percentage') return '#dbeafe';
    if (props.type === 'fixed') return '#fef3c7';
    return '#dcfce7';
  }};
  color: ${props => {
    if (props.type === 'percentage') return '#1e40af';
    if (props.type === 'fixed') return '#92400e';
    return '#166534';
  }};
`;

const VoucherValue = styled.div`
  font-weight: 700;
  color: #059669;
  font-size: 1rem;
`;

const MaxDiscount = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
`;

const UsageText = styled.div`
  color: #6b7280;
`;

const DateText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.status === 'active') return '#dcfce7';
    if (props.status === 'paused') return '#f3f4f6';
    if (props.status === 'upcoming') return '#dbeafe';
    return '#fee2e2';
  }};
  color: ${props => {
    if (props.status === 'active') return '#166534';
    if (props.status === 'paused') return '#6b7280';
    if (props.status === 'upcoming') return '#1e40af';
    return '#991b1b';
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ danger?: boolean }>`
  padding: 0.5rem;
  background: ${props => props.danger ? '#fef2f2' : '#f3f4f6'};
  color: ${props => props.danger ? '#dc2626' : '#4b5563'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? '#fee2e2' : '#e5e7eb'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;

  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
    color: #6b7280;
  }

  p {
    margin: 0 0 1.5rem 0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;
