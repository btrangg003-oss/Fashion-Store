import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiPackage, FiCalendar, FiAlertCircle, FiTruck, FiTrash2, FiClock } from 'react-icons/fi';
import { BatchInfo } from '@/models/inventory';

interface BatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productSku: string;
  batches: BatchInfo[];
  onBatchAction?: (batchNumber: string, action: 'transfer' | 'dispose') => void;
}

const BatchDetailsModal: React.FC<BatchDetailsModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  productSku,
  batches,
  onBatchAction
}) => {
  const [sortBy, setSortBy] = useState<'expiry' | 'quantity' | 'date'>('expiry');

  if (!isOpen) return null;

  const sortedBatches = [...batches].sort((a, b) => {
    if (sortBy === 'expiry') {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
    if (sortBy === 'quantity') {
      return b.quantity - a.quantity;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    return Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiryDate?: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days === null) return 'none';
    if (days < 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'ok';
  };

  const totalQuantity = batches.reduce((sum, b) => sum + b.quantity, 0);
  const expiredCount = batches.filter(b => getExpiryStatus(b.expiryDate) === 'expired').length;
  const expiringCount = batches.filter(b => {
    const status = getExpiryStatus(b.expiryDate);
    return status === 'critical' || status === 'warning';
  }).length;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <FiPackage size={24} />
            <HeaderTitle>
              <Title>Chi Tiết Lô Hàng</Title>
              <Subtitle>{productName} ({productSku})</Subtitle>
            </HeaderTitle>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <StatsBar>
          <StatCard>
            <StatIcon color="#3b82f6">
              <FiPackage />
            </StatIcon>
            <StatInfo>
              <StatLabel>Tổng số lô</StatLabel>
              <StatValue>{batches.length}</StatValue>
            </StatInfo>
          </StatCard>

          <StatCard>
            <StatIcon color="#10b981">
              <FiPackage />
            </StatIcon>
            <StatInfo>
              <StatLabel>Tổng số lượng</StatLabel>
              <StatValue>{totalQuantity}</StatValue>
            </StatInfo>
          </StatCard>

          {expiringCount > 0 && (
            <StatCard warning>
              <StatIcon color="#f59e0b">
                <FiAlertCircle />
              </StatIcon>
              <StatInfo>
                <StatLabel>Sắp hết hạn</StatLabel>
                <StatValue>{expiringCount}</StatValue>
              </StatInfo>
            </StatCard>
          )}

          {expiredCount > 0 && (
            <StatCard danger>
              <StatIcon color="#ef4444">
                <FiAlertCircle />
              </StatIcon>
              <StatInfo>
                <StatLabel>Đã hết hạn</StatLabel>
                <StatValue>{expiredCount}</StatValue>
              </StatInfo>
            </StatCard>
          )}
        </StatsBar>

        <Controls>
          <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="expiry">Sắp xếp: Hạn sử dụng</option>
            <option value="quantity">Sắp xếp: Số lượng</option>
            <option value="date">Sắp xếp: Ngày tạo</option>
          </SortSelect>
        </Controls>

        <Content>
          {sortedBatches.length === 0 ? (
            <EmptyState>
              <FiPackage size={48} />
              <EmptyText>Không có lô hàng nào</EmptyText>
            </EmptyState>
          ) : (
            <BatchList>
              {sortedBatches.map((batch) => {
                const expiryStatus = getExpiryStatus(batch.expiryDate);
                const daysUntilExpiry = getDaysUntilExpiry(batch.expiryDate);

                return (
                  <BatchCard key={batch.batchNumber} status={expiryStatus}>
                    <BatchHeader>
                      <BatchNumber>{batch.batchNumber}</BatchNumber>
                      <BatchQuantity>
                        <FiPackage /> {batch.quantity}
                      </BatchQuantity>
                    </BatchHeader>

                    <BatchBody>
                      <BatchInfoGrid>
                        {batch.manufactureDate && (
                          <BatchInfoItem>
                            <BatchInfoLabel>
                              <FiCalendar size={14} />
                              Ngày sản xuất:
                            </BatchInfoLabel>
                            <BatchInfoValue>
                              {new Date(batch.manufactureDate).toLocaleDateString('vi-VN')}
                            </BatchInfoValue>
                          </BatchInfoItem>
                        )}

                        {batch.expiryDate && (
                          <BatchInfoItem>
                            <BatchInfoLabel>
                              <FiClock size={14} />
                              Hạn sử dụng:
                            </BatchInfoLabel>
                            <BatchInfoValue>
                              {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}
                              {daysUntilExpiry !== null && (
                                <DaysLeft status={expiryStatus}>
                                  {daysUntilExpiry < 0 
                                    ? `Quá hạn ${Math.abs(daysUntilExpiry)} ngày`
                                    : `Còn ${daysUntilExpiry} ngày`
                                  }
                                </DaysLeft>
                              )}
                            </BatchInfoValue>
                          </BatchInfoItem>
                        )}

                        {batch.supplier && (
                          <BatchInfoItem>
                            <BatchInfoLabel>
                              <FiTruck size={14} />
                              Nhà cung cấp:
                            </BatchInfoLabel>
                            <BatchInfoValue>{batch.supplier}</BatchInfoValue>
                          </BatchInfoItem>
                        )}

                        <BatchInfoItem>
                          <BatchInfoLabel>
                            <FiCalendar size={14} />
                            Ngày nhập:
                          </BatchInfoLabel>
                          <BatchInfoValue>
                            {new Date(batch.createdAt).toLocaleDateString('vi-VN')}
                          </BatchInfoValue>
                        </BatchInfoItem>
                      </BatchInfoGrid>

                      {batch.notes && (
                        <BatchNotes>{batch.notes}</BatchNotes>
                      )}
                    </BatchBody>

                    {expiryStatus !== 'ok' && expiryStatus !== 'none' && (
                      <BatchAlert status={expiryStatus}>
                        <FiAlertCircle />
                        {expiryStatus === 'expired' && 'Lô hàng đã hết hạn - Cần xử lý ngay!'}
                        {expiryStatus === 'critical' && 'Hết hạn trong 7 ngày - Ưu tiên xuất!'}
                        {expiryStatus === 'warning' && 'Hết hạn trong 30 ngày - Lưu ý!'}
                      </BatchAlert>
                    )}

                    {onBatchAction && (
                      <BatchActions>
                        <ActionButton onClick={() => onBatchAction(batch.batchNumber, 'transfer')}>
                          <FiTruck /> Chuyển kho
                        </ActionButton>
                        <ActionButton 
                          danger 
                          onClick={() => onBatchAction(batch.batchNumber, 'dispose')}
                          disabled={expiryStatus !== 'expired'}
                        >
                          <FiTrash2 /> Hủy lô
                        </ActionButton>
                      </BatchActions>
                    )}
                  </BatchCard>
                );
              })}
            </BatchList>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #e5e7eb;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #3b82f6;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 20px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const StatCard = styled.div<{ warning?: boolean; danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 2px solid ${props => {
    if (props.danger) return '#fecaca';
    if (props.warning) return '#fcd34d';
    return '#e5e7eb';
  }};
`;

const StatIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: 8px;
  font-size: 20px;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
`;

const Controls = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
`;

const EmptyText = styled.div`
  margin-top: 16px;
  font-size: 16px;
`;

const BatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BatchCard = styled.div<{ status: string }>`
  padding: 20px;
  background: white;
  border: 2px solid ${props => {
    switch (props.status) {
      case 'expired': return '#fecaca';
      case 'critical': return '#fed7aa';
      case 'warning': return '#fef3c7';
      default: return '#e5e7eb';
    }
  }};
  border-radius: 12px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
`;

const BatchNumber = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  font-family: 'Courier New', monospace;
`;

const BatchQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #eff6ff;
  color: #1e40af;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
`;

const BatchBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BatchInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BatchInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BatchInfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  
  svg {
    color: #9ca3af;
  }
`;

const BatchInfoValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DaysLeft = styled.span<{ status: string }>`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'expired': return '#fee2e2';
      case 'critical': return '#fed7aa';
      case 'warning': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'expired': return '#dc2626';
      case 'critical': return '#ea580c';
      case 'warning': return '#d97706';
      default: return '#6b7280';
    }
  }};
`;

const BatchNotes = styled.div`
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
`;

const BatchAlert = styled.div<{ status: string }>`
  margin-top: 12px;
  padding: 10px 12px;
  background: ${props => {
    switch (props.status) {
      case 'expired': return '#fee2e2';
      case 'critical': return '#fed7aa';
      case 'warning': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'expired': return '#dc2626';
      case 'critical': return '#ea580c';
      case 'warning': return '#d97706';
      default: return '#6b7280';
    }
  }};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BatchActions = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  flex: 1;
  padding: 8px 12px;
  background: ${props => props.danger ? '#fef2f2' : '#eff6ff'};
  color: ${props => props.danger ? '#dc2626' : '#2563eb'};
  border: 1px solid ${props => props.danger ? '#fecaca' : '#bfdbfe'};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover:not(:disabled) {
    background: ${props => props.danger ? '#fee2e2' : '#dbeafe'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default BatchDetailsModal;
