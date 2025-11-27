import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX, FiSearch, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { SerialInfo } from '@/models/inventory';

interface SerialDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  sku: string;
  serials: SerialInfo[];
}

const SerialDetailsModal: React.FC<SerialDetailsModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  sku,
  serials
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (!isOpen) return null;

  const filteredSerials = serials.filter(serial => {
    const matchesSearch = serial.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || serial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      available: { label: 'Có sẵn', color: '#10b981', icon: '✅' },
      sold: { label: 'Đã bán', color: '#6b7280', icon: '📦' },
      returned: { label: 'Đã trả', color: '#f59e0b', icon: '↩️' },
      damaged: { label: 'Hỏng', color: '#ef4444', icon: '⚠️' }
    };
    return configs[status as keyof typeof configs] || configs.available;
  };

  const stats = {
    total: serials.length,
    available: serials.filter(s => s.status === 'available').length,
    sold: serials.filter(s => s.status === 'sold').length,
    returned: serials.filter(s => s.status === 'returned').length,
    damaged: serials.filter(s => s.status === 'damaged').length
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <Title>#️⃣ Chi Tiết Serial Numbers</Title>
            <ProductInfo>
              <ProductName>{productName}</ProductName>
              <SKU>SKU: {sku}</SKU>
            </ProductInfo>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatLabel>Tổng Serial</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatCard>
          <StatCard color="#10b981">
            <StatLabel>Có sẵn</StatLabel>
            <StatValue>{stats.available}</StatValue>
          </StatCard>
          <StatCard color="#6b7280">
            <StatLabel>Đã bán</StatLabel>
            <StatValue>{stats.sold}</StatValue>
          </StatCard>
          <StatCard color="#f59e0b">
            <StatLabel>Đã trả</StatLabel>
            <StatValue>{stats.returned}</StatValue>
          </StatCard>
          <StatCard color="#ef4444">
            <StatLabel>Hỏng</StatLabel>
            <StatValue>{stats.damaged}</StatValue>
          </StatCard>
        </StatsGrid>

        <Filters>
          <SearchBox>
            <FiSearch />
            <SearchInput
              placeholder="Tìm serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <StatusFilter
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">✅ Có sẵn</option>
            <option value="sold">📦 Đã bán</option>
            <option value="returned">↩️ Đã trả</option>
            <option value="damaged">⚠️ Hỏng</option>
          </StatusFilter>
        </Filters>

        <SerialsList>
          {filteredSerials.length === 0 ? (
            <EmptyState>
              <EmptyIcon><FiPackage /></EmptyIcon>
              <EmptyText>Không tìm thấy serial nào</EmptyText>
            </EmptyState>
          ) : (
            filteredSerials.map((serial, index) => {
              const statusConfig = getStatusConfig(serial.status);
              return (
                <SerialCard key={index}>
                  <SerialHeader>
                    <SerialNumber>{serial.serialNumber}</SerialNumber>
                    <StatusBadge color={statusConfig.color}>
                      {statusConfig.icon} {statusConfig.label}
                    </StatusBadge>
                  </SerialHeader>

                  {serial.status === 'sold' && (
                    <SerialDetails>
                      {serial.soldTo && <Detail>👤 Khách: {serial.soldTo}</Detail>}
                      {serial.orderId && <Detail>📦 Đơn: {serial.orderId}</Detail>}
                      {serial.soldAt && (
                        <Detail>
                          📅 Ngày bán: {new Date(serial.soldAt).toLocaleDateString('vi-VN')}
                        </Detail>
                      )}
                    </SerialDetails>
                  )}

                  {serial.notes && (
                    <SerialNotes>
                      <FiAlertCircle /> {serial.notes}
                    </SerialNotes>
                  )}
                </SerialCard>
              );
            })
          )}
        </SerialsList>
      </Modal>
    </Overlay>
  );
};

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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProductName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
`;

const SKU = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
  
  svg {
    font-size: 20px;
    color: #6b7280;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 20px 24px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const StatCard = styled.div<{ color?: string }>`
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 2px solid ${props => props.color || '#e5e7eb'};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f9fafb;
  border-radius: 8px;
  
  svg {
    color: #6b7280;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const StatusFilter = styled.select`
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SerialsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
`;

const SerialCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
`;

const SerialHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SerialNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  font-family: 'Courier New', monospace;
`;

const StatusBadge = styled.div<{ color: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color}15;
  color: ${props => props.color};
`;

const SerialDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

const Detail = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const SerialNotes = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 6px;
  font-size: 13px;
  color: #92400e;
  
  svg {
    flex-shrink: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const EmptyText = styled.div`
  font-size: 16px;
  color: #6b7280;
`;

export default SerialDetailsModal;
