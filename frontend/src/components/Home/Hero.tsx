import Link from 'next/link'
import Image from 'next/image'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const HeroSection = styled.section`
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: rgba(0, 0, 0, 0.4);
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
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.6;
`

const HeroButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`

const PrimaryButton = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background: #fff;
  color: #000;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`

const SecondaryButton = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  border: 2px solid #fff;
  color: #fff;
  font-weight: 600;
  border-radius: 50px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #fff;
    color: #000;
    transform: translateY(-2px);
  }
`

const Hero = () => {
  return (
    <HeroSection>
      <HeroBackground>
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Fashion Store Hero"
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
          Thời Trang Đẳng Cấp
        </HeroTitle>
        
        <HeroSubtitle
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Khám phá bộ sưu tập thời trang cao cấp mới nhất với thiết kế hiện đại và chất lượng vượt trội
        </HeroSubtitle>
        
        <HeroButtons
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <PrimaryButton href="/products">
            Mua sắm ngay
          </PrimaryButton>
          <SecondaryButton href="/collections">
            Xem bộ sưu tập
          </SecondaryButton>
        </HeroButtons>
      </HeroContent>
    </HeroSection>
  )
}

export default Hero