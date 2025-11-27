import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { Review, ReviewStats } from '@/models/reviews';

interface ProductReviewsProps {
  productId: string;
  refreshTrigger?: number; // Optional refresh trigger from parent
}

export default function ProductReviews({ productId, refreshTrigger = 0 }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <LoadingText>Đang tải đánh giá...</LoadingText>;
  }

  return (
    <Container>
      {stats && stats.total > 0 ? (
        <>
          <SummarySection>
            <RatingOverview>
              <AverageRating>{stats.average.toFixed(1)}</AverageRating>
              <Stars>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={24}
                    color={star <= Math.round(stats.average) ? '#fbbf24' : '#e5e7eb'}
                  />
                ))}
              </Stars>
              <TotalReviews>{stats.total} đánh giá</TotalReviews>
            </RatingOverview>

            <RatingBreakdown>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.breakdown[rating as keyof typeof stats.breakdown];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                return (
                  <BreakdownRow key={rating}>
                    <RatingLabel>{rating} <FaStar size={12} color="#fbbf24" /></RatingLabel>
                    <ProgressBar>
                      <ProgressFill width={percentage} />
                    </ProgressBar>
                    <CountLabel>{count}</CountLabel>
                  </BreakdownRow>
                );
              })}
            </RatingBreakdown>
          </SummarySection>

          <ReviewsList>
            {reviews.map((review) => (
              <ReviewCard key={review.id}>
                <ReviewHeader>
                  <UserInfo>
                    <FaUserCircle size={40} color="#9ca3af" />
                    <div>
                      <UserName>{review.userName || 'Khách hàng'}</UserName>
                      {review.verified && <VerifiedBadge>✓ Đã mua hàng</VerifiedBadge>}
                    </div>
                  </UserInfo>
                  <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                </ReviewHeader>

                <ReviewRating>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={16}
                      color={star <= review.rating ? '#fbbf24' : '#e5e7eb'}
                    />
                  ))}
                </ReviewRating>

                {review.title && <ReviewTitle>{review.title}</ReviewTitle>}
                <ReviewComment>{review.comment}</ReviewComment>

                {review.photos && review.photos.length > 0 && (
                  <ReviewPhotos>
                    {review.photos.map((photo, index) => (
                      <PhotoThumb key={index}>
                        <img src={photo} alt={`Review ${index + 1}`} />
                      </PhotoThumb>
                    ))}
                  </ReviewPhotos>
                )}

                {review.helpful > 0 && (
                  <HelpfulCount>👍 {review.helpful} người thấy hữu ích</HelpfulCount>
                )}
              </ReviewCard>
            ))}
          </ReviewsList>
        </>
      ) : (
        <EmptyState>
          <EmptyIcon>📝</EmptyIcon>
          <EmptyTitle>Chưa có đánh giá nào</EmptyTitle>
          <EmptyText>Hãy là người đầu tiên đánh giá sản phẩm này!</EmptyText>
        </EmptyState>
      )}
    </Container>
  );
}

const Container = styled.div``;

const LoadingText = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
`;

const SummarySection = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RatingOverview = styled.div`
  text-align: center;
`;

const AverageRating = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Stars = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
`;

const TotalReviews = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const RatingBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BreakdownRow = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  align-items: center;
  gap: 1rem;
`;

const RatingLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${props => props.width}%;
  background: #fbbf24;
  transition: width 0.3s ease;
`;

const CountLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: right;
`;

const ReviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ReviewCard = styled.div`
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const VerifiedBadge = styled.div`
  font-size: 0.75rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ReviewDate = styled.div`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const ReviewRating = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
`;

const ReviewTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const ReviewComment = styled.p`
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ReviewPhotos = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const PhotoThumb = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e5e7eb;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const HelpfulCount = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #6b7280;
`;
