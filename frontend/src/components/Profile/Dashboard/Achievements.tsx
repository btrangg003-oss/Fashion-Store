import React from 'react';
import styled from 'styled-components';
import { FiAward, FiStar, FiTrendingUp, FiHeart } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AchievementsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
`;

const AchievementCard = styled(motion.div)<{ $unlocked: boolean }>`
  padding: 16px;
  border-radius: 12px;
  background: ${props => props.$unlocked 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : '#f8f9fa'};
  color: ${props => props.$unlocked ? 'white' : '#999'};
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  ${props => !props.$unlocked && `
    &::before {
      content: '🔒';
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 16px;
    }
  `}
`;

const AchievementIcon = styled.div<{ $unlocked: boolean }>`
  font-size: 32px;
  margin-bottom: 8px;
  filter: ${props => props.$unlocked ? 'none' : 'grayscale(100%)'};
`;

const AchievementName = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const AchievementDesc = styled.div`
  font-size: 11px;
  opacity: 0.8;
`;

const ProgressText = styled.div`
  font-size: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

export const Achievements: React.FC = () => {
  const achievements = [
    {
      id: 'first-order',
      icon: '🎉',
      name: 'Đơn đầu tiên',
      description: 'Hoàn thành đơn hàng đầu tiên',
      unlocked: true,
      progress: '1/1'
    },
    {
      id: 'loyal-customer',
      icon: '💎',
      name: 'Khách hàng thân thiết',
      description: 'Mua 10 đơn hàng',
      unlocked: true,
      progress: '10/10'
    },
    {
      id: 'reviewer',
      icon: '⭐',
      name: 'Người đánh giá',
      description: 'Viết 5 đánh giá',
      unlocked: false,
      progress: '2/5'
    },
    {
      id: 'wishlist-master',
      icon: '❤️',
      name: 'Yêu thích',
      description: 'Thêm 20 sản phẩm yêu thích',
      unlocked: false,
      progress: '8/20'
    },
    {
      id: 'big-spender',
      icon: '💰',
      name: 'Người chi tiêu',
      description: 'Chi tiêu 10 triệu',
      unlocked: false,
      progress: '3.5M/10M'
    },
    {
      id: 'early-bird',
      icon: '🌅',
      name: 'Dậy sớm',
      description: 'Mua hàng trước 8h sáng',
      unlocked: false,
      progress: '0/1'
    }
  ];

  return (
    <Container>
      <Title>
        <FiAward />
        Thành tựu
      </Title>
      <AchievementsGrid>
        {achievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            $unlocked={achievement.unlocked}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <AchievementIcon $unlocked={achievement.unlocked}>
              {achievement.icon}
            </AchievementIcon>
            <AchievementName>{achievement.name}</AchievementName>
            <AchievementDesc>{achievement.description}</AchievementDesc>
            {!achievement.unlocked && (
              <ProgressText>{achievement.progress}</ProgressText>
            )}
          </AchievementCard>
        ))}
      </AchievementsGrid>
    </Container>
  );
};
