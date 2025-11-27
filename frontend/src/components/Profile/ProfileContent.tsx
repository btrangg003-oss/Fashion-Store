import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHeart, FiSettings, FiShoppingBag, FiPackage, FiMapPin, FiUser, FiStar, FiAward, FiTag } from 'react-icons/fi'
import { BsGenderMale, BsGenderFemale, BsGenderAmbiguous } from 'react-icons/bs'
import { useAuth } from '../../contexts/AuthContext'
import OrdersTab from './OrdersTab'
import AddressesTab from './AddressesTab'
import PersonalInfoTab from './PersonalInfoTab'
import ReturnsTab from './ReturnsTab'
import WishlistTab from './WishlistTab'
import LoyaltyTab from './LoyaltyTab'
import ReviewsTab from './ReviewsTab'
import CouponsTab from './CouponsTab'
import SettingsTab from './SettingsTab'
import { ProfileSyncProvider } from '@/contexts/ProfileSyncContext'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
  min-height: 80vh;
  background: #f5f5f5;
`

const Sidebar = styled(motion.div)`
  width: 280px;
  background: white;
  border-radius: 12px;
  padding: 0;
  height: fit-content;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
`

const UserProfile = styled.div`
  padding: 24px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
`

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 16px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    background: #4caf50;
    border-radius: 50%;
    border: 3px solid white;
  }
`

const UserName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`

const GenderIcon = styled.span<{ color?: string }>`
  display: inline-flex;
  align-items: center;
  font-size: 1.1rem;
  color: ${props => props.color || '#667eea'};
`

const UserEmail = styled.p`
  margin: 0 0 8px 0;
  color: #666;
  font-size: 0.9rem;
`

const UserBadge = styled.span<{ $tier?: string }>`
  background: ${props => {
    switch (props.$tier) {
      case 'gold':
        return 'linear-gradient(135deg, #ffd700, #ffb300)'
      case 'silver':
        return 'linear-gradient(135deg, #c0c0c0, #a8a8a8)'
      case 'platinum':
        return 'linear-gradient(135deg, #e5e4e2, #c0c0c0)'
      default:
        return 'linear-gradient(135deg, #cd7f32, #b87333)'
    }
  }};
  color: ${props => props.$tier === 'silver' || props.$tier === 'platinum' ? '#333' : 'white'};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const MenuList = styled.div`
  padding: 0;
`

const MenuItem = styled.div<{ isActive: boolean }>`
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: ${props => props.isActive ? '#667eea' : '#333'};
  background: ${props => props.isActive ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' : 'transparent'};
  border-right: ${props => props.isActive ? '3px solid #667eea' : '3px solid transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
    color: #667eea;
  }
  
  svg {
    font-size: 1.1rem;
  }
  
  span {
    font-size: 0.95rem;
    font-weight: 500;
  }
`

const MainContent = styled(motion.div)`
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`

const ContentHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`

const ContentTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
`

const WelcomeCard = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255,255,255,0.1);
    border-radius: 50%;
  }
`

const WelcomeTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.3rem;
  font-weight: 600;
`

const WelcomeSubtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`

const StatCard = styled(motion.div)`
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
`

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
  font-size: 1.2rem;
`

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
`

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`

const RecentSection = styled.div`
  margin-top: 24px;
`

const SectionTitle = styled.h4`
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
`

const RecentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const GridItem = styled.div<{ $span?: string }>`
  grid-column: span ${props => props.$span || '1'};
  
  @media (max-width: 1200px) {
    grid-column: span ${props => props.$span === '3' ? '2' : '1'};
  }
  
  @media (max-width: 768px) {
    grid-column: span 1;
  }
`

const RecentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e9ecef;
  }
`

const ItemIcon = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
`

const ItemInfo = styled.div`
  flex: 1;
  
  .title {
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .subtitle {
    font-size: 0.8rem;
    color: #666;
  }
`

const ItemAction = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5a67d8;
  }
`

const ProfileContent = () => {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [loyaltyTier, setLoyaltyTier] = useState<string>('bronze')

  // Check URL query params for tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab) {
        setActiveTab(tab)
      }
    }
  }, [])

  // Fetch loyalty tier
  useEffect(() => {
    const fetchLoyaltyTier = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/loyalty/points', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const data = await response.json()
          setLoyaltyTier(data.tier?.toLowerCase() || 'bronze')
        }
      } catch (error) {
        console.error('Error fetching loyalty tier:', error)
      }
    }

    if (user) {
      fetchLoyaltyTier()
    }
  }, [user])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Đang tải thông tin tài khoản...
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Vui lòng đăng nhập để xem thông tin tài khoản.
      </div>
    )
  }

  const menuItems = [
    { id: 'info', label: 'Thông tin cá nhân', icon: FiUser },
    { id: 'addresses', label: 'Địa chỉ giao hàng', icon: FiMapPin },
    { id: 'orders', label: 'Đơn hàng của tôi', icon: FiPackage },
    { id: 'returns', label: 'Đổi & trả hàng', icon: FiShoppingBag },
    { id: 'reviews', label: 'Đánh giá sản phẩm', icon: FiStar },
    { id: 'wishlist', label: 'Yêu thích', icon: FiHeart },
    { id: 'coupons', label: 'Ưu đãi & Mã giảm giá', icon: FiTag },
    { id: 'loyalty', label: 'Hạng & Điểm thưởng', icon: FiAward },
    { id: 'settings', label: 'Cài đặt', icon: FiSettings }
  ]

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  }

  const getGenderIcon = (gender?: string) => {
    if (!gender) return null

    switch (gender) {
      case 'male':
        return <GenderIcon color="#3b82f6"><BsGenderMale /></GenderIcon>
      case 'female':
        return <GenderIcon color="#ec4899"><BsGenderFemale /></GenderIcon>
      case 'other':
        return <GenderIcon color="#8b5cf6"><BsGenderAmbiguous /></GenderIcon>
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <PersonalInfoTab />

      case 'addresses':
        return <AddressesTab />

      case 'orders':
        return <OrdersTab userId={user.id} />

      case 'returns':
        return <ReturnsTab />

      case 'reviews':
        return <ReviewsTab />

      case 'wishlist':
        return <WishlistTab />

      case 'coupons':
        return <CouponsTab />

      case 'loyalty':
        return <LoyaltyTab />

      case 'settings':
        return <SettingsTab />

      default:
        return (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Nội dung đang được cập nhật
          </div>
        )
    }
  }

  return (
    <ProfileSyncProvider>
      <Container>
        <Sidebar
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <UserProfile>
            <Avatar>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                getInitials(user.firstName, user.lastName)
              )}
            </Avatar>
            <UserName>
              {user.firstName} {user.lastName}
              {getGenderIcon(user.gender)}
            </UserName>
            <UserEmail>{user.email}</UserEmail>
            <UserBadge $tier={loyaltyTier}>
              <FiStar />
              {loyaltyTier === 'gold' ? '🥇 Vàng' : loyaltyTier === 'silver' ? '🥈 Bạc' : loyaltyTier === 'platinum' ? '💎 Bạch Kim' : '🥉 Đồng'}
            </UserBadge>
          </UserProfile>

          <MenuList>
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon />
                <span>{item.label}</span>
              </MenuItem>
            ))}
          </MenuList>
        </Sidebar>

        <MainContent
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {renderContent()}
        </MainContent>
      </Container>
    </ProfileSyncProvider>
  )
}

export default ProfileContent