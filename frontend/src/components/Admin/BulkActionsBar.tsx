import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCheck, FiX, FiDownload, FiTruck, FiTrash2 } from 'react-icons/fi';

interface BulkActionsBarProps {
  selectedCount: number;
  onUpdateStatus: (status: string) => void;
  onDelete: () => void;
  onExport: () => void;
  onAssignShipping: () => void;
  onClear: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onUpdateStatus,
  onDelete,
  onExport,
  onAssignShipping,
  onClear
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <Container>
      <Info>
        <FiCheck /> Đã chọn {selectedCount} đơn hàng
      </Info>
      
      <Actions>
        <ActionButton onClick={() => setShowStatusMenu(!showStatusMenu)}>
          Cập nhật trạng thái
        </ActionButton>
        
        {showStatusMenu && (
          <StatusMenu>
            <MenuItem onClick={() => { onUpdateStatus('processing'); setShowStatusMenu(false); }}>
              Đang xử lý
            </MenuItem>
            <MenuItem onClick={() => { onUpdateStatus('shipped'); setShowStatusMenu(false); }}>
              Đã giao vận chuyển
            </MenuItem>
            <MenuItem onClick={() => { onUpdateStatus('delivered'); setShowStatusMenu(false); }}>
              Đã giao hàng
            </MenuItem>
            <MenuItem onClick={() => { onUpdateStatus('cancelled'); setShowStatusMenu(false); }}>
              Đã hủy
            </MenuItem>
          </StatusMenu>
        )}
        
        <ActionButton onClick={onAssignShipping}>
          <FiTruck /> Phân công vận chuyển
        </ActionButton>
        
        <ActionButton onClick={onExport}>
          <FiDownload /> Xuất Excel
        </ActionButton>
        
        <ActionButton $danger onClick={onDelete}>
          <FiTrash2 /> Xóa
        </ActionButton>
        
        <ActionButton onClick={onClear}>
          <FiX /> Bỏ chọn
        </ActionButton>
      </Actions>
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 2rem;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(100px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
`;

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #3b82f6;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  position: relative;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$danger ? '#ef4444' : '#f3f4f6'};
  color: ${props => props.$danger ? 'white' : '#1f2937'};
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$danger ? '#dc2626' : '#e5e7eb'};
    transform: translateY(-2px);
  }
`;

const StatusMenu = styled.div`
  position: absolute;
  top: -180px;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  overflow: hidden;
  min-width: 200px;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background: white;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

export default BulkActionsBar;
