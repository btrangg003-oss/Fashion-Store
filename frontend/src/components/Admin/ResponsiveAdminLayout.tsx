import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiShoppingBag, FiBarChart, FiSettings, FiTruck, FiMenu, FiBell,
  FiLogOut, FiChevronDown, FiActivity, FiFileText, FiPieChart, FiTarget,
  FiPackage, FiUsers, FiCreditCard, FiX, FiMessageSquare, FiGift,
  FiBox, FiDownload, FiUpload, FiCheckSquare, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

const Sidebar = styled(motion.aside) <{ isOpen: boolean }>`
  width: 280px;
  background: #1a202c;
  color: white;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  transition: transform 0.3s ease;

  @media (min-width: 1024px) {
    position: relative;
    transform: translateX(0);
  }

  @media (max-width: 1023px) {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 320px;
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  }
`;

const SidebarOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;

  @media (max-width: 1023px) {
    display: block;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  @media (min-width: 1024px) {
    margin-left: 0;
  }
`;

const MobileHeader = styled.header`
  display: none;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const MobileHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MobileHeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f7fafc;
  }
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a202c;

  @media (max-width: 1023px) {
    font-size: 1.125rem;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #2d3748;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarLogo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: none;
  
  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: #2d3748;
    color: white;
  }
`;

const Navigation = styled.nav`
  padding: 1rem 0;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const NavSectionTitle = styled.div`
  padding: 0 1.5rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NavItem = styled(motion.a) <{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: ${props => props.isActive ? '#ffffff' : '#a0aec0'};
  background: ${props => props.isActive ? '#2b6cb0' : 'transparent'};
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.isActive ? '#2b6cb0' : '#2d3748'};
    color: white;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Badge = styled.span`
  background: #e53e3e;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  margin-left: auto;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 0;
  overflow-x: hidden;

  @media (max-width: 1023px) {
    padding: 0;
  }
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f7fafc;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #e53e3e;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  font-weight: 500;
  
  &:hover {
    background: #f7fafc;
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const getNavigationItems = (requestsCount: number) => [
  {
    section: 'Tổng quan',
    items: [
      { href: '/admin', icon: FiHome, label: 'Dashboard', badge: null },
      { href: '/admin/analytics', icon: FiBarChart, label: 'Phân tích', badge: null },
    ]
  },
  {
    section: 'Quản lý',
    items: [
      { href: '/admin/products', icon: FiShoppingBag, label: 'Sản phẩm', badge: null },
      { href: '/admin/orders', icon: FiTruck, label: 'Đơn hàng', badge: null },
      { href: '/admin/customers', icon: FiUsers, label: 'Khách hàng', badge: null },
      { href: '/admin/requests', icon: FiMessageSquare, label: 'Yêu cầu KH', badge: requestsCount > 0 ? requestsCount : null },
    ]
  },
  {
    section: 'Kho hàng',
    items: [
      { href: '/admin/inventory', icon: FiBarChart, label: 'Tổng quan', badge: null },
      { href: '/admin/inventory/stock', icon: FiBox, label: 'Tồn kho', badge: null },
      { href: '/admin/inventory/inbound', icon: FiDownload, label: 'Nhập kho', badge: null },
      { href: '/admin/inventory/outbound', icon: FiUpload, label: 'Xuất kho', badge: null },
      { href: '/admin/inventory/check', icon: FiCheckSquare, label: 'Kiểm kho', badge: null },
      { href: '/admin/inventory/suppliers', icon: FiPackage, label: 'Nhà cung cấp', badge: null },
      { href: '/admin/inventory/alerts', icon: FiAlertCircle, label: 'Cảnh báo', badge: null },
    ]
  },
  {
    section: 'Tài chính',
    items: [
      { href: '/admin/payments', icon: FiCreditCard, label: 'Thanh toán', badge: null },
      { href: '/admin/finance', icon: FiPieChart, label: 'Tài chính', badge: null },
    ]
  },
  {
    section: 'Marketing',
    items: [
      { href: '/admin/vouchers', icon: FiGift, label: 'Mã giảm giá', badge: null },
      { href: '/admin/campaigns', icon: FiTarget, label: 'Chiến dịch', badge: null },
      { href: '/admin/reports', icon: FiFileText, label: 'Báo cáo', badge: null },
    ]
  },
  {
    section: 'Hệ thống',
    items: [
      { href: '/admin/notifications', icon: FiBell, label: 'Thông báo', badge: null },
      { href: '/admin/activity-log', icon: FiActivity, label: 'Nhật ký', badge: null },
      { href: '/admin/settings', icon: FiSettings, label: 'Cài đặt', badge: null },
    ]
  }
];

const ResponsiveAdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { notifications } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);

  // Fetch requests count
  useEffect(() => {
    const fetchRequestsCount = async () => {
      try {
        const res = await fetch('/api/admin/requests/count');
        if (res.ok) {
          const data = await res.json();
          setRequestsCount(data.counts?.pending || 0);
        }
      } catch (error) {
        console.error('Error fetching requests count:', error);
      }
    };

    fetchRequestsCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRequestsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Clear badge when viewing requests page
  useEffect(() => {
    if (router.pathname === '/admin/requests') {
      // Small delay to ensure user sees the page
      const timer = setTimeout(() => {
        setRequestsCount(0);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [router.pathname]);

  useEffect(() => {
    const handleRouteChange = () => {
      setSidebarOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const unreadNotifications = notifications.length;

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <LayoutContainer>
      <MobileHeader>
        <MobileHeaderLeft>
          <MenuButton onClick={() => setSidebarOpen(true)}>
            <FiMenu size={20} />
          </MenuButton>
          <Logo>Fashion Admin</Logo>
        </MobileHeaderLeft>

        <MobileHeaderRight>
          <NotificationButton>
            <FiBell size={18} />
            {unreadNotifications > 0 && (
              <NotificationBadge>{unreadNotifications}</NotificationBadge>
            )}
          </NotificationButton>

          <UserButton>
            <UserAvatar>
              {user?.firstName?.charAt(0) || 'A'}
            </UserAvatar>
            <FiChevronDown size={16} />
          </UserButton>
        </MobileHeaderRight>
      </MobileHeader>

      <AnimatePresence>
        {sidebarOpen && (
          <SidebarOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <SidebarLogo>Fashion Admin</SidebarLogo>
          <CloseButton onClick={() => setSidebarOpen(false)}>
            <FiX size={20} />
          </CloseButton>
        </SidebarHeader>

        <Navigation>
          {getNavigationItems(requestsCount).map((section, sectionIndex) => (
            <NavSection key={sectionIndex}>
              <NavSectionTitle>{section.section}</NavSectionTitle>
              {section.items.map((item, itemIndex) => (
                <NavItem
                  key={itemIndex}
                  href={item.href}
                  isActive={router.pathname === item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.badge && <Badge>{item.badge}</Badge>}
                </NavItem>
              ))}
            </NavSection>
          ))}

          <NavSection>
            <NavItem
              href="#"
              isActive={false}
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiLogOut />
              <span>Đăng xuất</span>
            </NavItem>
          </NavSection>
        </Navigation>
      </Sidebar>

      <MainContent>
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default ResponsiveAdminLayout;