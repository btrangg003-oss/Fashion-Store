import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPackage, FiCheck, FiClock, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import { useRouter } from 'next/router';

interface OrderOutboundSectionProps {
  orderId: string;
  orderNumber: string;
}

const OrderOutboundSection: React.FC<OrderOutboundSectionProps> = ({ orderId, orderNumber }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [outboundData, setOutboundData] = useState<any>(null);

  useEffect(() => {
    loadOutboundStatus();
  }, [orderId]);

  const loadOutboundStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/outbound-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOutboundData(data);
      }
    } catch (error) {
      console.error('Error loading outbound status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOutbound = async () => {
    if (!confirm('Tạo phiếu xuất kho cho đơn hàng này?')) {
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/orders/${orderId}/create-outbound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: `Tạo từ đơn hàng ${orderNumber}`
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('✅ Tạo phiếu xuất kho thành công!');
        loadOutboundStatus(); // Reload to show new outbound
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating outbound:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setCreating(false);
    }
  };

  const handleViewOutbound = () => {
    if (outboundData?.outbound?.id) {
      router.push(`/admin/inventory/outbound/${outboundData.outbound.id}`);
    }
  };

  if (loading) {
    return (
      <Section>
        <SectionTitle>
          <FiPackage /> Xuất Kho
        </SectionTitle>
        <LoadingText>Đang tải...</LoadingText>
      </Section>
    );
  }

  return (
    <Section>
      <SectionTitle>
        <FiPackage /> Xuất Kho
      </SectionTitle>

      {!outboundData?.hasOutbound ? (
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <EmptyText>Chưa có phiếu xuất kho</EmptyText>
          <CreateButton onClick={handleCreateOutbound} disabled={creating}>
            {creating ? 'Đang tạo...' : '📦 Tạo Phiếu Xuất Kho'}
          </CreateButton>
          <HintText>
            Tạo phiếu xuất kho để chuẩn bị hàng cho đơn hàng này
          </HintText>
        </EmptyState>
      ) : (
        <OutboundInfo>
          <InfoHeader>
            <OutboundNumber>{outboundData.outbound.receiptNumber}</OutboundNumber>
            <StatusBadge status={outboundData.outbound.status}>
              {getStatusIcon(outboundData.outbound.status)} {getStatusLabel(outboundData.outbound.status)}
            </StatusBadge>
          </InfoHeader>

          <InfoGrid>
            <InfoItem>
              <InfoLabel>Trạng thái kho:</InfoLabel>
              <InfoValue>
                <InventoryStatusBadge status={outboundData.inventoryStatus}>
                  {getInventoryStatusLabel(outboundData.inventoryStatus)}
                </InventoryStatusBadge>
              </InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Tổng giá trị:</InfoLabel>
              <InfoValue>{outboundData.outbound.totalValue?.toLocaleString()}₫</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Số sản phẩm:</InfoLabel>
              <InfoValue>{outboundData.outbound.items?.length || 0} mặt hàng</InfoValue>
            </InfoItem>

            <InfoItem>
              <InfoLabel>Ngày tạo:</InfoLabel>
              <InfoValue>{new Date(outboundData.outbound.createdAt).toLocaleString('vi-VN')}</InfoValue>
            </InfoItem>
          </InfoGrid>

          {outboundData.outbound.notes && (
            <NotesBox>
              <NotesLabel>Ghi chú:</NotesLabel>
              <NotesText>{outboundData.outbound.notes}</NotesText>
            </NotesBox>
          )}

          <ActionButtons>
            <ViewButton onClick={handleViewOutbound}>
              <FiExternalLink /> Xem Chi Tiết Phiếu Xuất
            </ViewButton>
          </ActionButtons>
        </OutboundInfo>
      )}
    </Section>
  );
};

// Helper functions
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'draft': return '📝';
    case 'pending': return '⏳';
    case 'approved': return '✅';
    case 'completed': return '✔️';
    default: return '📄';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Nháp';
    case 'pending': return 'Chờ duyệt';
    case 'approved': return 'Đã duyệt';
    case 'completed': return 'Hoàn thành';
    default: return status;
  }
};

const getInventoryStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return '⏳ Chờ xử lý';
    case 'reserved': return '🔒 Đã đặt hàng';
    case 'picked': return '📦 Đã lấy hàng';
    case 'packed': return '📦 Đã đóng gói';
    case 'shipped': return '🚚 Đã giao vận';
    default: return status;
  }
};

// Styled Components
const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 40px;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 20px;
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 15px;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HintText = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: #9ca3af;
`;

const OutboundInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
`;

const OutboundNumber = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
  font-family: 'Courier New', monospace;
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'draft': return '#f3f4f6';
      case 'pending': return '#fef3c7';
      case 'approved': return '#d1fae5';
      case 'completed': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'draft': return '#6b7280';
      case 'pending': return '#d97706';
      case 'approved': return '#059669';
      case 'completed': return '#2563eb';
      default: return '#6b7280';
    }
  }};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const InfoValue = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
`;

const InventoryStatusBadge = styled.span<{ status: string }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'reserved': return '#dbeafe';
      case 'picked': return '#e0e7ff';
      case 'packed': return '#ddd6fe';
      case 'shipped': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#d97706';
      case 'reserved': return '#2563eb';
      case 'picked': return '#4f46e5';
      case 'packed': return '#7c3aed';
      case 'shipped': return '#059669';
      default: return '#6b7280';
    }
  }};
`;

const NotesBox = styled.div`
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
`;

const NotesLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
`;

const NotesText = styled.div`
  font-size: 14px;
  color: #374151;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ViewButton = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #2563eb;
  }
`;

export default OrderOutboundSection;
