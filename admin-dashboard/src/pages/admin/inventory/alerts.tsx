import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiAlertCircle, FiCheck, FiFilter } from 'react-icons/fi';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/inventory/alerts/${id}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unresolved') return !alert.isResolved;
    return alert.type === filter;
  });

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: '#ef4444',
      high: '#f59e0b',
      medium: '#3b82f6',
      low: '#6b7280'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
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
          <Title>🔔 Cảnh Báo Kho Hàng</Title>
        </Header>

        <Toolbar>
          <FilterGroup>
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
              Tất cả ({alerts.length})
            </FilterButton>
            <FilterButton active={filter === 'unresolved'} onClick={() => setFilter('unresolved')}>
              Chưa xử lý ({alerts.filter(a => !a.isResolved).length})
            </FilterButton>
            <FilterButton active={filter === 'low_stock'} onClick={() => setFilter('low_stock')}>
              Sắp hết hàng
            </FilterButton>
            <FilterButton active={filter === 'overstock'} onClick={() => setFilter('overstock')}>
              Tồn nhiều
            </FilterButton>
          </FilterGroup>
        </Toolbar>

        <AlertsList>
          {filteredAlerts.map(alert => (
            <AlertCard key={alert.id} resolved={alert.isResolved}>
              <AlertIcon color={getSeverityColor(alert.severity)}>
                <FiAlertCircle />
              </AlertIcon>
              
              <AlertContent>
                <AlertHeader>
                  <AlertTitle>{alert.message}</AlertTitle>
                  <SeverityBadge color={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </SeverityBadge>
                </AlertHeader>
                
                <AlertDetails>
                  SKU: {alert.sku} | {alert.productName}
                  {alert.currentQuantity !== undefined && (
                    <> | Số lượng: {alert.currentQuantity}</>
                  )}
                </AlertDetails>
                
                <AlertTime>
                  {new Date(alert.createdAt).toLocaleString('vi-VN')}
                </AlertTime>
              </AlertContent>

              {!alert.isResolved && (
                <ResolveButton onClick={() => handleResolve(alert.id)}>
                  <FiCheck /> Đã xử lý
                </ResolveButton>
              )}
            </AlertCard>
          ))}
        </AlertsList>

        {filteredAlerts.length === 0 && (
          <EmptyState>
            <EmptyIcon>✅</EmptyIcon>
            <EmptyText>Không có cảnh báo nào</EmptyText>
          </EmptyState>
        )}
      </Container>
    </AdminLayout>
  );
};

const Container = styled.div`padding: 24px; max-width: 1200px; margin: 0 auto;`;
const Header = styled.div`margin-bottom: 24px;`;
const Title = styled.h1`font-size: 28px; font-weight: 700; color: #111827; margin: 0;`;
const Toolbar = styled.div`background: white; border-radius: 12px; padding: 16px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`;
const FilterGroup = styled.div`display: flex; gap: 8px; flex-wrap: wrap;`;
const FilterButton = styled.button<{ active: boolean }>`padding: 8px 16px; background: ${props => props.active ? '#3b82f6' : 'white'}; color: ${props => props.active ? 'white' : '#6b7280'}; border: 1px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'}; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; &:hover { border-color: #3b82f6; }`;
const AlertsList = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const AlertCard = styled.div<{ resolved: boolean }>`background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); opacity: ${props => props.resolved ? 0.6 : 1};`;
const AlertIcon = styled.div<{ color: string }>`width: 48px; height: 48px; border-radius: 50%; background: ${props => props.color}15; color: ${props => props.color}; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0;`;
const AlertContent = styled.div`flex: 1;`;
const AlertHeader = styled.div`display: flex; align-items: center; gap: 12px; margin-bottom: 8px;`;
const AlertTitle = styled.div`font-size: 16px; font-weight: 600; color: #111827;`;
const SeverityBadge = styled.span<{ color: string }>`padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: ${props => props.color}15; color: ${props => props.color};`;
const AlertDetails = styled.div`font-size: 14px; color: #6b7280; margin-bottom: 4px;`;
const AlertTime = styled.div`font-size: 12px; color: #9ca3af;`;
const ResolveButton = styled.button`padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; &:hover { background: #059669; }`;
const EmptyState = styled.div`text-align: center; padding: 80px 20px; background: white; border-radius: 12px;`;
const EmptyIcon = styled.div`font-size: 64px; margin-bottom: 16px;`;
const EmptyText = styled.div`font-size: 16px; color: #6b7280;`;
const LoadingMessage = styled.div`text-align: center; padding: 80px 20px; font-size: 18px; color: #6b7280;`;

export default AlertsPage;
