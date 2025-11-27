import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaStar, FaGift, FaHistory, FaChartLine, FaTasks } from 'react-icons/fa';
import { TierBenefit, PointTransaction, Mission } from '@/models/loyalty';
import { useProfileSync } from '@/contexts/ProfileSyncContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #991b1b;
`;

const TierCard = styled(motion.div) <{ $tierColor?: string }>`
  background: ${props => props.$tierColor
    ? `linear-gradient(135deg, ${props.$tierColor}dd, ${props.$tierColor})`
    : 'linear-gradient(135deg, #3b82f6, #a855f7)'};
  border-radius: 20px;
  padding: 2.5rem;
  color: white;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
`;

const TierHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
`;

const TierInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TierIcon = styled.div`
  font-size: 3rem;
`;

const TierDetails = styled.div``;

const TierName = styled.h2`
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
`;

const PointsDisplay = styled.div`
  font-size: 2rem;
  font-weight: 700;
  
  span {
    font-size: 1rem;
    opacity: 0.9;
    margin-left: 0.5rem;
  }
`;

const ProgressSection = styled.div`
  position: relative;
  z-index: 1;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.95;
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  height: 12px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div) <{ $progress: number }>`
  background: white;
  height: 100%;
  border-radius: 10px;
  width: ${props => props.$progress}%;
`;

const TabNav = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  font-weight: ${props => props.$active ? '600' : '400'};
  border-bottom: 3px solid ${props => props.$active ? '#3b82f6' : 'transparent'};
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #3b82f6;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color || '#3b82f6'}20;
  color: ${props => props.$color || '#3b82f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  margin: 0;
  color: #111827;
`;

const BenefitList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BenefitItem = styled.li`
  padding: 0.5rem 0;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  &::before {
    content: '✓';
    color: #22c55e;
    font-weight: bold;
  }
`;

const TransactionList = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const TransactionInfo = styled.div`
  flex: 1;
`;

const TransactionTitle = styled.div`
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const TransactionDate = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
`;

const TransactionPoints = styled.div<{ $type: string }>`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.$type === 'earn' ? '#22c55e' : '#ef4444'};
`;

const MissionCard = styled(Card)`
  position: relative;
  opacity: ${props => props.className?.includes('completed') ? 0.7 : 1};
`;

const MissionProgress = styled.div`
  margin-top: 1rem;
`;

const MissionProgressBar = styled.div`
  background: #e5e7eb;
  border-radius: 10px;
  height: 8px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const MissionProgressFill = styled(motion.div) <{ $progress: number }>`
  background: #3b82f6;
  height: 100%;
  width: ${props => props.$progress}%;
  border-radius: 10px;
