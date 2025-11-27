import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiStar, FiUpload } from 'react-icons/fi';

interface ReviewOrderModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, reviews: any[]) => void;
}

const ReviewOrderModal: React.FC<ReviewOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [reviews, setReviews] = useState<any[]>(
    order?.items?.map((item: any) => ({
      productId: item.productId,
      productName: item.name,
      rating: 5,
      comment: '',
      images: []
    })) || []
  );

  const handleRatingChange = (index: number, rating: number) => {
    const newReviews = [...reviews];
    newReviews[index].rating = rating;
    setReviews(newReviews);
  };

  const handleCommentChange = (index: number, comment: string) => {
    const newReviews = [...reviews];
    newReviews[index].comment = comment;
    setReviews(newReviews);
  };

  const handleSubmit = () => {
    onSubmit(order.id, reviews);
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalContainer
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <Title>Đánh giá đơn hàng</Title>
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </Header>

          <Content>
            <OrderInfo>
              <InfoLabel>Mã đơn hàng:</InfoLabel>
              <InfoValue>{order.orderNumber}</InfoValue>
            </OrderInfo>

            <ProductsList>
              {reviews.map((review, index) => (
                <ProductReview key={index}>
                  <ProductName>{review.productName}</ProductName>
                  
                  <RatingSection>
                    <RatingLabel>Đánh giá của bạn:</RatingLabel>
                    <Stars>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          active={star <= review.rating}
                          onClick={() => handleRatingChange(index, star)}
                        >
                          <FiStar />
                        </Star>
                      ))}
                    </Stars>
                  </RatingSection>

                  <CommentSection>
                    <CommentLabel>Nhận xét:</CommentLabel>
                    <CommentTextarea
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      value={review.comment}
                      onChange={(e) => handleCommentChange(index, e.target.value)}
                      rows={3}
                    />
                  </CommentSection>
                </ProductReview>
              ))}
            </ProductsList>

            <RewardInfo>
              🎁 Nhận <strong>50 điểm</strong> cho mỗi đánh giá!
            </RewardInfo>
          </Content>

          <Footer>
            <CancelButton onClick={onClose}>
              Để sau
            </CancelButton>
            <SubmitButton onClick={handleSubmit}>
              Gửi đánh giá
            </SubmitButton>
          </Footer>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
};

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: #333;
    transform: rotate(90deg);
  }
`;

const Content = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const OrderInfo = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #666;
`;

const InfoValue = styled.span`
  color: #333;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProductReview = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
`;

const ProductName = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
`;

const RatingSection = styled.div`
  margin-bottom: 16px;
`;

const RatingLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Stars = styled.div`
  display: flex;
  gap: 8px;
`;

const Star = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  font-size: 2rem;
  color: ${props => props.active ? '#ffc107' : '#ddd'};
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.2);
    color: #ffc107;
  }

  svg {
    fill: ${props => props.active ? '#ffc107' : 'none'};
  }
`;

const CommentSection = styled.div``;

const CommentLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RewardInfo = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  text-align: center;
  font-size: 0.95rem;

  strong {
    font-size: 1.1rem;
  }
`;

const Footer = styled.div`
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f0f0f0;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 14px;
  background: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const SubmitButton = styled.button`
  flex: 2;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
`;

export default ReviewOrderModal;
