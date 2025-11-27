import Image from 'next/image'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiLinkedin, FiTwitter, FiInstagram } from 'react-icons/fi'

const Section = styled.section`
  padding: 100px 0;
  background: white;
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

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
`

const TeamCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  }
`

const MemberImage = styled.div`
  position: relative;
  height: 300px;
  overflow: hidden;
  
  img {
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.1);
  }
`

const MemberInfo = styled.div`
  padding: 30px;
  text-align: center;
`

const MemberName = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
`

const MemberRole = styled.p`
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
`

const MemberDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 0.95rem;
`

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #000;
    color: white;
    transform: translateY(-2px);
  }
`

const teamMembers = [
  {
    name: 'Nguyễn Minh Anh',
    role: 'CEO & Founder',
    description: 'Với hơn 15 năm kinh nghiệm trong ngành thời trang, Minh Anh là người đặt nền móng cho tầm nhìn và sứ mệnh của Fashion Store.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    }
  },
  {
    name: 'Trần Đức Huy',
    role: 'Creative Director',
    description: 'Huy là người đứng sau những thiết kế độc đáo và sáng tạo, mang đến phong cách thời trang hiện đại và tinh tế.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    }
  },
  {
    name: 'Lê Thị Hương',
    role: 'Head of Marketing',
    description: 'Hương chịu trách nhiệm xây dựng thương hiệu và kết nối Fashion Store với khách hàng thông qua các chiến lược marketing sáng tạo.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    }
  },
  {
    name: 'Phạm Văn Nam',
    role: 'Operations Manager',
    description: 'Nam đảm bảo mọi hoạt động vận hành diễn ra suôn sẻ, từ sản xuất đến giao hàng, mang đến trải nghiệm tốt nhất cho khách hàng.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    }
  }
]

const AboutTeam = () => {
  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionTitle>Đội ngũ của chúng tôi</SectionTitle>
          <SectionSubtitle>
            Gặp gỡ những con người tài năng và đam mê, 
            những người đang cùng nhau xây dựng Fashion Store mỗi ngày
          </SectionSubtitle>
        </SectionHeader>
        
        <TeamGrid>
          {teamMembers.map((member, index) => (
            <TeamCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <MemberImage>
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </MemberImage>
              
              <MemberInfo>
                <MemberName>{member.name}</MemberName>
                <MemberRole>{member.role}</MemberRole>
                <MemberDescription>{member.description}</MemberDescription>
                
                <SocialLinks>
                  <SocialLink href={member.social.linkedin} aria-label="LinkedIn">
                    <FiLinkedin />
                  </SocialLink>
                  <SocialLink href={member.social.twitter} aria-label="Twitter">
                    <FiTwitter />
                  </SocialLink>
                  <SocialLink href={member.social.instagram} aria-label="Instagram">
                    <FiInstagram />
                  </SocialLink>
                </SocialLinks>
              </MemberInfo>
            </TeamCard>
          ))}
        </TeamGrid>
      </Container>
    </Section>
  )
}

export default AboutTeam