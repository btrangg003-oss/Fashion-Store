import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiPlus, FiCamera, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { SerialInfo } from '@/models/inventory';

interface SerialNumberInputProps {
  productSku: string;
  productName: string;
  requiredQuantity: number;
  availableSerials?: SerialInfo[];
  onSerialChange: (serials: string[]) => void;
  mode?: 'inbound' | 'outbound';
}

const SerialNumberInput: React.FC<SerialNumberInputProps> = ({
  productSku,
  productName,
  requiredQuantity,
  availableSerials = [],
  onSerialChange,
  mode = 'outbound'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    onSerialChange(selectedSerials);
  }, [selectedSerials]);

  const handleAddSerial = () => {
    const serial = inputValue.trim().toUpperCase();
    
    if (!serial) {
      setError('Vui lòng nhập serial number');
      return;
    }

    // Check duplicate in current selection
    if (selectedSerials.includes(serial)) {
      setError('Serial number đã được thêm');
      return;
    }

    // For outbound: check if serial is available
    if (mode === 'outbound') {
      const availableSerial = availableSerials.find(s => s.serialNumber === serial);
      if (!availableSerial) {
        setError('Serial number không tồn tại trong kho');
        return;
      }
      if (availableSerial.status !== 'available') {
        setError(`Serial number đã được ${getStatusLabel(availableSerial.status)}`);
        return;
      }
    }

    // For inbound: check if serial already exists in system
    if (mode === 'inbound') {
      const existingSerial = availableSerials.find(s => s.serialNumber === serial);
      if (existingSerial) {
        setError('Serial number đã tồn tại trong hệ thống');
        return;
      }
    }

    // Check if reached required quantity
    if (selectedSerials.length >= requiredQuantity) {
      setError(`Đã đủ ${requiredQuantity} serial numbers`);
      return;
    }

    setSelectedSerials([...selectedSerials, serial]);
    setInputValue('');
    setError('');
  };

  const handleRemoveSerial = (serial: string) => {
    setSelectedSerials(selectedSerials.filter(s => s !== serial));
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSerial();
    }
  };

  const handleScan = () => {
    // TODO: Implement barcode scanner integration
    alert('Tính năng quét barcode đang được phát triển');
  };

  const handleBulkInput = () => {
    const serials = prompt('Nhập nhiều serial numbers (mỗi serial một dòng):');
    if (!serials) return;

    const serialList = serials
      .split('\n')
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);

    let added = 0;
    let errors: string[] = [];

    for (const serial of serialList) {
      if (selectedSerials.includes(serial)) {
        errors.push(`${serial}: Đã tồn tại`);
        continue;
      }

      if (mode === 'outbound') {
        const availableSerial = availableSerials.find(s => s.serialNumber === serial);
        if (!availableSerial || availableSerial.status !== 'available') {
          errors.push(`${serial}: Không khả dụng`);
          continue;
        }
      }

      if (selectedSerials.length + added >= requiredQuantity) {
        errors.push(`Đã đủ ${requiredQuantity} serial numbers`);
        break;
      }

      selectedSerials.push(serial);
      added++;
    }

    setSelectedSerials([...selectedSerials]);

    if (errors.length > 0) {
      alert(`Đã thêm ${added} serial numbers.\n\nLỗi:\n${errors.join('\n')}`);
    } else {
      alert(`Đã thêm ${added} serial numbers thành công!`);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      available: 'khả dụng',
      sold: 'bán',
      returned: 'trả lại',
      damaged: 'hỏng'
    };
    return labels[status] || status;
  };

  const progress = (selectedSerials.length / requiredQuantity) * 100;
  const isComplete = selectedSerials.length === requiredQuantity;

  return (
    <Container>
      <Header>
        <HeaderTitle>
          <Title>Serial Numbers</Title>
          <Subtitle>{productName} ({productSku})</Subtitle>
        </HeaderTitle>
        <ProgressInfo complete={isComplete}>
          {selectedSerials.length} / {requiredQuantity}
          {isComplete && <FiCheck />}
        </ProgressInfo>
      </Header>

      <ProgressBar>
        <ProgressFill progress={progress} complete={isComplete} />
      </ProgressBar>

      <InputSection>
        <InputRow>
          <InputWrapper>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập hoặc quét serial number..."
              disabled={isComplete}
            />
            <AddButton onClick={handleAddSerial} disabled={isComplete}>
              <FiPlus /> Thêm
            </AddButton>
          </InputWrapper>
          
          <ActionButtons>
            <ScanButton onClick={handleScan} disabled={isComplete}>
              <FiCamera /> Quét
            </ScanButton>
            <BulkButton onClick={handleBulkInput} disabled={isComplete}>
              📋 Nhập nhiều
            </BulkButton>
          </ActionButtons>
        </InputRow>

        {error && (
          <ErrorMessage>
            <FiAlertCircle /> {error}
          </ErrorMessage>
        )}
      </InputSection>

      {selectedSerials.length > 0 && (
        <SerialList>
          <ListHeader>
            <ListTitle>Danh sách Serial Numbers ({selectedSerials.length})</ListTitle>
            {!isComplete && (
              <HintText>Còn thiếu {requiredQuantity - selectedSerials.length}</HintText>
            )}
          </ListHeader>
          
          <SerialGrid>
            {selectedSerials.map((serial, index) => (
              <SerialChip key={serial}>
                <SerialNumber>
                  <SerialIndex>{index + 1}.</SerialIndex>
                  {serial}
                </SerialNumber>
                <RemoveButton onClick={() => handleRemoveSerial(serial)}>
                  <FiX />
                </RemoveButton>
              </SerialChip>
            ))}
          </SerialGrid>
        </SerialList>
      )}

      {mode === 'outbound' && availableSerials.length > 0 && (
        <AvailableSection>
          <SectionTitle>Serial Numbers khả dụng ({availableSerials.filter(s => s.status === 'available').length})</SectionTitle>
          <AvailableGrid>
            {availableSerials
              .filter(s => s.status === 'available')
              .slice(0, 10)
              .map((serial) => (
                <AvailableChip
                  key={serial.serialNumber}
                  onClick={() => {
                    if (!isComplete && !selectedSerials.includes(serial.serialNumber)) {
                      setSelectedSerials([...selectedSerials, serial.serialNumber]);
                      setError('');
                    }
                  }}
                  disabled={isComplete || selectedSerials.includes(serial.serialNumber)}
                >
                  {serial.serialNumber}
                </AvailableChip>
              ))}
          </AvailableGrid>
          {availableSerials.filter(s => s.status === 'available').length > 10 && (
            <MoreText>Và {availableSerials.filter(s => s.status === 'available').length - 10} serial khác...</MoreText>
          )}
        </AvailableSection>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const Subtitle = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const ProgressInfo = styled.div<{ complete: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.complete ? '#059669' : '#3b82f6'};
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #059669;
  }
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number; complete: boolean }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.complete ? '#10b981' : '#3b82f6'};
  transition: all 0.3s ease;
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  gap: 8px;
  min-width: 300px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const AddButton = styled.button`
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ScanButton = styled.button`
  padding: 10px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #059669;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BulkButton = styled.button`
  padding: 10px 16px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: #7c3aed;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 10px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SerialList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ListTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const HintText = styled.div`
  font-size: 13px;
  color: #d97706;
  font-weight: 500;
`;

const SerialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
`;

const SerialChip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  gap: 8px;
`;

const SerialNumber = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #1e40af;
  font-family: 'Courier New', monospace;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SerialIndex = styled.span`
  color: #6b7280;
  font-weight: 400;
`;

const RemoveButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #fecaca;
  }
`;

const AvailableSection = styled.div`
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

const AvailableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
`;

const AvailableChip = styled.button<{ disabled?: boolean }>`
  padding: 8px 12px;
  background: ${props => props.disabled ? '#f3f4f6' : 'white'};
  border: 1px solid ${props => props.disabled ? '#d1d5db' : '#d1d5db'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.disabled ? '#9ca3af' : '#374151'};
  font-family: 'Courier New', monospace;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1e40af;
  }
`;

const MoreText = styled.div`
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
`;

export default SerialNumberInput;
