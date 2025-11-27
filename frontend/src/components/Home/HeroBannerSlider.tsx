import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
    badge: 'BEAN Style',
    title: 'Săn DEAL CHÀO THU',
    subtitle: 'PHONG CÁCH Chuẩn gu 🍂',
    discount: '99K',
    discountLabel: 'CHỈ TỪ',
    voucher: 'VOUCHER ĐỘC QUYỀN',
    note: 'LIÊN HỆ TƯ VẤN NÀO!'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
    badge: 'NEW ARRIVAL',
    title: 'BỘ SƯU TẬP MỚI',
    subtitle: 'XU HƯỚNG 2025',
    discount: '50%',
    discountLabel: 'GIẢM ĐẾN',
    voucher: 'FREESHIP ĐƠN 399K',
    note: 'MUA NGAY KẺO HẾT!'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80',
    badge: 'OFFICE STYLE',
    title: 'THỜI TRANG CÔNG SỞ',
    subtitle: 'THANH LỊCH & SANG TRỌNG',
    discount: '299K',
    discountLabel: 'TỪ',
    voucher: 'GIẢM THÊM 10%',
    note: 'CHO ĐƠN ĐẦU TIÊN'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80',
    badge: 'HOT DEAL',
    title: 'PHỤ KIỆN THỜI TRANG',
    subtitle: 'HOÀN THIỆN PHONG CÁCH',
    discount: '1+1',
    discountLabel: 'MUA',
    voucher: 'TẶNG QUÀ XINH',
    note: 'SỐ LƯỢNG CÓ HẠN'
  }
];

const HeroBannerSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <SliderContainer>
      <SliderWrapper style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
        {banners.map((banner) => (
          <Slide key={banner.id}>
            <SlideImage src={banner.image} alt={banner.title} />
            <SlideContent>
              <SlideBadge>{banner.badge}</SlideBadge>
              <SlideTitle>{banner.title}</SlideTitle>
              <SlideSubtitle>{banner.subtitle}</SlideSubtitle>
              <DiscountBox>
                <DiscountLabel>{banner.discountLabel}</DiscountLabel>
                <SlideDiscount>{banner.discount}</SlideDiscount>
              </DiscountBox>
              <VoucherBadge>{banner.voucher}</VoucherBadge>
              <SlideNote>{banner.note}</SlideNote>
              <ShopButton>MUA NGAY</ShopButton>
            </SlideContent>
          </Slide>
        ))}
      </SliderWrapper>

      <NavButton onClick={prevSlide} $position="left">
        <FiChevronLeft />
      </NavButton>
      <NavButton onClick={nextSlide} $position="right">
        <FiChevronRight />
      </NavButton>

      <Dots>
        {banners.map((_, index) => (
          <Dot
            key={index}
            $active={index === currentSlide}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </Dots>
    </SliderContainer>
  );
};

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 350px;
  }
`;

const SliderWrapper = styled.div`
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
`;

const Slide = styled.div`
  min-width: 100%;
  height: 100%;
  position: relative;
`;

const SlideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SlideContent = styled.div`
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  color: white;
  text-align: right;
  max-width: 500px;
  
  @media (max-width: 768px) {
    right: 5%;
    max-width: 300px;
  }
`;

const SlideBadge = styled.div`
  display: inline-block;
  padding: 6px 20px;
  background: rgba(255, 107, 53, 0.9);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 15px;
  letter-spacing: 1px;
`;

const SlideTitle = styled.h2`
  font-size: 56px;
  font-weight: 900;
  margin-bottom: 10px;
  line-height: 1.1;
  text-transform: uppercase;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const SlideSubtitle = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const DiscountBox = styled.div`
  display: inline-block;
  background: white;
  color: #ff6b35;
  padding: 20px 40px;
  border-radius: 15px;
  margin-bottom: 15px;
`;

const DiscountLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const SlideDiscount = styled.div`
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const VoucherBadge = styled.div`
  display: inline-block;
  padding: 8px 20px;
  background: rgba(255, 215, 0, 0.9);
  color: #d32f2f;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const SlideNote = styled.div`
  font-size: 14px;
  margin-bottom: 20px;
  font-weight: 500;
`;

const ShopButton = styled.button`
  padding: 12px 40px;
  background: #ff6b35;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff5722;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
  }
`;

const NavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$position}: 20px;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  color: #333;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: white;
    transform: translateY(-50%) scale(1.1);
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
`;

const Dots = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${props => props.$active ? '30px' : '10px'};
  height: 10px;
  background: ${props => props.$active ? '#ff6b35' : 'rgba(255, 255, 255, 0.5)'};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#ff6b35' : 'rgba(255, 255, 255, 0.8)'};
  }
`;

export default HeroBannerSlider;
