import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiCheckSquare, FiPlus, FiPlay, FiCheck } from 'react-icons/fi';

const StockCheckPage = () => {
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/checks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setChecks(data.checks || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Chờ kiểm', color: '#6b7280' },
      in_progress: { label: 'Đang kiểm', color: '#3b82f6' },
      completed: { label: 'Hoàn thành', color: '#10b981' },
      approved: { label: 'Đã duyệt', color: '#8b5cf6' }
    };
    return config[status as keyof typeof config] || config.pending;
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingMessage>Đang tải...</LoadingMessage>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>✅ Kiểm Kho</Title>
          <AddButton>
            <FiPlus /> Tạo phiên kiểm kho
          </AddButton>
        </Header>

        <ChecksList>
          {checks.map(check => {
            const statusConfig = getStatusBadge(check.status);
            return (
              <CheckCard key={check.id}>
                <CheckHeader>
                  <CheckInfo>
                    <CheckName>{check.name}</CheckName>
                    <CheckDate>
                      Ngày: {new Date(check.scheduledDate).toLocaleDateString('vi-VN')}
                    </CheckDate>
                  </CheckInfo>
                  <StatusBadge color={statusConfig.color}>
                    {statusConfig.label}
                  </StatusBadge>
                </CheckHeader>

                <CheckStats>
                  <StatItem>
                    <StatLabel>Tổng sản phẩm</StatLabel>
                    <StatValue>{check.totalItems}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Đã kiểm</StatLabel>
                    <StatValue>{check.checkedItems}</StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Chênh lệch</StatLabel>
                    <StatValue color={check.discrepancies > 0 ? '#ef4444' : '#10b981'}>
                      {check.discrepancies}
                    </StatValue>
                  </StatItem>
                  <StatItem>
                    <StatLabel>Giá trị chênh</StatLabel>
                    <StatValue>
                      {check.totalDiscrepancyValue.toLocaleString()}₫
                    </StatValue>
                  </StatItem>
                </CheckStats>

                {check.description && (
                  <CheckDescription>{check.description}</CheckDescription>
                )}

                <CheckActions>
                  {check.status === 'pending' && (
                    <ActionButton primary>
                      <FiPlay /> Bắt đầu kiểm
                    </ActionButton>
                  )}
                  {check.status === 'in_progress' && (
                    <ActionButton>
                      Tiếp tục kiểm
                    </ActionButton>
                  )}
                  {check.status === 'completed' && (
                    <ActionButton success>
                      <FiCheck /> Duyệt phiếu
                    </ActionButton>
                  )}
                </CheckActions>
              </CheckCard>
            );
          })}
        </ChecksList>

        {checks.length === 0 && (
          <EmptyState>
            <EmptyIcon>✅</EmptyIcon>
            <EmptyText>Chưa có phiên kiểm kho nào</EmptyText>
            <AddButton>
              <FiPlus /> Tạo phiên kiểm kho đầu tiên
            </AddButton>
          </EmptyState>
        )}
      </Container>
    </AdminLayout>
  );
};

const Container = styled.div`padding: 24px; max-width: 1200px; margin: 0 auto;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;`;
const Title = styled.h1`font-size: 28px; font-weight: 700; color: #111827; margin: 0;`;
const AddButton = styled.button`display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; &:hover { background: #2563eb; }`;
const ChecksList = styled.div`display: flex; flex-direction: column; gap: 16px;`;
const CheckCard = styled.div`background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`;
const CheckHeader = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;`;
const CheckInfo = styled.div``;
const CheckName = styled.h3`font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 4px 0;`;
const CheckDate = styled.div`font-size: 14px; color: #6b7280;`;
const StatusBadge = styled.span<{ color: string }>`padding: 6px 12px; border-radius: 12px; font-size: 13px; font-weight: 600; background: ${props => props.color}15; color: ${props => props.color};`;
const CheckStats = styled.div`display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;`;
const StatItem = styled.div`text-align: center;`;
const StatLabel = styled.div`font-size: 12px; color: #6b7280; margin-bottom: 4px;`;
const StatValue = styled.div<{ color?: string }>`font-size: 20px; font-weight: 700; color: ${props => props.color || '#111827'};`;
const CheckDescription = styled.div`font-size: 14px; color: #6b7280; margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px;`;
const CheckActions = styled.div`display: flex; gap: 12px;`;
const ActionButton = styled.button<{ primary?: boolean; success?: boolean }>`padding: 10px 20px; background: ${props => props.primary ? '#3b82f6' : props.success ? '#10b981' : 'white'}; color: ${props => props.primary || props.success ? 'white' : '#374151'}; border: ${props => props.primary || props.success ? 'none' : '1px solid #d1d5db'}; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; &:hover { background: ${props => props.primary ? '#2563eb' : props.success ? '#059669' : '#f9fafb'}; }`;
const EmptyState = styled.div`text-align: center; padding: 80px 20px; background: white; border-radius: 12px;`;
const EmptyIcon = styled.div`font-size: 64px; margin-bottom: 16px;`;
const EmptyText = styled.div`font-size: 16px; color: #6b7280; margin-bottom: 24px;`;
const LoadingMessage = styled.div`text-align: center; padding: 80px 20px; font-size: 18px; color: #6b7280;`;

export default StockCheckPage;
