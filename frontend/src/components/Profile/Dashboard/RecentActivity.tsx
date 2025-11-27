import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

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

const Timeline = styled.div`
  position: relative;
  padding-left: 40px;

  &:before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #e5e7eb;
  }
`;

const ActivityItem = styled(motion.div)`
  position: relative;
  margin-bottom: 24px;
  cursor: pointer;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    .activity-content {
      background: #f9fafb;
    }
  }
`;

const ActivityIcon = styled.div`
  position: absolute;
  left: -32px;
  top: 0;
  width: 32px;
  height: 32px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 1;
`;

const ActivityContent = styled.div`
  padding: 12px;
  border-radius: 8px;
  transition: background 0.2s ease;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

const ActivityDescription = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #999;
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

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return past.toLocaleDateString('vi-VN');
}

export const RecentActivity: React.FC = () => {
  const { data, error } = useSWR('/api/profile/recent-activity', fetcher);

  if (!data) {
    return (
      <Container>
        <Header>
          <Title><FiClock />Hoạt động gần đây</Title>
        </Header>
        <LoadingState>Đang tải...</LoadingState>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <Title><FiClock />Hoạt động gần đây</Title>
        </Header>
        <EmptyState>Không thể tải hoạt động</EmptyState>
      </Container>
    );
  }

  const activities = data.activities || [];

  return (
    <Container>
      <Header>
        <Title>
          <FiClock />
          Hoạt động gần đây
        </Title>
      </Header>

      {activities.length === 0 ? (
        <EmptyState>
          <FiClock />
          <div>Chưa có hoạt động nào</div>
        </EmptyState>
      ) : (
        <Timeline>
          {activities.map((activity: any, index: number) => (
            <Link key={activity.id} href={activity.link || '#'} passHref legacyBehavior>
              <ActivityItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ActivityIcon>{activity.icon}</ActivityIcon>
                <ActivityContent className="activity-content">
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDescription>{activity.description}</ActivityDescription>
                  <ActivityTime>{formatTimeAgo(activity.timestamp)}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            </Link>
          ))}
        </Timeline>
      )}
    </Container>
  );
};
