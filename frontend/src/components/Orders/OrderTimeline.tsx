import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';

interface TimelineItem {
  status: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

interface OrderTimelineProps {
  currentStatus: string;
  history?: TimelineItem[];
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, history }) => {
  const defaultTimeline = [
    { status: 'pending', label: 'Chờ xác nhận', icon: FiClock },
    { status: 'processing', label: 'Đang xử lý', icon: FiPackage },
    { status: 'shipping', label: 'Đang giao hàng', icon: FiTruck },
    { status: 'delivered', label: 'Đã giao hàng', icon: FiCheckCircle }
  ];

  const statusOrder = ['pending', 'processing', 'shipping', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <Container>
      <TimelineWrapper>
        {defaultTimeline.map((item, index) => {
          const Icon = item.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isCancelled = currentStatus === 'cancelled';

          return (
            <TimelineItem key={item.status}>
              <IconWrapper
                isCompleted={isCompleted && !isCancelled}
                isCurrent={isCurrent && !isCancelled}
                isCancelled={isCancelled}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Icon />
              </IconWrapper>
              <Label isCompleted={isCompleted && !isCancelled}>
                {item.label}
              </Label>
              {index < defaultTimeline.length - 1 && (
                <Line isCompleted={isCompleted && !isCancelled} />
              )}
            </TimelineItem>
          );
        })}
      </TimelineWrapper>

      {currentStatus === 'cancelled' && (
        <CancelledBanner
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiXCircle />
          <span>Đơn hàng đã bị hủy</span>
        </CancelledBanner>
      )}

      {history && history.length > 0 && (
        <HistorySection>
          <HistoryTitle>Lịch sử cập nhật</HistoryTitle>
          {history.map((item, index) => (
            <HistoryItem
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <HistoryDot />
              <HistoryContent>
                <HistoryStatus>{item.description}</HistoryStatus>
                <HistoryTime>
                  {new Date(item.timestamp).toLocaleString('vi-VN')}
                </HistoryTime>
              </HistoryContent>
            </HistoryItem>
          ))}
        </HistorySection>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const TimelineWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const TimelineItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;
    gap: 1rem;
  }
`;

const IconWrapper = styled(motion.div)<{ 
  isCompleted: boolean; 
  isCurrent: boolean;
  isCancelled: boolean;
}>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: ${props => {
    if (props.isCancelled) return '#fee';
    if (props.isCompleted) return 'linear-gradient(135deg, #667eea, #764ba2)';
    return '#f5f5f5';
  }};
  color: ${props => {
    if (props.isCancelled) return '#e74c3c';
    if (props.isCompleted) return 'white';
    return '#999';
  }};
  border: 3px solid ${props => {
    if (props.isCancelled) return '#e74c3c';
    if (props.isCurrent) return '#667eea';
    if (props.isCompleted) return '#667eea';
    return '#ddd';
  }};
  box-shadow: ${props => props.isCurrent ? '0 0 0 4px rgba(102, 126, 234, 0.2)' : 'none'};
  transition: all 0.3s ease;
  z-index: 2;
`;

const Label = styled.div<{ isCompleted: boolean }>`
  margin-top: 0.75rem;
  font-size: 0.9rem;
  font-weight: ${props => props.isCompleted ? '600' : '500'};
  color: ${props => props.isCompleted ? '#333' : '#999'};
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 0;
    text-align: left;
  }
`;

const Line = styled.div<{ isCompleted: boolean }>`
  position: absolute;
  top: 30px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: ${props => props.isCompleted 
    ? 'linear-gradient(90deg, #667eea, #764ba2)' 
    : '#e0e0e0'
  };
  z-index: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CancelledBanner = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fee;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 1.5rem;

  svg {
    font-size: 1.25rem;
  }
`;

const HistorySection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #f0f0f0;
`;

const HistoryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const HistoryItem = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 7px;
    top: 20px;
    width: 2px;
    height: calc(100% + 1rem);
    background: #e0e0e0;
  }
`;

const HistoryDot = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #667eea;
  flex-shrink: 0;
  margin-top: 4px;
  z-index: 1;
`;

const HistoryContent = styled.div`
  flex: 1;
`;

const HistoryStatus = styled.div`
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const HistoryTime = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

export default OrderTimeline;
