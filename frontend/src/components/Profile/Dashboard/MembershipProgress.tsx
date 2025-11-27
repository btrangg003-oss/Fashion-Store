import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Container = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: white;
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
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TierBadge = styled.div`
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
`;

const ProgressSection = styled.div`
  margin-bottom: 24px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const ProgressFill = styled(motion.div)<{ $percentage: number }>`
  height: 100%;
  background: white;
  border-radius: 6px;
  width: ${props => props.$percentage}%;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  opacity: 0.9;
`;

const NextTierSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const NextTierTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PointsNeeded = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  
  li {
    padding: 4px 0;
    
    &:before {
      content: '✓ ';
      margin-right: 8px;
    }
  }
`;

const MaxTierMessage = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  
  svg {
    font-size: 48px;
    margin-bottom: 12px;
  }
`;

const LoadingState = styled.div`
  padding: 40px;
  text-align: center;
`;

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export const MembershipProgress: React.FC = () => {
  const { data, error } = useSWR('/api/profile/membership-progress', fetcher);

  if (!data) {
    return (
      <Container>
        <LoadingState>Đang tải...</LoadingState>
      </Container>
    );
  }

  const { currentTier, nextTier, currentPoints, pointsToNext, progress } = data;

  return (
    <Container>
      <Header>
        <Title>
          <FiAward />
          Hạng thành viên
        </Title>
        <TierBadge>{currentTier.name}</TierBadge>
      </Header>

      {nextTier ? (
        <>
          <ProgressSection>
            <ProgressBar>
              <ProgressFill
                $percentage={progress}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </ProgressBar>
            <ProgressText>
              <span>{currentPoints.toLocaleString()} điểm</span>
              <span>{nextTier.minPoints.toLocaleString()} điểm</span>
            </ProgressText>
          </ProgressSection>

          <NextTierSection>
            <NextTierTitle>
              <FiTrendingUp />
              Lên hạng {nextTier.name}
            </NextTierTitle>
            <PointsNeeded>
              Còn {pointsToNext.toLocaleString()} điểm
            </PointsNeeded>
            <div style={{ fontSize: '14px', marginBottom: '12px' }}>
              Quyền lợi khi lên hạng:
            </div>
            <BenefitsList>
              {nextTier.benefits.map((benefit: string, index: number) => (
                <li key={index}>{benefit}</li>
              ))}
            </BenefitsList>
          </NextTierSection>
        </>
      ) : (
        <MaxTierMessage>
          <FiAward />
          <div>Bạn đã đạt hạng cao nhất!</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>
            Cảm ơn bạn đã là khách hàng VIP
          </div>
        </MaxTierMessage>
      )}
    </Container>
  );
};
