import React from 'react';
import styled from 'styled-components';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { FiTarget, FiCheck } from 'react-icons/fi';
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

const Summary = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SummaryText = styled.div`
  font-size: 14px;
  
  strong {
    font-size: 24px;
    display: block;
    margin-top: 4px;
  }
`;

const MissionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MissionCard = styled(motion.div)<{ $completed: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.$completed ? '#10b981' : '#e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$completed ? '#f0fdf4' : 'white'};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$completed ? '#10b981' : '#d1d5db'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const MissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MissionInfo = styled.div`
  flex: 1;
`;

const MissionTitle = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MissionDescription = styled.div`
  font-size: 14px;
  color: #666;
`;

const MissionPoints = styled.div<{ $completed: boolean }>`
  background: ${props => props.$completed ? '#10b981' : '#f59e0b'};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled(motion.div)<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  width: ${props => props.$percentage}%;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  justify-content: space-between;
`;

const CompletedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #10b981;
  font-weight: 600;
  font-size: 14px;
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
`;

export const DailyMissions: React.FC = () => {
  const { missions, summary, isLoading, isError } = useDailyMissions();

  if (isLoading) {
    return (
      <Container>
        <LoadingState>Đang tải nhiệm vụ...</LoadingState>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container>
        <EmptyState>Không thể tải nhiệm vụ hàng ngày</EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiTarget />
          Nhiệm vụ hàng ngày
        </Title>
      </Header>

      <Summary>
        <SummaryText>
          Hoàn thành
          <strong>{summary.completed}/{summary.total}</strong>
        </SummaryText>
        <SummaryText style={{ textAlign: 'right' }}>
          Điểm đã nhận
          <strong>{summary.earnedPoints}/{summary.possiblePoints}</strong>
        </SummaryText>
      </Summary>

      <MissionsList>
        {missions.map((mission, index) => {
          const percentage = (mission.progress / mission.target) * 100;
          
          return (
            <MissionCard
              key={mission.id}
              $completed={mission.completed}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <MissionHeader>
                <MissionInfo>
                  <MissionTitle>
                    <span>{mission.icon}</span>
                    {mission.title}
                  </MissionTitle>
                  <MissionDescription>{mission.description}</MissionDescription>
                </MissionInfo>
                {mission.completed ? (
                  <CompletedBadge>
                    <FiCheck />
                    +{mission.points}
                  </CompletedBadge>
                ) : (
                  <MissionPoints $completed={false}>
                    +{mission.points} điểm
                  </MissionPoints>
                )}
              </MissionHeader>

              {!mission.completed && (
                <>
                  <ProgressBar>
                    <ProgressFill
                      $percentage={percentage}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </ProgressBar>
                  <ProgressText>
                    <span>Tiến độ: {mission.progress}/{mission.target}</span>
                    <span>{Math.round(percentage)}%</span>
                  </ProgressText>
                </>
              )}
            </MissionCard>
          );
        })}
      </MissionsList>
    </Container>
  );
};
