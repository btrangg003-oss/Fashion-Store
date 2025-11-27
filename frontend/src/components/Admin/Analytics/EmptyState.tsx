import React from 'react';
import styled from 'styled-components';
import { FiRefreshCw } from 'react-icons/fi';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  onRefresh?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Chưa có dữ liệu',
  message = 'Không có dữ liệu để hiển thị trong khoảng thời gian này',
  icon = '📊',
  onRefresh
}) => {
  return (
    <Container>
      <Icon>{icon}</Icon>
      <Title>{title}</Title>
      <Message>{message}</Message>
      {onRefresh && (
        <RefreshButton onClick={onRefresh}>
          <FiRefreshCw />
          Làm mới
        </RefreshButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  min-height: 300px;
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 1rem;
  opacity: 0.5;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

const Message = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  max-width: 400px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    font-size: 16px;
  }

  &:hover {
    background: #f9fafb;
    border-color: #667eea;
    color: #667eea;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default EmptyState;
