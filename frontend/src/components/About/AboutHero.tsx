import Image from 'next/image'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const HeroSection = styled.section`
  position: relative;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
`

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
  color: white;
  max-width: 800px;
  padding: 0 20px;
`

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
`

const StatsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`

const StatItem = styled.div`
  text-align: center;
  
  h3 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #fff;
  }
  
  p {
    font-size: 1rem;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`

const AboutHero = () => {
  return (
    <HeroSection>
      <HeroBackground>
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          alt="Fashion Store About"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </HeroBackground>
      
      <HeroContent>
        <HeroTitle
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Câu chuyện của chúng tôi
        </HeroTitle>
        
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Từ một ý tưởng nhỏ đến thương hiệu thời trang hàng đầu Việt Nam, 
          chúng tôi luôn cam kết mang đến những sản phẩm chất lượng cao với phong cách độc đáo
        </HeroSubtitle>
        
        <StatsContainer
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <StatItem>
            <h3>10+</h3>
            <p>Năm kinh nghiệm</p>
          </StatItem>
          <StatItem>
            <h3>50K+</h3>
            <p>Khách hàng hài lòng</p>
          </StatItem>
          <StatItem>
            <h3>1000+</h3>
            <p>Sản phẩm đa dạng</p>
          </StatItem>
          <StatItem>
            <h3>25+</h3>
            <p>Cửa hàng toàn quốc</p>
          </StatItem>
        </StatsContainer>
      </HeroContent>
    </HeroSection>
  )
}

export default AboutHero