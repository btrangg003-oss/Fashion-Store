import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import CampaignFormModal from '@/components/Admin/CampaignFormModal';
import { Campaign, CampaignType, CampaignStatus } from '@/models/campaign';
import {
  FaRocket, FaPlus, FaEdit, FaTrash, FaPlay, FaPause, FaCheck,
  FaSearch, FaFilter, FaChartLine, FaEnvelope, FaImage, FaBolt,
  FaSnowflake, FaBox, FaCopy, FaEye
} from 'react-icons/fa';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [campaigns, searchTerm, statusFilter, typeFilter]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/campaigns', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...campaigns];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(c => c.type === typeFilter);
    }

    setFilteredCampaigns(filtered);
  };

  const handleAction = async (id: string, action: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa chiến dịch này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Có lỗi xảy ra khi xóa chiến dịch');
    }
  };

  const getTypeIcon = (type: CampaignType) => {
    switch (type) {
      case 'email': return <FaEnvelope />;
      case 'banner': return <FaImage />;
      case 'flash_sale': return <FaBolt />;
      case 'seasonal': return <FaSnowflake />;
      case 'product_launch': return <FaBox />;
    }
  };

  const getTypeLabel = (type: CampaignType) => {
    const labels = {
      email: 'Email',
      banner: 'Banner',
      flash_sale: 'Flash Sale',
      seasonal: 'Theo mùa',
      product_launch: 'Ra mắt SP'
    };
    return labels[type];
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const colors = {
      draft: '#6b7280',
      scheduled: '#3b82f6',
      active: '#10b981',
      paused: '#f59e0b',
      completed: '#8b5cf6',
      cancelled: '#ef4444'
    };

    const labels = {
      draft: 'Nháp',
      scheduled: 'Đã lên lịch',
      active: 'Đang chạy',
      paused: 'Tạm dừng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };

    return <StatusBadge color={colors[status]}>{labels[status]}</StatusBadge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateROI = (campaign: Campaign) => {
    if (!campaign.budget || campaign.budget === 0) return 0;
    return ((campaign.revenue - campaign.budget) / campaign.budget) * 100;
  };

  // Calculate stats
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0)
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
            <Title>Quản Lý Chiến Dịch</Title>
            <Stats>
              <StatItem>
                <StatLabel>Tổng số:</StatLabel>
                <StatValue>{stats.total}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Đang chạy:</StatLabel>
                <StatValue color="#10b981">{stats.active}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Doanh thu:</StatLabel>
                <StatValue color="#3b82f6">{formatPrice(stats.totalRevenue)}</StatValue>
              </StatItem>
            </Stats>
          </HeaderLeft>
          <CreateButton onClick={() => {
            setSelectedCampaign(null);
            setShowModal(true);
          }}>
            <FaPlus /> Tạo Chiến Dịch
          </CreateButton>
        </Header>

        <Filters>
          <SearchBox>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="Tìm kiếm chiến dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          <FilterGroup>
            <FilterLabel><FaFilter /> Lọc:</FilterLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="scheduled">Đã lên lịch</option>
              <option value="active">Đang chạy</option>
              <option value="paused">Tạm dừng</option>
              <option value="completed">Hoàn thành</option>
            </Select>

            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">Tất cả loại</option>
              <option value="email">Email</option>
              <option value="banner">Banner</option>
              <option value="flash_sale">Flash Sale</option>
              <option value="seasonal">Theo mùa</option>
              <option value="product_launch">Ra mắt SP</option>
            </Select>
          </FilterGroup>
        </Filters>

        {filteredCampaigns.length === 0 ? (
          <EmptyState>
            <EmptyIcon>🚀</EmptyIcon>
            <EmptyText>
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Không tìm thấy chiến dịch nào'
                : 'Chưa có chiến dịch nào. Tạo chiến dịch đầu tiên!'}
            </EmptyText>
          </EmptyState>
        ) : (
          <CampaignsGrid>
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id}>
                <CardHeader>
                  <TypeBadge>
                    {getTypeIcon(campaign.type)}
                    {getTypeLabel(campaign.type)}
                  </TypeBadge>
                  {getStatusBadge(campaign.status)}
                </CardHeader>

                <CardBody>
                  <CampaignName>{campaign.name}</CampaignName>
                  <CampaignDescription>{campaign.description}</CampaignDescription>

                  <DateRange>
                    📅 {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </DateRange>

                  <MetricsGrid>
                    <Metric>
                      <MetricLabel>Hiển thị</MetricLabel>
                      <MetricValue>{campaign.impressions.toLocaleString()}</MetricValue>
                    </Metric>
                    <Metric>
                      <MetricLabel>Click</MetricLabel>
                      <MetricValue>{campaign.clicks.toLocaleString()}</MetricValue>
                    </Metric>
                    <Metric>
                      <MetricLabel>Chuyển đổi</MetricLabel>
                      <MetricValue>{campaign.conversions.toLocaleString()}</MetricValue>
                    </Metric>
                    <Metric>
                      <MetricLabel>Doanh thu</MetricLabel>
                      <MetricValue>{formatPrice(campaign.revenue)}</MetricValue>
                    </Metric>
                  </MetricsGrid>

                  {campaign.budget && campaign.budget > 0 && (
                    <ROI positive={calculateROI(campaign) > 0}>
                      ROI: {calculateROI(campaign).toFixed(1)}%
                    </ROI>
                  )}
                </CardBody>

                <CardFooter>
                  <Actions>
                    {campaign.status === 'draft' && (
                      <ActionButton
                        onClick={() => handleAction(campaign.id, 'launch')}
                        color="#10b981"
                        title="Khởi chạy"
                      >
                        <FaPlay />
                      </ActionButton>
                    )}
                    {campaign.status === 'active' && (
                      <ActionButton
                        onClick={() => handleAction(campaign.id, 'pause')}
                        color="#f59e0b"
                        title="Tạm dừng"
                      >
                        <FaPause />
                      </ActionButton>
                    )}
                    {campaign.status === 'paused' && (
                      <ActionButton
                        onClick={() => handleAction(campaign.id, 'resume')}
                        color="#10b981"
                        title="Tiếp tục"
                      >
                        <FaPlay />
                      </ActionButton>
                    )}
                    {(campaign.status === 'active' || campaign.status === 'paused') && (
                      <ActionButton
                        onClick={() => handleAction(campaign.id, 'complete')}
                        color="#8b5cf6"
                        title="Hoàn thành"
                      >
                        <FaCheck />
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={() => alert('Xem chi tiết - Đang phát triển')}
                      color="#3b82f6"
                      title="Xem chi tiết"
                    >
                      <FaEye />
                    </ActionButton>
                    <ActionButton
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowModal(true);
                      }}
                      color="#6b7280"
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDelete(campaign.id)}
                      color="#ef4444"
                      title="Xóa"
                    >
                      <FaTrash />
                    </ActionButton>
                  </Actions>
                </CardFooter>
              </CampaignCard>
            ))}
          </CampaignsGrid>
        )}

        {showModal && (
          <CampaignFormModal
            campaign={selectedCampaign}
            onClose={() => setShowModal(false)}
            onSave={async (data) => {
              try {
                const token = localStorage.getItem('token');
                const url = selectedCampaign
                  ? `/api/admin/campaigns/${selectedCampaign.id}`
                  : '/api/admin/campaigns';
                
                const method = selectedCampaign ? 'PUT' : 'POST';

                const response = await fetch(url, {
                  method,
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(data)
                });

                if (response.ok) {
                  await fetchCampaigns();
                  setShowModal(false);
                } else {
                  const error = await response.json();
                  throw new Error(error.message);
                }
              } catch (error: any) {
                alert(error.message || 'Có lỗi xảy ra');
                throw error;
              }
            }}
          />
        )}
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

const CampaignsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CampaignCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  padding: 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TypeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
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

const CardBody = styled.div`
  padding: 20px;
`;

const CampaignName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const CampaignDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const DateRange = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
`;

const Metric = styled.div`
  text-align: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
`;

const MetricLabel = styled.div`
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MetricValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const ROI = styled.div<{ positive: boolean }>`
  text-align: center;
  padding: 8px;
  background: ${props => props.positive ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.positive ? '#065f46' : '#991b1b'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
`;

const CardFooter = styled.div`
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
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

export default CampaignsPage;
