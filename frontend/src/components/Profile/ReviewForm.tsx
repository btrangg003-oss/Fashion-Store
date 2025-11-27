import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaStar, FaTimes } from 'react-icons/fa';
import { Review, PendingReview, ReviewRating } from '@/models/reviews';
import { useProfileSync } from '@/contexts/ProfileSyncContext';
import { ImageUploadZone } from './ImageUploadZone';

interface ReviewFormProps {
  pending?: PendingReview | null;
  review?: Review | null;
  onClose: (success: boolean) => void;
}

const RATING_LABELS: Record<ReviewRating, string> = {
  1: 'Rất tệ',
  2: 'Tệ',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Rất tốt'
};

const ReviewForm: React.FC<ReviewFormProps> = ({ pending, review, onClose }) => {
  const { refreshReviews, refreshLoyalty } = useProfileSync();
  
  const [rating, setRating] = useState<ReviewRating | 0>(review?.rating || 0);
  const [hoverRating, setHoverRating] = useState<ReviewRating | 0>(0);
  const [title, setTitle] = useState(review?.title || '');
  const [comment, setComment] = useState(review?.comment || '');
  const [photos, setPhotos] = useState<string[]>(review?.photos || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!review;
  const productName = review?.productName || pending?.productName || '';
  const productImage = review?.productImage || pending?.productImage || '';

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (rating === 0) {
      setError('Vui lòng chọn số sao');
      return;
    }

    if (title.length < 5 || title.length > 100) {
      setError('Tiêu đề phải từ 5-100 ký tự');
      return;
    }

    if (comment.length < 10 || comment.length > 1000) {
      setError('Nội dung phải từ 10-1000 ký tự');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      if (isEdit) {
        // Update existing review
        const response = await fetch(`/api/reviews/${review.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            rating,
            title,
            comment,
            photos
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Cập nhật thất bại');
        }

        alert('✅ Cập nhật đánh giá thành công!');
        refreshReviews();
        onClose(true);
      } else {
        // Create new review
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: pending?.orderId,
            productId: pending?.productId,
            rating,
            title,
            comment,
            photos
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Đánh giá thất bại');
        }

        const data = await response.json();
        
        // Show success with points
        const pointsMessage = data.pointsAwarded 
          ? `\n🎉 Bạn nhận được +${data.pointsAwarded} điểm thưởng!`
          : '';
        
        alert(`✅ Đánh giá thành công!${pointsMessage}\n\nCảm ơn bạn đã chia sẻ!`);
        
        // Refresh both reviews and loyalty
        refreshReviews();
        refreshLoyalty();
        onClose(true);
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => onClose(false)}
    >
      <Modal
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Header>
          <h2>{isEdit ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</h2>
          <CloseButton onClick={() => onClose(false)}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Content>
          <ProductInfo>
            <img src={productImage} alt={productName} />
            <div>
              <h3>{productName}</h3>
            </div>
          </ProductInfo>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label>Đánh giá của bạn *</Label>
            <RatingContainer>
              <Stars>
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarButton
                    key={star}
                    type="button"
                    selected={star <= (hoverRating || rating)}
                    onClick={() => setRating(star as ReviewRating)}
                    onMouseEnter={() => setHoverRating(star as ReviewRating)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <FaStar />
                  </StarButton>
                ))}
              </Stars>
              {rating > 0 && (
                <RatingLabel>{RATING_LABELS[rating as ReviewRating]}</RatingLabel>
              )}
            </RatingContainer>
          </FormGroup>

          <FormGroup>
            <Label>Tiêu đề *</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt đánh giá của bạn"
              maxLength={100}
            />
            <CharCount>{title.length}/100</CharCount>
          </FormGroup>

          <FormGroup>
            <Label>Nội dung đánh giá *</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              rows={5}
              maxLength={1000}
            />
            <CharCount>{comment.length}/1000</CharCount>
          </FormGroup>

          <ImageUploadZone
            images={photos}
            onImagesChange={setPhotos}
            maxImages={5}
            maxSizeMB={5}
          />

          <Actions>
            <CancelButton type="button" onClick={() => onClose(false)}>
              Hủy
            </CancelButton>
            <SubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={loading || rating === 0}
            >
              {loading ? 'Đang gửi...' : isEdit ? 'Cập nhật' : 'Gửi đánh giá'}
            </SubmitButton>
          </Actions>
        </Content>
      </Modal>
    </Overlay>
  );
};

export default ReviewForm;

// Styled Components
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
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;

  h2 {
    margin: 0;
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const ProductInfo = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;

  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }

  h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  border-left: 3px solid #c33;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
`;

const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Stars = styled.div`
  display: flex;
  gap: 8px;
`;

const StarButton = styled.button<{ selected: boolean }>`
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  color: ${props => props.selected ? '#fbbf24' : '#e0e0e0'};
  transition: all 0.2s;
  padding: 0;

  &:hover {
    transform: scale(1.1);
  }
`;

const RatingLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #667eea;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #e0e0e0;
  }
`;

const SubmitButton = styled.button`
  flex: 2;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #5568d3;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
