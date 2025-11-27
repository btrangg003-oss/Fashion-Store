import styled from 'styled-components'
import { motion } from 'framer-motion'

const Section = styled.section`
  padding: 80px 0;
  background: white;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
`

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
`

const MapContainer = styled(motion.div)`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: 400px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`

const MapPlaceholder = styled.div`
  text-align: center;
  color: #666;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    max-width: 400px;
  }
`

const StoreLocations = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 60px;
`

const StoreCard = styled(motion.div)`
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  
  h4 {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #000;
  }
  
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .store-name {
    color: #667eea;
    font-weight: 600;
  }
`

const ContactMap = () => {
  const stores = [
    {
      name: 'Fashion Store Nguyễn Huệ',
      address: '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
      phone: '(028) 1234 5678',
      hours: 'T2-CN: 9:00 - 22:00'
    },
    {
      name: 'Fashion Store Hàng Bài',
      address: '456 Phố Hàng Bài, Hoàn Kiếm, Hà Nội',
      phone: '(024) 8765 4321',
      hours: 'T2-CN: 9:00 - 21:30'
    },
    {
      name: 'Fashion Store Vincom',
      address: 'Tầng 3, Vincom Center, Đà Nẵng',
      phone: '(0236) 1111 2222',
      hours: 'T2-CN: 10:00 - 22:00'
    }
  ]

  return (
    <Section>
      <Container>
        <SectionHeader>
          <SectionTitle>Vị trí cửa hàng</SectionTitle>
          <SectionSubtitle>
            Tìm cửa hàng Fashion Store gần bạn nhất để trải nghiệm sản phẩm trực tiếp
          </SectionSubtitle>
        </SectionHeader>

        <MapContainer
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <MapPlaceholder>
            <h3>Bản đồ cửa hàng</h3>
            <p>
              Bản đồ tương tác sẽ được hiển thị ở đây. 
              Trong phiên bản thực tế, bạn có thể tích hợp Google Maps 
              hoặc các dịch vụ bản đồ khác để hiển thị vị trí chính xác của các cửa hàng.
            </p>
          </MapPlaceholder>
        </MapContainer>

        <StoreLocations>
          {stores.map((store, index) => (
            <StoreCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h4>
                <span className="store-name">{store.name}</span>
              </h4>
              <p><strong>Địa chỉ:</strong> {store.address}</p>
              <p><strong>Điện thoại:</strong> {store.phone}</p>
              <p><strong>Giờ mở cửa:</strong> {store.hours}</p>
            </StoreCard>
          ))}
        </StoreLocations>
      </Container>
    </Section>
  )
}

export default ContactMap