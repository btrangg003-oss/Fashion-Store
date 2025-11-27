import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FiAward, FiCalendar, FiShoppingBag, FiDollarSign } from 'react-icons/fi'
import { useProfileSync } from '@/contexts/ProfileSyncContext'

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`

const Card = styled.div`
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 1px solid #e0e0e0;
`

const BadgeCard = styled(Card)<{ $level: string }>`
  background: ${props => {
    switch (props.$level) {
      case 'gold':
        return 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)'
      case 'silver':
        return 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)' // Bạc thật
      case 'platinum':
        return 'linear-gradient(135deg, #e5e4e2 0%, #c0c0c0 100%)' // Bạch Kim
      default:
        return 'linear-gradient(135deg, #cd7f32 0%, #b87333 100%)' // Đồng
    }
  }};
  color: ${props => props.$level === 'silver' || props.$level === 'platinum' ? '#333' : 'white'};
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`

const Icon = styled.div`
  font-size: 2rem;
  margin-bottom: 8px;
`

const Label = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
  margin-bottom: 4px;
`

const Value = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
`

const InfoCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 16px;
`

const InfoIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.3rem;
`

const InfoContent = styled.div`
  flex: 1;
  
  .label {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
  }
`

interface AccountBadgeProps {
  user: any
}

const AccountBadge: React.FC<AccountBadgeProps> = ({ user }) => {
  const { loyaltyRefreshCount } = useProfileSync();
  const [loyaltyTier, setLoyaltyTier] = useState<string>('bronze');

  useEffect(() => {
    fetchLoyaltyTier();
  }, [loyaltyRefreshCount]);

  const fetchLoyaltyTier = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/loyalty/points', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setLoyaltyTier(data.tier?.toLowerCase() || 'bronze');
      }
    } catch (error) {
      console.error('Error fetching loyalty tier:', error);
    }
  };

  const getLevelName = (level: string) => {
    switch (level) {
      case 'gold':
        return '🥇 Vàng'
      case 'silver':
        return '🥈 Bạc'
      default:
        return '🥉 Đồng'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <Container>
      <BadgeCard $level={loyaltyTier}>
        <Icon><FiAward /></Icon>
        <Label>Cấp độ tài khoản</Label>
        <Value>{getLevelName(loyaltyTier)}</Value>
      </BadgeCard>

      <InfoCard>
        <InfoIcon><FiCalendar /></InfoIcon>
        <InfoContent>
          <div className="label">Ngày tham gia</div>
          <div className="value">{formatDate(user.createdAt)}</div>
        </InfoContent>
      </InfoCard>

      <InfoCard>
        <InfoIcon><FiShoppingBag /></InfoIcon>
        <InfoContent>
          <div className="label">Tổng đơn hàng</div>
          <div className="value">{user.totalOrders || 0} đơn</div>
        </InfoContent>
      </InfoCard>

      <InfoCard>
        <InfoIcon><FiDollarSign /></InfoIcon>
        <InfoContent>
          <div className="label">Tổng chi tiêu</div>
          <div className="value">{formatCurrency(user.totalSpent || 0)}</div>
        </InfoContent>
      </InfoCard>
    </Container>
  )
}

export default AccountBadge
