import styled from 'styled-components'
import { motion } from 'framer-motion'

const HeroSection = styled.section`
  padding: 150px 0 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
`

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`

const ContactStats = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`

const StatItem = styled.div`
  text-align: center;
  
  h3 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #fff;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`

const ContactHero = () => {
  return (
    <HeroSection>
      <Container>
        <HeroTitle
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Liên hệ với chúng tôi
        </HeroTitle>
        
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
          Hãy liên hệ với chúng tôi để được tư vấn tốt nhất về sản phẩm và dịch vụ.
        </HeroSubtitle>
        
        <ContactStats
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <StatItem>
            <h3>24/7</h3>
            <p>Hỗ trợ khách hàng</p>
          </StatItem>
          <StatItem>
            <h3>&lt;2h</h3>
            <p>Thời gian phản hồi</p>
          </StatItem>
          <StatItem>
            <h3>99%</h3>
            <p>Khách hàng hài lòng</p>
          </StatItem>
          <StatItem>
            <h3>25+</h3>
            <p>Cửa hàng toàn quốc</p>
          </StatItem>
        </ContactStats>
      </Container>
    </HeroSection>
  )
}

export default ContactHero