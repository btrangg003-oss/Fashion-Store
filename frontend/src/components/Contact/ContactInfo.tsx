import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiMapPin, FiPhone, FiMail, FiClock, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi'

const Section = styled.section`
  padding: 80px 0;
  background: #f8f9fa;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
`

const InfoCard = styled(motion.div)`
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  }
`

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
`

const InfoTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #000;
`

const InfoText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`

const SocialSection = styled.div`
  text-align: center;
  margin-top: 60px;
  padding-top: 60px;
  border-top: 1px solid #eee;
`

const SocialTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #000;
`

const SocialSubtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
`

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
`

const SocialLink = styled(motion.a)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
  
  &.facebook:hover {
    background: #1877f2;
  }
  
  &.instagram:hover {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  }
  
  &.twitter:hover {
    background: #1da1f2;
  }
`

const ContactInfo = () => {
  const contactData = [
    {
      icon: FiMapPin,
      title: 'Địa chỉ cửa hàng',
      info: [
        '123 Đường Nguyễn Huệ, Quận 1',
        'TP. Hồ Chí Minh, Việt Nam',
        '456 Phố Hàng Bài, Hoàn Kiếm',
        'Hà Nội, Việt Nam'
      ]
    },
    {
      icon: FiPhone,
      title: 'Liên hệ',
      info: [
        'Hotline: 1900 1234',
        'Zalo: 0901 234 567',
        'WhatsApp: +84 901 234 567',
        'Fax: (028) 1234 5678'
      ]
    },
    {
      icon: FiMail,
      title: 'Email',
      info: [
        'info@fashionstore.com',
        'support@fashionstore.com',
        'sales@fashionstore.com',
        'pr@fashionstore.com'
      ]
    },
    {
      icon: FiClock,
      title: 'Giờ làm việc',
      info: [
        'Thứ 2 - Thứ 6: 8:00 - 22:00',
        'Thứ 7 - Chủ nhật: 9:00 - 21:00',
        'Lễ Tết: 10:00 - 18:00',
        'Hỗ trợ online 24/7'
      ]
    }
  ]

  return (
    <Section>
      <Container>
        <InfoGrid>
          {contactData.map((item, index) => (
            <InfoCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <IconContainer>
                <item.icon />
              </IconContainer>
              <InfoTitle>{item.title}</InfoTitle>
              {item.info.map((text, textIndex) => (
                <InfoText key={textIndex}>{text}</InfoText>
              ))}
            </InfoCard>
          ))}
        </InfoGrid>

        <SocialSection>
          <SocialTitle>Kết nối với chúng tôi</SocialTitle>
          <SocialSubtitle>
            Theo dõi chúng tôi trên mạng xã hội để cập nhật những xu hướng thời trang mới nhất
          </SocialSubtitle>
          <SocialLinks>
            <SocialLink
              href="https://facebook.com/fashionstore"
              className="facebook"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiFacebook />
            </SocialLink>
            <SocialLink
              href="https://instagram.com/fashionstore"
              className="instagram"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiInstagram />
            </SocialLink>
            <SocialLink
              href="https://twitter.com/fashionstore"
              className="twitter"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiTwitter />
            </SocialLink>
          </SocialLinks>
        </SocialSection>
      </Container>
    </Section>
  )
}

export default ContactInfo