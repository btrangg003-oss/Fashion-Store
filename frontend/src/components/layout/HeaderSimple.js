import { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { FiShoppingBag, FiUser, FiSearch } from 'react-icons/fi'

const HeaderWrapper = styled.div`
  background: #fff;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`

const TopHeader = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.2rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
    gap: 1rem;
  }
`

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: #ff6b35;
  flex-shrink: 0;
  letter-spacing: -0.5px;
  
  a {
    color: #ff6b35;
    text-decoration: none;
    transition: opacity 0.3s;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`

const SearchBar = styled.div`
  flex: 1;
  max-width: 600px;
  position: relative;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
  
  input {
    width: 100%;
    padding: 0.85rem 3.5rem 0.85rem 1.2rem;
    border: 2px solid #e8e8e8;
    border-radius: 30px;
    font-size: 0.95rem;
    transition: all 0.3s;
    background: #f8f8f8;
    
    &:focus {
      outline: none;
      border-color: #ff6b35;
      background: #fff;
      box-shadow: 0 2px 8px rgba(255, 107, 53, 0.1);
    }
    
    &::placeholder {
      color: #999;
    }
  }
  
  button {
    position: absolute;
    right: 0.4rem;
    top: 50%;
    transform: translateY(-50%);
    background: #ff6b35;
    border: none;
    color: white;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background: #e55a2b;
      transform: translateY(-50%) scale(1.05);
    }
    
    &:active {
      transform: translateY(-50%) scale(0.95);
    }
  }
`

const HeaderIcons = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 0.8rem;
  }
`

const IconLink = styled.a`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  transition: all 0.3s;
  
  &:hover {
    color: #ff6b35;
    background: #fff5f2;
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    width: 38px;
    height: 38px;
  }
`

const Nav = styled.nav`
  background: #fafafa;
  border-top: 1px solid #e8e8e8;
  
  @media (max-width: 968px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  gap: 2.5rem;
  
  @media (max-width: 968px) {
    gap: 1.5rem;
    padding: 0 1rem;
  }
  
  a {
    padding: 1rem 0.5rem;
    color: #333;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.3s;
    border-bottom: 3px solid transparent;
    white-space: nowrap;
    text-decoration: none;
    
    &:hover {
      color: #ff6b35;
      border-bottom-color: #ff6b35;
    }
    
    &:active {
      transform: translateY(1px);
    }
    
    @media (max-width: 968px) {
      font-size: 0.9rem;
      padding: 0.8rem 0.3rem;
    }
  }
`

export default function HeaderSimple() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <HeaderWrapper>
      <TopHeader>
        <Logo>
          <Link href="/">
            Fashion Store
          </Link>
        </Logo>
        
        <SearchBar>
          <input 
            type="text" 
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button>
            <FiSearch />
          </button>
        </SearchBar>
        
        <HeaderIcons>
          <Link href="/auth/login" passHref legacyBehavior>
            <IconLink title="Tài khoản">
              <FiUser />
            </IconLink>
          </Link>
          
          <Link href="/cart" passHref legacyBehavior>
            <IconLink title="Giỏ hàng">
              <FiShoppingBag />
            </IconLink>
          </Link>
        </HeaderIcons>
      </TopHeader>
      
      <Nav>
        <NavContainer>
          <Link href="/">Trang chủ</Link>
          <Link href="/collections/nam">Nam</Link>
          <Link href="/collections/nu">Nữ</Link>
          <Link href="/collections">Bộ sưu tập</Link>
          <Link href="/combo">Combo Mix&Match</Link>
          <Link href="/news">Tin Tức</Link>
          <Link href="/contact">Liên Hệ</Link>
        </NavContainer>
      </Nav>
    </HeaderWrapper>
  )
}
