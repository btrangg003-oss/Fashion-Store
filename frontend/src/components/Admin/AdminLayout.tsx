import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiShoppingBag, FiUsers, FiBarChart,
  FiSettings, FiTruck, FiPackage, FiTrendingUp,
  FiMenu, FiX, FiDollarSign, FiPieChart,
  FiFileText, FiActivity, FiBell, FiGift, FiTarget,
  FiBox, FiDownload, FiUpload, FiCheckSquare, FiAlertCircle,
  FiChevronDown
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

const Sidebar = styled(motion.aside) <{ isOpen: boolean }>`
  width: ${props => props.isOpen ? '280px' : '80px'};
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);

  @media (max-width: 768px) {
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    width: 280px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const SidebarHeader = styled.div<{ isOpen: boolean }>`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: ${props => props.isOpen ? 'space-between' : 'center'};
`;

const Logo = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  
  .logo-text {
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s ease;
    white-space: nowrap;
  }
`;

const ToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const Navigation = styled.nav`
  padding: 1rem 0;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const NavSectionTitle = styled.div<{ isOpen: boolean }>`
  padding: 0 1.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: ${props => props.isOpen ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const NavItem = styled(motion.div) <{ isActive: boolean; isOpen: boolean; isSubmenu?: boolean }>`
  margin: ${props => props.isSubmenu ? '0.25rem 0.75rem' : '0.25rem 0.75rem'};
  border-radius: 12px;
  overflow: hidden;
  
  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    padding-left: ${props => props.isSubmenu ? '2.5rem' : '1rem'};
    color: ${props => props.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
    background: ${props => props.isActive
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    : 'transparent'};
    text-decoration: none;
    font-size: 1rem;
    font-weight: ${props => props.isActive ? '600' : '500'};
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
    position: relative;
    border-left: ${props => props.isSubmenu ? '2px solid rgba(255, 255, 255, 0.2)' : 'none'};
    margin-left: ${props => props.isSubmenu ? '0.5rem' : '0'};
    
    &:hover {
      background: ${props => props.isActive
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    : 'rgba(255, 255, 255, 0.1)'};
      color: white;
      transform: translateX(4px);
      border-left-color: ${props => props.isSubmenu ? 'rgba(59, 130, 246, 0.8)' : 'transparent'};
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .nav-text {
      opacity: ${props => props.isOpen ? 1 : 0};
      transition: opacity 0.3s ease;
      white-space: nowrap;
    }
  }
`;

const NavParent = styled.div<{ isOpen: boolean; hasSubmenu: boolean }>`
  margin: 0.25rem 0.75rem;
  border-radius: 12px;
  overflow: hidden;
  
  .parent-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    color: rgba(255, 255, 255, 0.7);
    background: transparent;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
    border: none;
    width: 100%;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateX(4px);
    }

    .left-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .nav-text {
      opacity: ${props => props.isOpen ? 1 : 0};
      transition: opacity 0.3s ease;
      white-space: nowrap;
    }

    .chevron {
      opacity: ${props => props.isOpen ? 1 : 0};
      transition: all 0.3s ease;
      transform: rotate(${props => props.hasSubmenu ? '0deg' : '-90deg'});
    }
  }
`;

const SubMenuContainer = styled(motion.div)`
  overflow: hidden;
`;

const MainContent = styled.main<{ sidebarOpen: boolean }>`
  flex: 1;
  margin-left: ${props => props.sidebarOpen ? '280px' : '80px'};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
  max-width: calc(100vw - ${props => props.sidebarOpen ? '280px' : '80px'});
  overflow: visible;
  
  @media (max-width: 768px) {
    margin-left: 0;
    max-width: 100vw;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const menuItems = [
  {
    section: 'Tổng quan',
    items: [
      { href: '/admin', icon: FiHome, label: 'Dashboard' },
      { href: '/admin/analytics', icon: FiBarChart, label: 'Phân tích' },
    ]
  },
  {
    section: 'Quản lý',
    items: [
      { href: '/admin/products', icon: FiShoppingBag, label: 'Sản phẩm' },
      { href: '/admin/orders', icon: FiTruck, label: 'Đơn hàng' },
      { href: '/admin/customers', icon: FiUsers, label: 'Khách hàng' },
    ]
  },
  {
    section: 'Kho hàng',
    hasSubmenu: true,
    items: [
      { href: '/admin/inventory', icon: FiBarChart, label: 'Tổng quan', isSubmenu: true },
      { href: '/admin/inventory/stock', icon: FiBox, label: 'Tồn kho', isSubmenu: true },
      { href: '/admin/inventory/inbound', icon: FiDownload, label: 'Nhập kho', isSubmenu: false },
      { href: '/admin/inventory/outbound', icon: FiUpload, label: 'Xuất kho', isSubmenu: false },
      { href: '/admin/inventory/check', icon: FiCheckSquare, label: 'Kiểm kho', isSubmenu: true },
      { href: '/admin/inventory/suppliers', icon: FiPackage, label: 'Nhà cung cấp', isSubmenu: true },
      { href: '/admin/inventory/alerts', icon: FiAlertCircle, label: 'Cảnh báo', isSubmenu: true },
    ]
  },
  {
    section: 'Tài chính',
    items: [
      { href: '/admin/payments', icon: FiDollarSign, label: 'Thanh toán' },
      { href: '/admin/finance', icon: FiPieChart, label: 'Tài chính' },
    ]
  },
  {
    section: 'Marketing',
    items: [
      { href: '/admin/vouchers', icon: FiGift, label: 'Mã giảm giá' },
      { href: '/admin/campaigns', icon: FiTarget, label: 'Chiến dịch' },
      { href: '/admin/reports', icon: FiFileText, label: 'Báo cáo' },
    ]
  },
  {
    section: 'Hệ thống',
    items: [
      { href: '/admin/notifications', icon: FiBell, label: 'Thông báo' },
      { href: '/admin/activity-log', icon: FiActivity, label: 'Nhật ký' },
      { href: '/admin/settings', icon: FiSettings, label: 'Cài đặt' },
    ]
  }
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['Kho hàng']); // Default expand Kho hàng

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isCurrentSidebar = isMobile ? mobileMenuOpen : sidebarOpen;

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(s => s !== sectionName)
        : [...prev, sectionName]
    );
  };

  return (
    <LayoutContainer>
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={isCurrentSidebar}>
        <SidebarHeader isOpen={isCurrentSidebar}>
          <Logo isOpen={isCurrentSidebar}>
            <FiPackage className="nav-icon" />
            <span className="logo-text">Fashion Admin</span>
          </Logo>
          <ToggleButton onClick={toggleSidebar}>
            {isCurrentSidebar ? <FiX /> : <FiMenu />}
          </ToggleButton>
        </SidebarHeader>

        <Navigation>
          {menuItems.map((section, sectionIndex) => {
            const hasSubmenu = section.hasSubmenu || false;
            const isExpanded = expandedSections.includes(section.section);
            
            return (
              <NavSection key={sectionIndex}>
                {!hasSubmenu && (
                  <NavSectionTitle isOpen={isCurrentSidebar}>
                    {section.section}
                  </NavSectionTitle>
                )}
                
                {hasSubmenu ? (
                  <>
                    <NavParent isOpen={isCurrentSidebar} hasSubmenu={isExpanded}>
                      <button 
                        className="parent-link"
                        onClick={() => toggleSection(section.section)}
                      >
                        <div className="left-content">
                          <FiBox className="nav-icon" />
                          <span className="nav-text">{section.section}</span>
                        </div>
                        <FiChevronDown className="chevron" />
                      </button>
                    </NavParent>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <SubMenuContainer
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {section.items.map((item: any, itemIndex) => (
                            <NavItem
                              key={itemIndex}
                              isActive={router.pathname === item.href}
                              isOpen={isCurrentSidebar}
                              isSubmenu={item.isSubmenu !== false}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link href={item.href}>
                                <item.icon className="nav-icon" />
                                <span className="nav-text">{item.label}</span>
                              </Link>
                            </NavItem>
                          ))}
                        </SubMenuContainer>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  section.items.map((item: any, itemIndex) => (
                    <NavItem
                      key={itemIndex}
                      isActive={router.pathname === item.href}
                      isOpen={isCurrentSidebar}
                      isSubmenu={false}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link href={item.href}>
                        <item.icon className="nav-icon" />
                        <span className="nav-text">{item.label}</span>
                      </Link>
                    </NavItem>
                  ))
                )}
              </NavSection>
            );
          })}
        </Navigation>
      </Sidebar>

      <MainContent sidebarOpen={!isMobile && sidebarOpen}>
        {children}
      </MainContent>
    </LayoutContainer>
  );
};

export default AdminLayout;