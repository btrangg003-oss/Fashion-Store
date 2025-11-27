import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHeart, FiStar, FiUsers, FiTrendingUp, FiShield, FiGlobe } from 'react-icons/fi'

const Section = styled.section`
  padding: 100px 0;
  background: #f8f9fa;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 80px;
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
`

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
`

const ValueCard = styled(motion.div)`
  background: white;
  padding: 40px 30px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #e74c3c, #3498db, #2ecc71);
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
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    z-index: -1;
    opacity: 0.2;
  }
`

const ValueTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #000;
`

const ValueDescription = styled.p`
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
`

const values = [
  {
    icon: FiHeart,
    title: 'Đam mê thời trang',
    description: 'Chúng tôi yêu thích và đam mê thời trang, luôn tìm kiếm những xu hướng mới nhất để mang đến cho khách hàng.'
  },
  {
    icon: FiStar,
    title: 'Chất lượng hàng đầu',
    description: 'Cam kết về chất lượng sản phẩm cao cấp, từ chất liệu đến thiết kế, mọi chi tiết đều được chăm chút tỉ mỉ.'
  },
  {
    icon: FiUsers,
    title: 'Khách hàng là trung tâm',
    description: 'Đặt khách hàng làm trọng tâm trong mọi hoạt động, luôn lắng nghe và đáp ứng nhu cầu một cách tốt nhất.'
  },
  {
    icon: FiTrendingUp,
    title: 'Đổi mới không ngừng',
    description: 'Không ngừng sáng tạo và đổi mới trong thiết kế, công nghệ và dịch vụ để mang đến trải nghiệm tuyệt vời.'
  },
  {
    icon: FiShield,
    title: 'Uy tín và tin cậy',
    description: 'Xây dựng niềm tin với khách hàng thông qua sự minh bạch, chính trực và cam kết thực hiện đúng lời hứa.'
  },
  {
    icon: FiGlobe,
    title: 'Trách nhiệm xã hội',
    description: 'Cam kết phát triển bền vững, bảo vệ môi trường và đóng góp tích cực cho cộng đồng và xã hội.'
  }
]

const AboutValues = () => {
  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionTitle>Giá trị cốt lõi</SectionTitle>
          <SectionSubtitle>
            Những giá trị định hướng mọi hoạt động của chúng tôi, 
            tạo nên nền tảng vững chắc cho sự phát triển bền vững
          </SectionSubtitle>
        </SectionHeader>
        
        <ValuesGrid>
          {values.map((value, index) => (
            <ValueCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <IconContainer>
                <value.icon />
              </IconContainer>
              <ValueTitle>{value.title}</ValueTitle>
              <ValueDescription>{value.description}</ValueDescription>
            </ValueCard>
          ))}
        </ValuesGrid>
      </Container>
    </Section>
  )
}

export default AboutValues