import Image from 'next/image'
import styled from 'styled-components'
import { motion } from 'framer-motion'

const Section = styled.section`
  padding: 100px 0;
  background: white;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const StoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  margin-bottom: 100px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  &:nth-child(even) {
    .story-content {
      order: 2;
    }
    
    .story-image {
      order: 1;
    }
    
    @media (max-width: 768px) {
      .story-content {
        order: 1;
      }
      
      .story-image {
        order: 2;
      }
    }
  }
`

const StoryContent = styled(motion.div)`
  h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #000;
    line-height: 1.2;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  p {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }
  
  .highlight {
    color: #e74c3c;
    font-weight: 600;
  }
`

const StoryImage = styled(motion.div)`
  position: relative;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    height: 300px;
  }
`

const Timeline = styled.div`
  position: relative;
  padding: 60px 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #e74c3c, #3498db);
    transform: translateX(-50%);
    
    @media (max-width: 768px) {
      left: 20px;
    }
  }
`

const TimelineItem = styled(motion.div)<{ isLeft: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 60px;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-left: 40px;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 16px;
    height: 16px;
    background: #e74c3c;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    
    @media (max-width: 768px) {
      left: -28px;
    }
  }
`

const TimelineContent = styled.div<{ isLeft: boolean }>`
  width: 45%;
  ${props => props.isLeft ? 'margin-right: auto; text-align: right;' : 'margin-left: auto; text-align: left;'}
  
  @media (max-width: 768px) {
    width: 100%;
    text-align: left;
    margin: 0;
  }
  
  .year {
    font-size: 1.5rem;
    font-weight: 700;
    color: #e74c3c;
    margin-bottom: 0.5rem;
  }
  
  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #000;
  }
  
  p {
    color: #666;
    line-height: 1.6;
  }
`

const AboutStory = () => {
  const timelineData = [
    {
      year: '2014',
      title: 'Khởi đầu với ước mơ',
      description: 'Fashion Store được thành lập với ước mơ mang đến thời trang chất lượng cao cho người Việt Nam.'
    },
    {
      year: '2016',
      title: 'Mở rộng thị trường',
      description: 'Khai trương 5 cửa hàng đầu tiên tại Hà Nội và TP.HCM, đánh dấu bước phát triển quan trọng.'
    },
    {
      year: '2018',
      title: 'Ra mắt bộ sưu tập đặc biệt',
      description: 'Hợp tác với các nhà thiết kế nổi tiếng, tạo ra những bộ sưu tập độc quyền và ấn tượng.'
    },
    {
      year: '2020',
      title: 'Chuyển đổi số',
      description: 'Phát triển nền tảng thương mại điện tử, mang trải nghiệm mua sắm trực tuyến tuyệt vời.'
    },
    {
      year: '2024',
      title: 'Thương hiệu hàng đầu',
      description: 'Trở thành một trong những thương hiệu thời trang được yêu thích nhất Việt Nam.'
    }
  ]

  return (
    <Section>
      <Container>
        <StoryGrid>
          <StoryContent
            className="story-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Sứ mệnh của chúng tôi</h2>
            <p>
              Tại Fashion Store, chúng tôi tin rằng <span className="highlight">thời trang không chỉ là trang phục</span>, 
              mà là cách thể hiện cá tính và phong cách sống của mỗi người.
            </p>
            <p>
              Chúng tôi cam kết mang đến những sản phẩm chất lượng cao với thiết kế hiện đại, 
              giúp khách hàng tự tin thể hiện bản thân trong mọi hoàn cảnh.
            </p>
          </StoryContent>
          
          <StoryImage
            className="story-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Fashion Store Mission"
              fill
              style={{ objectFit: 'cover' }}
            />
          </StoryImage>
        </StoryGrid>

        <StoryGrid>
          <StoryContent
            className="story-content"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Tầm nhìn tương lai</h2>
            <p>
              Chúng tôi hướng tới việc trở thành <span className="highlight">thương hiệu thời trang hàng đầu Đông Nam Á</span>, 
              không ngừng đổi mới và sáng tạo để mang đến những trải nghiệm tuyệt vời nhất.
            </p>
            <p>
              Với cam kết về chất lượng và dịch vụ khách hàng, Fashion Store sẽ tiếp tục 
              đồng hành cùng khách hàng trên hành trình khẳng định phong cách cá nhân.
            </p>
          </StoryContent>
          
          <StoryImage
            className="story-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Fashion Store Vision"
              fill
              style={{ objectFit: 'cover' }}
            />
          </StoryImage>
        </StoryGrid>

        <Timeline>
          {timelineData.map((item, index) => (
            <TimelineItem
              key={index}
              isLeft={index % 2 === 0}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <TimelineContent isLeft={index % 2 === 0}>
                <div className="year">{item.year}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
    </Section>
  )
}

export default AboutStory