`;

const MissionPoints = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #22c55e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

interface LoyaltyTabProps { }

const LoyaltyTab: React.FC<LoyaltyTabProps> = () => {
  const { loyaltyRefreshCount } = useProfileSync();
  const [activeTab, setActiveTab] = useState<'benefits' | 'history' | 'missions'>('benefits');
  const [loading, setLoading] = useState(true);
  const [loyaltyData, setLoyaltyData] = useState<any>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tierBenefits, setTierBenefits] = useState<TierBenefit[]>([]);

  useEffect(() => {
    fetchLoyaltyData();
  }, [loyaltyRefreshCount]);

  const getNextTier = (currentTier: string): string => {
    const tierMap: Record<string, string> = {
      'Bronze': 'silver',
      'Silver': 'gold',
      'Gold': 'platinum',
      'Platinum': 'platinum'
    };
    return tierMap[currentTier] || 'silver';
  };

  const calculateNextTierPoints = (currentPoints: number, currentTier: string): number => {
    const tierThresholds: Record<string, number> = {
      'Bronze': 1000,
      'Silver': 3000,
      'Gold': 5000,
      'Platinum': 999999
    };
    const nextThreshold = tierThresholds[currentTier] || 1000;
    return Math.max(0, nextThreshold - currentPoints);
  };

  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [loyaltyRes, transactionsRes, missionsRes, benefitsRes] = await Promise.all([
        fetch('/api/loyalty/points', { headers }),
        fetch('/api/loyalty/transactions', { headers }),
        fetch('/api/loyalty/missions', { headers }),
        fetch('/api/loyalty/tiers', { headers })
      ]);

      if (loyaltyRes.ok) {
        const data = await loyaltyRes.json();
        // Transform API response to match expected format
        const transformedData = {
          currentPoints: data.points || 0,
          lifetimePoints: data.totalEarned || data.points || 0,
          tier: data.tier?.toLowerCase() || 'bronze',
          tierName: data.tier || 'Bronze',
          nextTier: getNextTier(data.tier),
          nextTierPoints: calculateNextTierPoints(data.points || 0, data.tier)
        };
        setLoyaltyData(transformedData);
      } else {
        console.error('Loyalty points error:', loyaltyRes.status, await loyaltyRes.text());
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data);
      }

      if (missionsRes.ok) {
        const data = await missionsRes.json();
        setMissions(data);
      }

      if (benefitsRes.ok) {
        const data = await benefitsRes.json();
        setTierBenefits(data);
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Đang tải dữ liệu điểm thưởng...</div>
        </LoadingState>
      </Container>
    );
  }

  if (!loyaltyData) {
    return (
      <Container>
        <ErrorState>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Không thể tải dữ liệu</h3>
          <p style={{ margin: '0 0 1rem 0', opacity: 0.8 }}>Vui lòng thử lại sau</p>
          <button
            onClick={fetchLoyaltyData}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Thử lại
          </button>
        </ErrorState>
      </Container>
    );
  }

  // Tier colors mapping
  const tierColors: Record<string, string> = {
    'bronze': '#cd7f32',
    'silver': '#c0c0c0',
    'gold': '#ffd700',
    'platinum': '#e5e4e2'
  };

  const tierColorsGradient: Record<string, string> = {
    'bronze': '#cd7f32',  // Đồng
    'silver': '#c0c0c0',  // Bạc thật
    'gold': '#ffd700',    // Vàng
    'platinum': '#e5e4e2' // Bạch Kim
  };

  const currentTier = tierBenefits.find(t => t.tier === loyaltyData?.tier);
  const nextTier = tierBenefits.find(t => t.minPoints > (loyaltyData?.lifetimePoints || 0));
  const progress = nextTier
    ? (((loyaltyData?.lifetimePoints || 0) - (currentTier?.minPoints || 0)) / (nextTier.minPoints - (currentTier?.minPoints || 0))) * 100
    : 100;

  const currentTierColor = tierColorsGradient[loyaltyData?.tier || 'bronze'] || '#3b82f6';

  return (
    <Container>
      <TierCard
        $tierColor={currentTierColor}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TierHeader>
          <TierInfo>
            <TierIcon>{currentTier?.icon || '🏆'}</TierIcon>
            <TierDetails>
              <TierName>Hạng {currentTier?.name || 'Đồng'}</TierName>
              <PointsDisplay>
                {(loyaltyData?.currentPoints || 0).toLocaleString('vi-VN')}
                <span>điểm</span>
              </PointsDisplay>
            </TierDetails>
          </TierInfo>
        </TierHeader>

        {nextTier && (
          <ProgressSection>
            <ProgressLabel>
              <span>Tiến độ lên hạng {nextTier.name}</span>
              <span>{(loyaltyData?.nextTierPoints || 0).toLocaleString('vi-VN')} điểm nữa</span>
            </ProgressLabel>
            <ProgressBar>
              <ProgressFill
                $progress={progress}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </ProgressBar>
          </ProgressSection>
        )}
      </TierCard>

      <TabNav>
        <TabButton
          $active={activeTab === 'benefits'}
          onClick={() => setActiveTab('benefits')}
        >
          <FaStar /> Quyền lợi
        </TabButton>
        <TabButton
          $active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> Lịch sử
        </TabButton>
        <TabButton
          $active={activeTab === 'missions'}
          onClick={() => setActiveTab('missions')}
        >
          <FaTasks /> Nhiệm vụ
        </TabButton>
      </TabNav>

      <AnimatePresence mode="wait">
        {activeTab === 'benefits' && (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Grid>
              {tierBenefits.map((tier, index) => (
                <Card
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    border: tier.tier === loyaltyData?.tier ? `2px solid ${tier.color}` : undefined
                  }}
                >
                  <CardHeader>
                    <CardIcon $color={tier.color}>{tier.icon}</CardIcon>
                    <CardTitle>Hạng {tier.name}</CardTitle>
                  </CardHeader>
                  <BenefitList>
                    {tier.benefits.map((benefit, i) => (
                      <BenefitItem key={i}>{benefit}</BenefitItem>
                    ))}
                  </BenefitList>
                </Card>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <TransactionList>
              {transactions.length === 0 ? (
                <EmptyState>Chưa có giao dịch nào</EmptyState>
              ) : (
                transactions.map((transaction) => (
                  <TransactionItem key={transaction.id}>
                    <TransactionInfo>
                      <TransactionTitle>{transaction.description}</TransactionTitle>
                      <TransactionDate>
                        {new Date(transaction.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TransactionDate>
                    </TransactionInfo>
                    <TransactionPoints $type={transaction.type}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString('vi-VN')}
                    </TransactionPoints>
                  </TransactionItem>
                ))
              )}
            </TransactionList>
          </motion.div>
        )}

        {activeTab === 'missions' && (
          <motion.div
            key="missions"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Grid>
              {missions.map((mission, index) => (
                <MissionCard
                  key={mission.id}
                  className={mission.completed ? 'completed' : ''}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {mission.completed && <CompletedBadge>Hoàn thành</CompletedBadge>}
                  <CardHeader>
                    <CardIcon>{mission.icon}</CardIcon>
                    <div>
                      <CardTitle>{mission.title}</CardTitle>
                      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                        {mission.description}
                      </div>
                    </div>
                  </CardHeader>
                  <MissionProgress>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      Tiến độ: {mission.progress}/{mission.target}
                    </div>
                    <MissionProgressBar>
                      <MissionProgressFill
                        $progress={(mission.progress / mission.target) * 100}
                        initial={{ width: 0 }}
                        animate={{ width: `${(mission.progress / mission.target) * 100}%` }}
                      />
                    </MissionProgressBar>
                    <MissionPoints>
                      <FaGift /> +{mission.points} điểm
                    </MissionPoints>
                  </MissionProgress>
                </MissionCard>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default LoyaltyTab;
