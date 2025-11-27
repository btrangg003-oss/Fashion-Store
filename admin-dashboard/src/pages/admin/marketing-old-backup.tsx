import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import CampaignFormModal from '@/components/Admin/CampaignFormModal';
import VoucherFormModal from '@/components/Admin/VoucherFormModal';
import { useAuth } from '@/contexts/AuthContext';
import { Voucher } from '@/models/voucher';
import {
  FiMail, FiPercent, FiTrendingUp, FiUsers, FiGift, FiTarget,
  FiPlus, FiEdit2, FiTrash2, FiCopy, FiEye, FiCalendar, FiPause, FiPlay
} from 'react-icons/fi';

const AdminMarketing = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'vouchers'>('campaigns');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  
  // Campaign modal
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [campaignMode, setCampaignMode] = useState<'create' | 'edit'>('create');
  
  // Voucher modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [user, loading, router]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [campaignsRes, vouchersRes] = await Promise.all([
        fetch('/api/admin/marketing/campaigns'),
        fetch('/api/admin/vouchers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ]);

      const campaignsData = await campaignsRes.json();
      const vouchersData = await vouchersRes.json();

      setCampaigns(campaignsData.data || []);
      setVouchers(Array.isArray(vouchersData) ? vouchersData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter(v => v.status === 'active').length,
    totalReach: campaigns.reduce((sum, c) => sum + (c.reach || 0), 0),
    totalConversions: campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0)
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
          <StatCard>
            <StatIcon color="#3b82f6">
              <FiTarget />
            </StatIcon>
            <StatContent>
              <StatLabel>Chiến dịch</StatLabel>
              <StatValue>{stats.activeCampaigns}/{stats.totalCampaigns}</StatValue>
              <StatSubtext>Đang chạy</StatSubtext>
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
              <FiUsers />
            </StatIcon>
            <StatContent>
              <StatLabel>Tiếp cận</StatLabel>
              <StatValue>{(stats.totalReach / 1000).toFixed(1)}K</StatValue>
              <StatSubtext>Người dùng</StatSubtext>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#8b5cf6">
              <FiTrendingUp />
            </StatIcon>
            <StatContent>
              <StatLabel>Chuyển đổi</StatLabel>
              <StatValue>{stats.totalConversions}</StatValue>
              <StatSubtext>Đơn hàng</StatSubtext>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <TabsContainer>
          <Tab active={false} onClick={() => router.push('/admin/campaigns')}>
            <FiTarget /> Chiến dịch
          </Tab>
          <Tab active={activeTab === 'vouchers'} onClick={() => setActiveTab('vouchers')}>
            <FiPercent /> Mã giảm giá ({vouchers.length})
          </Tab>
        </TabsContainer>

        {activeTab === 'vouchers' && (
          <CampaignsSection>
            <SectionHeader>
              <SectionTitle>Danh sách chiến dịch</SectionTitle>
            </SectionHeader>

            <CampaignsGrid>
              {campaigns.map(campaign => (
                <CampaignCard key={campaign.id}>
                  <CardHeader>
                    <CampaignType type={campaign.type}>
                      {campaign.type === 'email' && <FiMail />}
                      {campaign.type === 'social' && <FiUsers />}
                      {campaign.type === 'promotion' && <FiGift />}
                      {campaign.type}
                    </CampaignType>
                    <StatusBadge status={campaign.status}>
                      {campaign.status === 'active' ? 'Đang chạy' :
                        campaign.status === 'scheduled' ? 'Đã lên lịch' : 'Kết thúc'}
                    </StatusBadge>
                  </CardHeader>

                  <CampaignName>{campaign.name}</CampaignName>
                  <CampaignDate>
                    <FiCalendar />
                    {new Date(campaign.startDate).toLocaleDateString('vi-VN')} -
                    {new Date(campaign.endDate).toLocaleDateString('vi-VN')}
                  </CampaignDate>

                  <CampaignStats>
                    <StatItem>
                      <StatItemLabel>Ngân sách</StatItemLabel>
                      <StatItemValue>{(campaign.budget / 1000000).toFixed(1)}M</StatItemValue>
                    </StatItem>
                    <StatItem>
                      <StatItemLabel>Tiếp cận</StatItemLabel>
                      <StatItemValue>{(campaign.reach / 1000).toFixed(1)}K</StatItemValue>
                    </StatItem>
                    <StatItem>
                      <StatItemLabel>Chuyển đổi</StatItemLabel>
                      <StatItemValue>{campaign.conversions}</StatItemValue>
                    </StatItem>
                  </CampaignStats>

                  <ProgressBar>
                    <ProgressFill width={(campaign.spent / campaign.budget) * 100} />
                  </ProgressBar>
                  <ProgressText>
                    Đã chi: {(campaign.spent / 1000000).toFixed(1)}M / {(campaign.budget / 1000000).toFixed(1)}M
                  </ProgressText>

                  <CardActions>
                    <IconButton onClick={() => {
                      alert(`Chi tiết chiến dịch:\n\nTên: ${campaign.name}\nLoại: ${campaign.type}\nNgân sách: ${campaign.budget.toLocaleString('vi-VN')} ₫\nĐã chi: ${campaign.spent.toLocaleString('vi-VN')} ₫\nTiếp cận: ${campaign.reach}\nChuyển đổi: ${campaign.conversions}`);
                    }}>
                      <FiEye />
                    </IconButton>
                    <IconButton onClick={() => {
                      const newName = prompt('Tên chiến dịch:', campaign.name);
                      if (!newName) return;
                      const newBudget = prompt('Ngân sách:', campaign.budget.toString());
                      if (!newBudget) return;

                      fetch(`/api/admin/marketing/campaigns/${campaign.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: newName,
                          budget: parseInt(newBudget)
                        })
                      }).then(res => {
                        if (res.ok) {
                          alert('Cập nhật thành công!');
                          loadData();
                        } else {
                          alert('Lỗi khi cập nhật');
                        }
                      });
                    }}>
                      <FiEdit2 />
                    </IconButton>
                    <IconButton onClick={async () => {
                      if (confirm('Nhân bản chiến dịch này?')) {
                        try {
                          const response = await fetch('/api/admin/marketing/campaigns', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...campaign, id: undefined, name: campaign.name + ' (Copy)' })
                          });
                          if (response.ok) {
                            alert('Nhân bản thành công!');
                            loadData();
                          }
                        } catch (error) {
                          alert('Lỗi khi nhân bản');
                        }
                      }
                    }}>
                      <FiCopy />
                    </IconButton>
                    <IconButton danger onClick={async () => {
                      if (confirm('Xóa chiến dịch này?')) {
                        try {
                          const response = await fetch(`/api/admin/marketing/campaigns/${campaign.id}`, {
                            method: 'DELETE'
                          });
                          if (response.ok) {
                            alert('Xóa thành công!');
                            loadData();
                          }
                        } catch (error) {
                          alert('Lỗi khi xóa');
                        }
                      }
                    }}>
                      <FiTrash2 />
                    </IconButton>
                  </CardActions>
                </CampaignCard>
              ))}

              {campaigns.length === 0 && (
                <EmptyState>
                  <FiTarget size={64} />
                  <h3>Chưa có chiến dịch nào</h3>
                  <p>Tạo chiến dịch marketing đầu tiên của bạn</p>
                  <PrimaryButton onClick={() => {
                    const name = prompt('Tên chiến dịch:');
                    if (!name) return;
                    const budget = prompt('Ngân sách (VNĐ):');
                    if (!budget) return;

                    fetch('/api/admin/marketing/campaigns', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name,
                        type: 'email',
                        status: 'active',
                        budget: parseInt(budget),
                        spent: 0,
                        reach: 0,
                        conversions: 0,
                        startDate: new Date().toISOString(),
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                      })
                    }).then(res => {
                      if (res.ok) {
                        alert('Tạo chiến dịch thành công!');
                        loadData();
                      } else {
                        alert('Lỗi khi tạo chiến dịch');
                      }
                    });
                  }}>
                    <FiPlus /> Tạo chiến dịch
                  </PrimaryButton>
                </EmptyState>
              )}
            </CampaignsGrid>
          </CampaignsSection>
        ) : (
          <DiscountsSection>
            <SectionHeader>
              <SectionTitle>Danh sách mã giảm giá</SectionTitle>
            </SectionHeader>

            <DiscountsTable>
              <thead>
                <tr>
                  <Th>Mã</Th>
                  <Th>Loại</Th>
                  <Th>Giá trị</Th>
                  <Th>Sử dụng</Th>
                  <Th>Hạn sử dụng</Th>
                  <Th>Trạng thái</Th>
                  <Th>Hành động</Th>
                </tr>
              </thead>
              <tbody>
                {discounts.map(discount => (
                  <DiscountRow key={discount.id}>
                    <Td>
                      <DiscountCode>{discount.code}</DiscountCode>
                    </Td>
                    <Td>
                      <TypeBadge type={discount.type}>
                        {discount.type === 'percentage' ? 'Phần trăm' : 'Số tiền'}
                      </TypeBadge>
                    </Td>
                    <Td>
                      <DiscountValue>
                        {discount.type === 'percentage'
                          ? `${discount.value}%`
                          : `${discount.value.toLocaleString('vi-VN')} ₫`}
                      </DiscountValue>
                    </Td>
                    <Td>
                      <UsageText>
                        {discount.used || 0} / {discount.maxUses || '∞'}
                      </UsageText>
                    </Td>
                    <Td>
                      {discount.expiryDate
                        ? new Date(discount.expiryDate).toLocaleDateString('vi-VN')
                        : 'Không giới hạn'}
                    </Td>
                    <Td>
                      <StatusBadge status={discount.status}>
                        {discount.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionButtons>
                        <IconButton onClick={() => {
                          const newCode = prompt('Mã giảm giá:', discount.code);
                          if (!newCode) return;
                          const newValue = prompt('Giá trị:', discount.value.toString());
                          if (!newValue) return;

                          fetch(`/api/admin/marketing/discount-codes/${discount.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              code: newCode.toUpperCase(),
                              value: parseInt(newValue)
                            })
                          }).then(res => {
                            if (res.ok) {
                              alert('Cập nhật thành công!');
                              loadData();
                            } else {
                              alert('Lỗi khi cập nhật');
                            }
                          });
                        }}>
                          <FiEdit2 />
                        </IconButton>
                        <IconButton onClick={async () => {
                          if (confirm('Nhân bản mã giảm giá này?')) {
                            try {
                              const response = await fetch('/api/admin/marketing/discount-codes', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ...discount, id: undefined, code: discount.code + '_COPY' })
                              });
                              if (response.ok) {
                                alert('Nhân bản thành công!');
                                loadData();
                              }
                            } catch (error) {
                              alert('Lỗi khi nhân bản');
                            }
                          }
                        }}>
                          <FiCopy />
                        </IconButton>
                        <IconButton danger onClick={async () => {
                          if (confirm('Xóa mã giảm giá này?')) {
                            try {
                              const response = await fetch(`/api/admin/marketing/discount-codes/${discount.id}`, {
                                method: 'DELETE'
                              });
                              if (response.ok) {
                                alert('Xóa thành công!');
                                loadData();
                              }
                            } catch (error) {
                              alert('Lỗi khi xóa');
                            }
                          }
                        }}>
                          <FiTrash2 />
                        </IconButton>
                      </ActionButtons>
                    </Td>
                  </DiscountRow>
                ))}
              </tbody>
            </DiscountsTable>

            {discounts.length === 0 && (
              <EmptyState>
                <FiPercent size={64} />
                <h3>Chưa có mã giảm giá nào</h3>
                <p>Tạo mã giảm giá để thu hút khách hàng</p>
                <PrimaryButton onClick={() => {
                  const code = prompt('Mã giảm giá:');
                  if (!code) return;
                  const value = prompt('Giá trị (% hoặc VNĐ):');
                  if (!value) return;
                  const type = confirm('Click OK nếu là %, Cancel nếu là số tiền') ? 'percentage' : 'fixed';

                  fetch('/api/admin/marketing/discount-codes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      code: code.toUpperCase(),
                      type,
                      value: parseInt(value),
                      status: 'active',
                      used: 0,
                      maxUses: null,
                      expiryDate: null
                    })
                  }).then(res => {
                    if (res.ok) {
                      alert('Tạo mã giảm giá thành công!');
                      loadData();
                    } else {
                      alert('Lỗi khi tạo mã giảm giá');
                    }
                  });
                }}>
                  <FiPlus /> Tạo mã giảm giá
                </PrimaryButton>
              </EmptyState>
            )}
          </DiscountsSection>
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

