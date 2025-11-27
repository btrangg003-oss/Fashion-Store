import Link from 'next/link'
import styled from 'styled-components'
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'

const FooterContainer = styled.footer`
  background: #000;
  color: #fff;
  padding: 60px 0 20px;
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
`

const FooterSection = styled.div`
  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: #fff;
  }
`

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const FooterLink = styled(Link)`
  color: #ccc;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #fff;
  }
`

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #333;
  border-radius: 50%;
  color: #fff;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fff;
    color: #000;
    transform: translateY(-2px);
  }
`

const Newsletter = styled.div`
  h3 {
    margin-bottom: 16px;
  }
  
  p {
    color: #ccc;
    font-size: 0.9rem;
    margin-bottom: 20px;
    line-height: 1.6;
  }
`

const NewsletterForm = styled.form`
  display: flex;
  gap: 8px;
  
  input {
    flex: 1;
    padding: 12px 16px;
    border-radius: 4px;
    background: #333;
    color: #fff;
    border: 1px solid #555;
    
    &::placeholder {
      color: #999;
    }
    
    &:focus {
      border-color: #fff;
    }
  }
  
  button {
    padding: 12px 24px;
    background: #fff;
    color: #000;
    border-radius: 4px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      background: #f0f0f0;
    }
  }
`

const FooterBottom = styled.div`
  max-width: 1200px;
  margin: 40px auto 0;
  padding: 20px 20px 0;
  border-top: 1px solid #333;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
`

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>FASHION</h3>
          <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Thương hiệu thời trang hàng đầu Việt Nam, mang đến những sản phẩm chất lượng cao với thiết kế hiện đại và phong cách độc đáo.
          </p>
          <SocialLinks>
            <SocialLink href="#" aria-label="Facebook">
              <FiFacebook />
            </SocialLink>
            <SocialLink href="#" aria-label="Instagram">
              <FiInstagram />
            </SocialLink>
            <SocialLink href="#" aria-label="Twitter">
              <FiTwitter />
            </SocialLink>
            <SocialLink href="#" aria-label="YouTube">
              <FiYoutube />
            </SocialLink>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Sản phẩm</h3>
          <FooterLinks>
            <FooterLink href="/products/women">Thời trang nữ</FooterLink>
            <FooterLink href="/products/men">Thời trang nam</FooterLink>
            <FooterLink href="/products/accessories">Phụ kiện</FooterLink>
            <FooterLink href="/products/shoes">Giày dép</FooterLink>
            <FooterLink href="/products/bags">Túi xách</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <h3>Hỗ trợ</h3>
          <FooterLinks>
            <FooterLink href="/support/shipping">Chính sách giao hàng</FooterLink>
            <FooterLink href="/support/returns">Đổi trả</FooterLink>
            <FooterLink href="/support/size-guide">Hướng dẫn chọn size</FooterLink>
            <FooterLink href="/support/care">Bảo quản sản phẩm</FooterLink>
            <FooterLink href="/support/faq">Câu hỏi thường gặp</FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <Newsletter>
            <h3>Đăng ký nhận tin</h3>
            <p>Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
            <NewsletterForm>
              <input 
                type="email" 
                placeholder="Email của bạn"
                required
              />
              <button type="submit">Đăng ký</button>
            </NewsletterForm>
          </Newsletter>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <p>&copy; 2024 Fashion Store. Tất cả quyền được bảo lưu.</p>
      </FooterBottom>
    </FooterContainer>
  )
}

export default Footer