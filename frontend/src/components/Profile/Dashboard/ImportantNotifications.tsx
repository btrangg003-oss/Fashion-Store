import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { FiBell } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  background: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationCard = styled(motion.div)<{ $priority: string }>`
  padding: 16px;
  border-left: 4px solid ${props => 
    props.$priority === 'high' ? '#ff6b6b' :
    props.$priority === 'medium' ? '#f59e0b' : '#3b82f6'
  };
  background: ${props => 
    props.$priority === 'high' ? '#fff5f5' :
    props.$priority === 'medium' ? '#fffbeb' : '#eff6ff'
  };
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  color: #666;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export const ImportantNotifications: React.FC = () => {
  const { data, error } = useSWR('/api/profile/notifications', fetcher, {
    refreshInterval: 30000
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  if (error) {
    return (
      <Container>
        <Header>
          <Title><FiBell />Thông báo quan trọng</Title>
        </Header>
        <EmptyState>Không thể tải thông báo</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiBell />
          Thông báo quan trọng
        </Title>
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </Header>

      {notifications.length === 0 ? (
        <EmptyState>
          <FiBell />
          <div>Không có thông báo mới</div>
          <div style={{ fontSize: '13px', marginTop: '8px', opacity: 0.7 }}>
            Bạn sẽ nhận được thông báo về đơn hàng, coupon và ưu đãi tại đây
          </div>
        </EmptyState>
      ) : (
        <NotificationsList>
          {notifications.map((notif: any, index: number) => (
            <NotificationCard
              key={notif.id}
              $priority={notif.priority}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NotificationHeader>
                <NotificationIcon>{notif.icon}</NotificationIcon>
                <NotificationContent>
                  <NotificationTitle>{notif.title}</NotificationTitle>
                  <NotificationMessage>{notif.message}</NotificationMessage>
                </NotificationContent>
              </NotificationHeader>
            </NotificationCard>
          ))}
        </NotificationsList>
      )}
    </Container>
  );
};