const PrimaryButton = styled(motion.button)`
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

const CampaignsSection = styled.div``;

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

const CampaignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const CampaignCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CampaignType = styled.span<{ type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => {
    if (props.type === 'email') return '#dbeafe';
    if (props.type === 'social') return '#fce7f3';
    return '#fef3c7';
  }};
  color: ${props => {
    if (props.type === 'email') return '#1e40af';
    if (props.type === 'social') return '#9f1239';
    return '#92400e';
  }};
  text-transform: capitalize;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    if (props.status === 'active') return '#dcfce7';
    if (props.status === 'scheduled') return '#dbeafe';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.status === 'active') return '#166534';
    if (props.status === 'scheduled') return '#1e40af';
    return '#6b7280';
  }};
`;

const CampaignName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const CampaignDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const CampaignStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatItemLabel = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
`;

const StatItemValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ width: number }>`
  width: ${props => Math.min(props.width, 100)}%;
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
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

const DiscountsSection = styled.div``;

const DiscountsTable = styled.table`
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

const DiscountRow = styled.tr`
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const DiscountCode = styled.code`
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
  font-weight: 600;
  color: #1f2937;
  font-family: 'Courier New', monospace;
`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.type === 'percentage' ? '#dbeafe' : '#fef3c7'};
  color: ${props => props.type === 'percentage' ? '#1e40af' : '#92400e'};
`;

const DiscountValue = styled.div`
  font-weight: 700;
  color: #059669;
  font-size: 1rem;
`;

const UsageText = styled.div`
  color: #6b7280;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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
