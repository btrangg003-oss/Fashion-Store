import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

const reviews = [
  {
    id: 1,
    name: 'Hương Trang',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment: 'Sản phẩm rất đẹp và chất lượng tốt. Mình rất hài lòng với lần mua hàng này. Chất vải mềm mại, form dáng chuẩn. Sẽ ủng hộ shop lâu dài!'
  },
  {
    id: 2,
    name: 'Bảo My',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    comment: 'Giao hàng nhanh, đóng gói cẩn thận. Sản phẩm đúng như mô tả, màu sắc đẹp. Giá cả hợp lý. Rất đáng mua!'
  },
  {
    id: 3,
    name: 'Hồng Nhung',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    comment: 'Chất liệu cao cấp, mặc rất thoải mái. Thiết kế sang trọng, phù hợp đi làm và dự tiệc. Mình đã giới thiệu cho bạn bè rồi!'
  }
];

const CustomerReviews = () => {
  return (
    <Container>
      <Header>
        <SectionTitle>Hơn 5K Khách Hàng Tin Tưởng</SectionTitle>
        <Description>Những lời đánh giá chân thật từ khách hàng của chúng tôi</Description>
      </Header>
      
      <ReviewsGrid>
        {reviews.map((review) => (
          <ReviewCard key={review.id}>
            <QuoteIcon>"</QuoteIcon>
            <ReviewText>{review.comment}</ReviewText>
            <ReviewFooter>
              <Avatar src={review.avatar} alt={review.name} />
              <ReviewerInfo>
                <ReviewerName>{review.name}</ReviewerName>
                <Rating>
                  {[...Array(review.rating)].map((_, i) => (
                    <FiStar key={i} fill="#ffc107" color="#ffc107" />
                  ))}
                </Rating>
              </ReviewerInfo>
            </ReviewFooter>
          </ReviewCard>
        ))}
      </ReviewsGrid>
      
      <ViewAllButton>
        <Link href="/reviews">Xem Tất Cả</Link>
      </ViewAllButton>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 20px;
  background: #f9f9f9;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const SectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 16px;
  color: #666;
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ReviewCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
`;

const QuoteIcon = styled.div`
  font-size: 60px;
  color: #ff6b35;
  opacity: 0.2;
  line-height: 1;
  margin-bottom: -20px;
`;

const ReviewText = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 20px;
`;

const ReviewFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const ReviewerInfo = styled.div``;

const ReviewerName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
`;

const Rating = styled.div`
  display: flex;
  gap: 2px;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const ViewAllButton = styled.div`
  text-align: center;
  margin-top: 40px;
  
  a {
    display: inline-block;
    padding: 12px 40px;
    background: #ff6b35;
    color: white;
    border-radius: 25px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    
    &:hover {
      background: #ff5722;
      transform: translateY(-2px);
    }
  }
`;

export default CustomerReviews;
