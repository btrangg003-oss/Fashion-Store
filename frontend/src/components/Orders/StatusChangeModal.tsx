import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiCheck, FiClock, FiTruck, FiPackage, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { Order } from '@/models/orders';

interface StatusChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    onStatusChange: (orderId: string, newStatus: string, note?: string) => void;
}

const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', icon: FiClock, color: '#f59e0b' },
    { value: 'confirmed', label: 'Đã xác nhận', icon: FiCheck, color: '#3b82f6' },
    { value: 'processing', label: 'Chuẩn bị hàng', icon: FiPackage, color: '#8b5cf6' },
    { value: 'shipping', label: 'Đang giao', icon: FiTruck, color: '#06b6d4' },
    { value: 'delivered', label: 'Đã giao', icon: FiCheckCircle, color: '#10b981' },
    { value: 'cancelled', label: 'Đã hủy', icon: FiXCircle, color: '#ef4444' }
];

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
    isOpen,
    onClose,
    order,
    onStatusChange
}) => {
    const [selectedStatus, setSelectedStatus] = useState(order?.status || 'pending');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (order?.status) {
            setSelectedStatus(order.status);
        }
    }, [order?.status]);

    if (!isOpen || !order) return null;

    const handleSubmit = () => {
        if (!order) return;
        onStatusChange(order.id, selectedStatus, note);
        onClose();
    };

    const currentStatusOption = statusOptions.find(s => s.value === order.status);
    const selectedStatusOption = statusOptions.find(s => s.value === selectedStatus);

    return (
        <Overlay onClick={onClose}>
            <ModalContainer onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>Thay đổi trạng thái đơn hàng</Title>
                    <CloseButton onClick={onClose}>
                        {React.createElement(FiX)}
                    </CloseButton>
                </Header>

                <Content>
                    <OrderInfo>
                        <InfoRow>
                            <Label>Mã đơn hàng:</Label>
                            <Value>#{order.id}</Value>
                        </InfoRow>
                        <InfoRow>
                            <Label>Khách hàng:</Label>
                            <Value>{order.shippingAddress.fullName}</Value>
                        </InfoRow>
                        <InfoRow>
                            <Label>Trạng thái hiện tại:</Label>
                            <StatusBadge color={currentStatusOption?.color || '#6b7280'}>
                                {React.createElement(currentStatusOption?.icon || FiClock)}
                                {currentStatusOption?.label}
                            </StatusBadge>
                        </InfoRow>
                    </OrderInfo>

                    <StatusSection>
                        <SectionTitle>Chọn trạng thái mới:</SectionTitle>
                        <StatusGrid>
                            {statusOptions.map((status) => (
                                <StatusOption
                                    key={status.value}
                                    selected={selectedStatus === status.value}
                                    color={status.color}
                                    onClick={() => setSelectedStatus(status.value as typeof selectedStatus)}
                                >
                                    {React.createElement(status.icon)}
                                    <span>{status.label}</span>
                                </StatusOption>
                            ))}
                        </StatusGrid>
                    </StatusSection>

                    <NoteSection>
                        <SectionTitle>Ghi chú (tùy chọn):</SectionTitle>
                        <NoteInput
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Thêm ghi chú về thay đổi trạng thái..."
                            rows={3}
                        />
                    </NoteSection>

                    {selectedStatus !== order.status && (
                        <PreviewSection>
                            <SectionTitle>Xem trước thay đổi:</SectionTitle>
                            <ChangePreview>
                                <StatusBadge color={currentStatusOption?.color || '#6b7280'}>
                                    {React.createElement(currentStatusOption?.icon || FiClock)}
                                    {currentStatusOption?.label}
                                </StatusBadge>
                                <Arrow>→</Arrow>
                                <StatusBadge color={selectedStatusOption?.color || '#6b7280'}>
                                    {React.createElement(selectedStatusOption?.icon || FiClock)}
                                    {selectedStatusOption?.label}
                                </StatusBadge>
                            </ChangePreview>
                        </PreviewSection>
                    )}
                </Content>

                <Footer>
                    <CancelButton onClick={onClose}>Hủy</CancelButton>
                    <SubmitButton
                        onClick={handleSubmit}
                        disabled={selectedStatus === order.status}
                    >
                        Cập nhật trạng thái
                    </SubmitButton>
                </Footer>
            </ModalContainer>
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
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const OrderInfo = styled.div`
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  font-weight: 500;
  color: #374151;
`;

const Value = styled.span`
  color: #111827;
`;

const StatusBadge = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border: 1px solid ${props => props.color}40;
`;

const StatusSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const StatusOption = styled.div<{ selected: boolean; color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid ${props => props.selected ? props.color : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? `${props.color}10` : 'white'};
  color: ${props => props.selected ? props.color : '#374151'};
  
  &:hover {
    border-color: ${props => props.color};
    background: ${props => `${props.color}10`};
  }
  
  span {
    font-weight: 500;
  }
`;

const NoteSection = styled.div`
  margin-bottom: 24px;
`;

const NoteInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const PreviewSection = styled.div`
  background: #f0f9ff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #0ea5e9;
`;

const ChangePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
`;

const Arrow = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
  color: #0ea5e9;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  padding: 10px 20px;
  background: ${props => props.disabled ? '#9ca3af' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    background: ${props => props.disabled ? '#9ca3af' : '#2563eb'};
  }
`;

export default StatusChangeModal;