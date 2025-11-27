import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { FiShoppingBag, FiUser, FiHeart, FiSearch, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

const HeaderContainer = styled.header`
  position: sticky;
  top: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 100;
`

const TopBar = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.2rem 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 968px) {
    padding: 1rem;
    gap: 1rem;
  }
`

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: #ff6b35;
  white-space: nowrap;
  flex-shrink: 0;
  
  a {
    color: #ff6b35;
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`

const SearchWrapper = styled.div`
  flex: 1;
  max-width: 500px;
  position: relative;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
`

const AccountBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const AccountIcon = styled.div`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.2rem;
`

const AccountText = styled.div`
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
`

const LoginText = styled.div`
  font-size: 0.7rem;
  color: #ff6b35;
  font-weight: 600;
`

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
`

const Avatar = styled.img`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  border: 2px solid #ff6b35;
`

const UserName = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const IconButton = styled.button`
  padding: 0.6rem;
  border-radius: 50%;
  background: transparent;
  color: #333;
  font-size: 1.3rem;
  position: relative;
  
  &:hover {
    background: #f5f5f5;
    color: #ff6b35;
  }
`

const Badge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
`

const Nav = styled.nav`
  background: #fff;
  border-top: 1px solid #e9ecef;
  
  @media (max-width: 968px) {
    display: none;
  }
`

const NavInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
`

const NavLink = styled(Link)`
  padding: 1rem 0;
  font-weight: 600;
  color: #333;
  position: relative;
  font-size: 0.95rem;
  
  &:hover {
    color: #ff6b35;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background: #ff6b35;
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`

const MobileMenuBtn = styled.button`
  display: none;
  padding: 0.5rem;
  font-size: 1.2rem;
  
  @media (max-width: 768px) {
    display: block;
  }
`

const Header = () => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [cartCount] = useState(3)

  return (
    <HeaderContainer>
      <TopBar>
        <Logo>
          <Link href="/">FASHION</Link>
        </Logo>

        <SearchWrapper>
          <SearchIcon />
          <SearchInput 
            placeholder="Tìm kiếm sản phẩm..." 
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value
                if (value.trim()) {
                  router.push(`/search?q=${encodeURIComponent(value)}`)
                }
              }
            }}
          />
        </SearchWrapper>

        <Actions>
          {isAuthenticated && user ? (
            <UserBox onClick={() => router.push('/profile')}>
              <Avatar 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=ff6b35&color=fff`} 
                alt={user.name} 
              />
              <UserName>{user.name}</UserName>
            </UserBox>
          ) : (
            <AccountBox onClick={() => router.push('/auth/login')}>
              <AccountIcon>
                <FiUser />
              </AccountIcon>
              <AccountText>Tài khoản</AccountText>
              <LoginText>Đăng nhập ngay</LoginText>
            </AccountBox>
          )}

          <IconButton onClick={() => router.push('/wishlist')} title="Yêu thích">
            <FiHeart />
          </IconButton>

          <IconButton onClick={() => router.push('/cart')} title="Giỏ hàng">
            <FiShoppingBag />
            {cartCount > 0 && <Badge>{cartCount}</Badge>}
          </IconButton>

          <MobileMenuBtn>
            <FiMenu />
          </MobileMenuBtn>
        </Actions>
      </TopBar>

      <Nav>
        <NavInner>
          <NavLink href="/">Trang chủ</NavLink>
          <NavLink href="/products?gender=nam">Nam</NavLink>
          <NavLink href="/products?gender=nu">Nữ</NavLink>
          <NavLink href="/collections">Bộ sưu tập</NavLink>
          <NavLink href="/collections/mix-match">Combo Mix&Match</NavLink>
          <NavLink href="/contact">Liên Hệ</NavLink>
        </NavInner>
      </Nav>
    </HeaderContainer>
  )
}

export default Header
