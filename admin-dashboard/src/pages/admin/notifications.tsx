import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { 
  FiBell, FiCheck, FiX, FiAlertCircle, FiInfo, 
  FiCheckCircle, FiFilter, FiTrash2 
} from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!confirm('Xóa tất cả thông báo?')) return;
    
    try {
      await fetch('/api/admin/notifications/clear', { method: 'DELETE' });
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <FiCheckCircle />;
      case 'warning': return <FiAlertCircle />;
      case 'error': return <FiX />;
      default: return <FiInfo />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  if (loading) return <ResponsiveAdminLayout><Loading>Đang tải...</Loading></ResponsiveAdminLayout>;

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <TitleSection>
            <Title>
              <FiBell /> Thông Báo
              {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
            </Title>
          </TitleSection>
          <Actions>
            <ActionButton onClick={markAllAsRead} disabled={unreadCount === 0}>
              <FiCheck /> Đánh dấu tất cả đã đọc
            </ActionButton>
            <ActionButton onClick={clearAll} variant="danger">
              <FiTrash2 /> Xóa tất cả
            </ActionButton>
          </Actions>
        </Header>

        <Filters>
          <FilterGroup>
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
            >
              Tất cả ({notifications.length})
            </FilterButton>
            <FilterButton
              active={filter === 'unread'}
              onClick={() => setFilter('unread')}
            >
              Chưa đọc ({unreadCount})
            </FilterButton>
            <FilterButton
              active={filter === 'read'}
              onClick={() => setFilter('read')}
            >
              Đã đọc ({notifications.length - unreadCount})
            </FilterButton>
          </FilterGroup>

          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Tất cả loại</option>
            <option value="info">Thông tin</option>
            <option value="success">Thành công</option>
            <option value="warning">Cảnh báo</option>
            <option value="error">Lỗi</option>
          </Select>
        </Filters>

        <NotificationsList>
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <EmptyState
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FiBell size={48} />
                <EmptyText>Không có thông báo</EmptyText>
              </EmptyState>
            ) : (
              filteredNotifications.map((notification, index) => (
                <NotificationCard
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  unread={!notification.read}
                >
                  <NotificationIcon color={getColor(notification.type)}>
                    {getIcon(notification.type)}
                  </NotificationIcon>
                  
                  <NotificationContent>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationTime>
                      {new Date(notification.timestamp).toLocaleString('vi-VN')}
                    </NotificationTime>
                  </NotificationContent>

                  <NotificationActions>
                    {!notification.read && (
                      <IconButton
                        onClick={() => markAsRead(notification.id)}
                        title="Đánh dấu đã đọc"
                      >
                        <FiCheck />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => deleteNotification(notification.id)}
                      title="Xóa"
                      variant="danger"
                    >
                      <FiTrash2 />
                    </IconButton>
                  </NotificationActions>
                </NotificationCard>
              ))
            )}
          </AnimatePresence>
        </NotificationsList>
      </Container>
    </ResponsiveAdminLayout>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 0.5rem;
  background: #ef4444;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.variant === 'danger' ? '#ef4444' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.variant === 'danger' ? '#dc2626' : '#2563eb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Filters = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: 1px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationCard = styled(motion.div)<{ unread: boolean }>`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: ${props => props.unread ? '#eff6ff' : 'white'};
  border: 1px solid ${props => props.unread ? '#3b82f6' : '#e5e7eb'};
  border-left: 4px solid ${props => props.unread ? '#3b82f6' : 'transparent'};
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const NotificationIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const NotificationMessage = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.5rem;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
`;

const IconButton = styled.button<{ variant?: string }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.variant === 'danger' ? '#fee2e2' : '#f3f4f6'};
  color: ${props => props.variant === 'danger' ? '#ef4444' : '#6b7280'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.variant === 'danger' ? '#fecaca' : '#e5e7eb'};
  }
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
`;

const EmptyText = styled.p`
  margin-top: 1rem;
  font-size: 1.125rem;
  color: #6b7280;
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;
