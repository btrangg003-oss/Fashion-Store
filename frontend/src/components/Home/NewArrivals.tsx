import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'

const NewArrivals = () => {
  return (
    <Container>
      <ContentWrapper>
        <TextSection>
          <Label>HÀNG MỚI VỀ</Label>
          <Title>Xu Hướng Mới<br />Vải Slimme Tự Nhiên<br />Thoáng Mát</Title>
          <Description>
            Vải Slimme Tự Nhiên thoáng mát, mềm mại, co giãn, tôn dáng mang lại phong cách hiện đại và thoải mái cho người mặc.
          </Description>
          <ViewMoreButton href="/products?filter=new">
            Xem thêm
          </ViewMoreButton>
        </TextSection>
        
        <ImageSection>
          <MainImage 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80" 
            alt="Xu hướng mới"
          />
          <BrandWatermark>SLIMME</BrandWatermark>
        </ImageSection>
      </ContentWrapper>
    </Container>
  )
}

const Container = styled.div`
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 20px;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 60px;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  overflow: hidden;
  min-height: 500px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 0;
    min-height: auto;
  }
`

const TextSection = styled.div`
  padding: 60px 40px;
  
  @media (max-width: 1024px) {
    padding: 40px 30px;
  }
`

const Label = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #666;
  letter-spacing: 2px;
  margin-bottom: 20px;
`

const Title = styled.h2`
  font-size: 40px;
  font-weight: 800;
  color: #000;
  line-height: 1.3;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 30px;
  }
`

const Description = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 30px;
`

const ViewMoreButton = styled(Link)`
  display: inline-block;
  padding: 14px 40px;
  background: #ff6b35;
  color: white;
  border-radius: 30px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff5722;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
  }
`

const ImageSection = styled.div`
  position: relative;
  height: 400px;
  
  @media (max-width: 1024px) {
    height: 350px;
  }
`

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
`

const BrandWatermark = styled.div`
  position: absolute;
  bottom: 30px;
  right: 30px;
  font-size: 48px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 4px;
  
  @media (max-width: 768px) {
    font-size: 32px;
    bottom: 20px;
    right: 20px;
  }
`

export default NewArrivals
