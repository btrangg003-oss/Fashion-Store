import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiBox, FiShoppingBag, FiUsers, FiTag, FiBarChart2, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../../contexts/AuthContext';

const AdminLayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 250px;
  background: #1a1c23;
  color: white;
  padding: 2rem;
`;

const MainContent = styled.main`
  flex: 1;
  background: #f7f7f7;
  padding: 2rem;
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #fff;
`;

const MenuGroup = styled.div`
  margin-bottom: 2rem;
`;

const MenuTitle = styled.div`
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const MenuItem = styled.a<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: ${props => props.active ? '#fff' : '#9ca3af'};
  text-decoration: none;
  border-radius: 0.5rem;
  margin-bottom: 0.25rem;
  background: ${props => props.active ? '#374151' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: #374151;
    color: #fff;
  }

  svg {
    margin-right: 0.75rem;
  }
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: #111827;
  margin: 0;
`;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { logout } = useAuth();
  
  const isActive = (path: string) => router.pathname === path;

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <AdminLayoutWrapper>
      <Sidebar>
        <Logo>Fashion Store</Logo>
        
        <MenuGroup>
          <MenuTitle>Main</MenuTitle>
          <Link href="/admin" passHref legacyBehavior>
            <MenuItem active={isActive('/admin')}>
              <FiHome /> Dashboard
            </MenuItem>
          </Link>
        </MenuGroup>

        <MenuGroup>
          <MenuTitle>Quản lý</MenuTitle>
          <Link href="/admin/products" passHref legacyBehavior>
            <MenuItem active={isActive('/admin/products')}>
              <FiBox /> Sản phẩm
            </MenuItem>
          </Link>
          <Link href="/admin/orders" passHref legacyBehavior>
            <MenuItem active={isActive('/admin/orders')}>
              <FiShoppingBag /> Đơn hàng
            </MenuItem>
          </Link>
          <Link href="/admin/customers" passHref legacyBehavior>
            <MenuItem active={isActive('/admin/customers')}>
              <FiUsers /> Khách hàng
            </MenuItem>
          </Link>
        </MenuGroup>

        <MenuGroup>
          <MenuTitle>Marketing</MenuTitle>
          <Link href="/admin/promotions" passHref legacyBehavior>
            <MenuItem active={isActive('/admin/promotions')}>
              <FiTag /> Khuyến mãi
            </MenuItem>
          </Link>
        </MenuGroup>

        <MenuGroup>
          <MenuTitle>Báo cáo</MenuTitle>
          <Link href="/admin/reports" passHref legacyBehavior>
            <MenuItem active={isActive('/admin/reports')}>
              <FiBarChart2 /> Thống kê
            </MenuItem>
          </Link>
        </MenuGroup>

        <MenuGroup>
          <MenuTitle>Cài đặt</MenuTitle>
          <Link href="/admin/settings" passHref legacyBehavior>
            <MenuItem active={isActive('/admin/settings')}>
              <FiSettings /> Thiết lập
            </MenuItem>
          </Link>
          <MenuItem as="button" onClick={handleLogout}>
            <FiLogOut /> Đăng xuất
          </MenuItem>
        </MenuGroup>
      </Sidebar>

      <div style={{ flex: 1 }}>
        <Header>
          <PageTitle>
            {router.pathname === '/admin' && 'Dashboard'}
            {router.pathname === '/admin/products' && 'Quản lý sản phẩm'}
            {router.pathname === '/admin/orders' && 'Quản lý đơn hàng'}
            {router.pathname === '/admin/customers' && 'Quản lý khách hàng'}
            {router.pathname === '/admin/promotions' && 'Quản lý khuyến mãi'}
            {router.pathname === '/admin/reports' && 'Báo cáo thống kê'}
            {router.pathname === '/admin/settings' && 'Cài đặt hệ thống'}
          </PageTitle>
        </Header>
        <MainContent>
          {children}
        </MainContent>
      </div>
    </AdminLayoutWrapper>
  );
};

export default AdminLayout;