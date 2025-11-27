import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiPackage, FiCalendar, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { BatchInfo } from '@/models/inventory';

interface BatchSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productSku: string;
  productName: string;
  availableBatches: BatchInfo[];
  requiredQuantity: number;
  onSelect: (selectedBatches: { batchNumber: string; quantity: number }[]) => void;
}

const BatchSelectionModal: React.FC<BatchSelectionModalProps> = ({
  isOpen,
  onClose,
  productSku,
  productName,
  availableBatches,
  requiredQuantity,
  onSelect
}) => {
  const [selectedBatches, setSelectedBatches] = useState<{ batchNumber: string; quantity: number }[]>([]);
  const [totalSelected, setTotalSelected] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedBatches([]);
      setTotalSelected(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const total = selectedBatches.reduce((sum, b) => sum + b.quantity, 0);
    setTotalSelected(total);
  }, [selectedBatches]);

  if (!isOpen) return null;

  const handleBatchQuantityChange = (batchNumber: string, quantity: number) => {
    const batch = availableBatches.find(b => b.batchNumber === batchNumber);
    if (!batch) return;

    const maxQty = batch.quantity;
    const validQty = Math.min(Math.max(0, quantity), maxQty);

    setSelectedBatches(prev => {
      const existing = prev.find(b => b.batchNumber === batchNumber);
      if (existing) {
        if (validQty === 0) {
          return prev.filter(b => b.batchNumber !== batchNumber);
        }
        return prev.map(b => 
          b.batchNumber === batchNumber ? { ...b, quantity: validQty } : b
        );
      } else if (validQty > 0) {
        return [...prev, { batchNumber, quantity: validQty }];
      }
      return prev;
    });
  };

  const handleAutoFill = () => {
    // Auto-fill using FIFO (First In First Out) - oldest expiry first
    const sortedBatches = [...availableBatches].sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    });

    let remaining = requiredQuantity;
    const selected: { batchNumber: string; quantity: number }[] = [];

    for (const batch of sortedBatches) {
      if (remaining <= 0) break;
      const qty = Math.min(remaining, batch.quantity);
      selected.push({ batchNumber: batch.batchNumber, quantity: qty });
      remaining -= qty;
    }

    setSelectedBatches(selected);
  };

  const handleConfirm = () => {
    if (totalSelected !== requiredQuantity) {
      alert(`Vui lòng chọn đủ ${requiredQuantity} sản phẩm. Hiện tại: ${totalSelected}`);
      return;
    }
    onSelect(selectedBatches);
    onClose();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const daysUntilExpiry = Math.floor(
      (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <HeaderLeft>
            <FiPackage />
            <HeaderTitle>
              <Title>Chọn Lô Hàng</Title>
              <Subtitle>{productName} ({productSku})</Subtitle>
            </HeaderTitle>
          </HeaderLeft>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <Content>
          <InfoBar>
            <InfoItem>
              <InfoLabel>Cần xuất:</InfoLabel>
              <InfoValue>{requiredQuantity}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Đã chọn:</InfoLabel>
              <InfoValue status={totalSelected === requiredQuantity ? 'success' : 'warning'}>
                {totalSelected}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Còn lại:</InfoLabel>
              <InfoValue>{requiredQuantity - totalSelected}</InfoValue>
            </InfoItem>
            <AutoFillButton onClick={handleAutoFill}>
              ⚡ Tự động chọn (FIFO)
            </AutoFillButton>
          </InfoBar>

          <BatchList>
            {availableBatches.length === 0 ? (
              <EmptyState>
                <FiAlertCircle size={48} />
                <EmptyText>Không có lô hàng nào</EmptyText>
              </EmptyState>
            ) : (
              availableBatches.map((batch) => {
                const selected = selectedBatches.find(b => b.batchNumber === batch.batchNumber);
                const selectedQty = selected?.quantity || 0;
                const expired = isExpired(batch.expiryDate);
                const expiringSoon = isExpiringSoon(batch.expiryDate);

                return (
                  <BatchItem key={batch.batchNumber} disabled={expired}>
                    <BatchHeader>
                      <BatchNumber>{batch.batchNumber}</BatchNumber>
                      {expired && <ExpiredBadge>❌ Hết hạn</ExpiredBadge>}
                      {!expired && expiringSoon && <ExpiringSoonBadge>⚠️ Sắp hết hạn</ExpiringSoonBadge>}
                    </BatchHeader>

                    <BatchInfo>
                      {batch.manufactureDate && (
                        <BatchInfoItem>
                          <FiCalendar size={14} />
                          NSX: {new Date(batch.manufactureDate).toLocaleDateString('vi-VN')}
                        </BatchInfoItem>
                      )}
                      {batch.expiryDate && (
                        <BatchInfoItem>
                          <FiCalendar size={14} />
                          HSD: {new Date(batch.expiryDate).toLocaleDateString('vi-VN')}
                        </BatchInfoItem>
                      )}
                      {batch.supplier && (
                        <BatchInfoItem>
                          NCC: {batch.supplier}
                        </BatchInfoItem>
                      )}
                    </BatchInfo>

                    <BatchFooter>
                      <AvailableQty>
                        Tồn: <strong>{batch.quantity}</strong>
                      </AvailableQty>
                      
                      <QuantityInput>
                        <QuantityLabel>Xuất:</QuantityLabel>
                        <Input
                          type="number"
                          min="0"
                          max={batch.quantity}
                          value={selectedQty}
                          onChange={(e) => handleBatchQuantityChange(
                            batch.batchNumber,
                            parseInt(e.target.value) || 0
                          )}
                          disabled={expired}
                        />
                      </QuantityInput>

                      {selectedQty > 0 && (
                        <SelectedBadge>
                          <FiCheck /> Đã chọn
                        </SelectedBadge>
                      )}
                    </BatchFooter>

                    {batch.notes && (
                      <BatchNotes>{batch.notes}</BatchNotes>
                    )}
                  </BatchItem>
                );
              })
            )}
          </BatchList>
        </Content>

        <Footer>
          <CancelButton onClick={onClose}>Hủy</CancelButton>
          <ConfirmButton 
            onClick={handleConfirm}
            disabled={totalSelected !== requiredQuantity}
          >
            <FiCheck /> Xác nhận ({totalSelected}/{requiredQuantity})
          </ConfirmButton>
        </Footer>
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
  max-width: 800px;
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
    font-size: 24px;
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

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const InfoBar = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const InfoValue = styled.div<{ status?: 'success' | 'warning' }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => {
    if (props.status === 'success') return '#059669';
    if (props.status === 'warning') return '#d97706';
    return '#111827';
  }};
`;

const AutoFillButton = styled.button`
  margin-left: auto;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #2563eb;
  }
`;

const BatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BatchItem = styled.div<{ disabled?: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.disabled ? '#fee2e2' : '#e5e7eb'};
  border-radius: 12px;
  background: ${props => props.disabled ? '#fef2f2' : 'white'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.disabled ? '#fee2e2' : '#3b82f6'};
  }
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BatchNumber = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  font-family: 'Courier New', monospace;
`;

const ExpiredBadge = styled.div`
  padding: 4px 10px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const ExpiringSoonBadge = styled.div`
  padding: 4px 10px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const BatchInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
`;

const BatchInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  
  svg {
    color: #9ca3af;
  }
`;

const BatchFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AvailableQty = styled.div`
  font-size: 14px;
  color: #6b7280;
  
  strong {
    color: #111827;
    font-size: 16px;
  }
`;

const QuantityInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const Input = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const SelectedBadge = styled.div`
  margin-left: auto;
  padding: 6px 12px;
  background: #d1fae5;
  color: #059669;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BatchNotes = styled.div`
  margin-top: 12px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
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

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 2px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  background: #10b981;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: #059669;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default BatchSelectionModal;
