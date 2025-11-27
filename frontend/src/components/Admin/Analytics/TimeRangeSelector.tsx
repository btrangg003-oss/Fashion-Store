import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar, FiX } from 'react-icons/fi';
import type { TimeRange } from '@/models/analytics';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as TimeRange['type'];
    
    if (type === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      onChange({ type });
      
      // Save to localStorage
      localStorage.setItem('analytics_timeRange', type);
    }
  };

  const handleApplyCustomRange = () => {
    if (customStart && customEnd) {
      onChange({
        type: 'custom',
        startDate: customStart,
        endDate: customEnd
      });
      
      // Save to localStorage
      localStorage.setItem('analytics_timeRange', 'custom');
      localStorage.setItem('analytics_customStart', customStart.toISOString());
      localStorage.setItem('analytics_customEnd', customEnd.toISOString());
      
      setShowCustomPicker(false);
    }
  };

  const handleCancelCustomRange = () => {
    setShowCustomPicker(false);
    setCustomStart(null);
    setCustomEnd(null);
  };

  return (
    <Container>
      <Select value={value.type} onChange={handleSelectChange}>
        <option value="week">Tuần này</option>
        <option value="month">Tháng này</option>
        <option value="quarter">Quý này</option>
        <option value="year">Năm này</option>
        <option value="custom">Tùy chỉnh</option>
      </Select>

      {showCustomPicker && (
        <CustomPickerModal>
          <ModalOverlay onClick={handleCancelCustomRange} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Chọn khoảng thời gian</ModalTitle>
              <CloseButton onClick={handleCancelCustomRange}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <DatePickerGroup>
                <DatePickerLabel>
                  <FiCalendar />
                  Từ ngày
                </DatePickerLabel>
                <DatePickerWrapper>
                  <DatePicker
                    selected={customStart}
                    onChange={(date: any) => setCustomStart(date)}
                    selectsStart
                    startDate={customStart}
                    endDate={customEnd}
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày bắt đầu"
                  />
                </DatePickerWrapper>
              </DatePickerGroup>

              <DatePickerGroup>
                <DatePickerLabel>
                  <FiCalendar />
                  Đến ngày
                </DatePickerLabel>
                <DatePickerWrapper>
                  <DatePicker
                    selected={customEnd}
                    onChange={(date: any) => setCustomEnd(date)}
                    selectsEnd
                    startDate={customStart}
                    endDate={customEnd}
                    minDate={customStart || undefined}
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày kết thúc"
                  />
                </DatePickerWrapper>
              </DatePickerGroup>
            </ModalBody>

            <ModalFooter>
              <CancelButton onClick={handleCancelCustomRange}>
                Hủy
              </CancelButton>
              <ApplyButton 
                onClick={handleApplyCustomRange}
                disabled={!customStart || !customEnd}
              >
                Áp dụng
              </ApplyButton>
            </ModalFooter>
          </ModalContent>
        </CustomPickerModal>
      )}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;

const Select = styled.select`
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;

  &:hover {
    border-color: #667eea;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const CustomPickerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  z-index: 1001;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #111827;
  }

  svg {
    font-size: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DatePickerGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DatePickerLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;

  svg {
    font-size: 16px;
    color: #6b7280;
  }
`;

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #111827;
    transition: all 0.2s;

    &:hover {
      border-color: #667eea;
    }

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const ApplyButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default TimeRangeSelector;
