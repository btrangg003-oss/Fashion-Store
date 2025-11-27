import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaEdit, FaTrash, FaClock } from 'react-icons/fa';
import { Review, PendingReview } from '@/models/reviews';
import ReviewForm from './ReviewForm';
import { useProfileSync } from '@/contexts/ProfileSyncContext';

const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 12px;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'white' : 'transparent'};
  border: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  border-radius: 10px;
  color: ${props => props.active ? '#667eea' : '#6b7280'};
  font-weight: ${props => props.active ? '700' : '500'};
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(102, 126, 234, 0.15)' : 'none'};

  &:hover {
    background: white;
    color: #667eea;
    border-color: #667eea;
  }
`;

const Badge = styled.span`
  background: #667eea;
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border-radius: 20px;
  border: 2px dashed #d1d5db;
  color: #6b7280;

  svg {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    color: #d1d5db;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }

  h3 {
    margin: 0 0 0.75rem 0;
    color: #111827;
    font-size: 1.5rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 1rem;
  }
`;

const PendingCard = styled(motion.div)`
  background: white;
  border: 2px solid #f3f4f6;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ProductImage = styled.img`
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 12px;
  flex-shrink: 0;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const ProductInfo = styled.div`
  flex: 1;

  h4 {
    margin: 0 0 0.75rem 0;
    color: #111827;
    font-size: 1.05rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      color: #9ca3af;
    }
  }
`;

const ReviewButton = styled.button`
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);

  &:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ReviewCard = styled(motion.div)`
  background: white;
  border: 2px solid #f3f4f6;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:hover {
    border-color: #e5e7eb;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  gap: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid #f3f4f6;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ReviewProduct = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;

  img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  div {
    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #111827;
    }
  }
`;

const Stars = styled.div`
  display: flex;
  gap: 0.25rem;

  svg {
    font-size: 1.125rem;
  }
`;

const ReviewActions = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  padding: 0.625rem 1.125rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.25s ease;

  &:hover {
    background: #f9fafb;
    border-color: #667eea;
    color: #667eea;
  }

  &.delete {
    color: #ef4444;
    border-color: #fecaca;

    &:hover {
      background: #fef2f2;
      border-color: #ef4444;
    }
  }
`;

const ReviewContent = styled.div`
  margin-bottom: 1.25rem;

  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1.05rem;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0;
    color: #6b7280;
    line-height: 1.7;
    font-size: 0.95rem;
  }
`;

const ReviewPhotos = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;

  img {
    width: 90px;
    height: 90px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    &:hover {
      transform: scale(1.05);
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }
  }
`;

const ReviewFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.25rem;
  border-top: 2px solid #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const VerifiedBadge = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
`;

const ReviewsTab: React.FC = () => {
  const { reviewsRefreshCount } = useProfileSync();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [completedReviews, setCompletedReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingReview | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchData();
  }, [reviewsRefreshCount]); // Re-fetch when reviews are updated

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch pending reviews
      const pendingRes = await fetch('/api/reviews/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      
      // Fetch completed reviews
      const completedRes = await fetch('/api/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const completedData = await completedRes.json();
      
      setPendingReviews(pendingData.pendingReviews || []);
      setCompletedReviews(completedData.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = (pending: PendingReview) => {
    setSelectedPending(pending);
    setEditingReview(null);
    setShowForm(true);
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setSelectedPending(null);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Xóa đánh giá thành công');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleFormClose = (success: boolean) => {
    setShowForm(false);
    setSelectedPending(null);
    setEditingReview(null);
    if (success) {
      fetchData();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <Container>Đang tải...</Container>;
  }

  return (
    <Container>
      <Tabs>
        <Tab 
          active={activeTab === 'pending'} 
          onClick={() => setActiveTab('pending')}
        >
          Chờ đánh giá
          {pendingReviews.length > 0 && <Badge>{pendingReviews.length}</Badge>}
        </Tab>
        <Tab 
          active={activeTab === 'completed'} 
          onClick={() => setActiveTab('completed')}
        >
          Đã đánh giá
          {completedReviews.length > 0 && <Badge>{completedReviews.length}</Badge>}
        </Tab>
      </Tabs>

      <AnimatePresence mode="wait">
        {activeTab === 'pending' && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {pendingReviews.length === 0 ? (
              <EmptyState>
                <FaStar />
                <h3>Không có sản phẩm chờ đánh giá</h3>
                <p>Các sản phẩm đã giao sẽ xuất hiện ở đây</p>
              </EmptyState>
            ) : (
              pendingReviews.map((pending, index) => (
                <PendingCard
                  key={`${pending.orderId}-${pending.productId}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductImage src={pending.productImage} alt={pending.productName} />
                  <ProductInfo>
                    <h4>{pending.productName}</h4>
                    <p>
                      <FaClock />
                      Đã giao: {formatDate(pending.deliveredAt)}
                    </p>
                  </ProductInfo>
                  <ReviewButton onClick={() => handleWriteReview(pending)}>
                    Viết đánh giá
                  </ReviewButton>
                </PendingCard>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {completedReviews.length === 0 ? (
              <EmptyState>
                <FaStar />
                <h3>Chưa có đánh giá nào</h3>
                <p>Hãy đánh giá sản phẩm đã mua để giúp người khác</p>
              </EmptyState>
            ) : (
              completedReviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ReviewHeader>
                    <ReviewProduct>
                      <img src={review.productImage} alt={review.productName} />
                      <div>
                        <h4>{review.productName}</h4>
                        <Stars>
                          {[1, 2, 3, 4, 5].map(star => (
                            <FaStar key={star} style={{ 
                              color: star <= review.rating ? '#ffc107' : '#e0e0e0' 
                            }} />
                          ))}
                        </Stars>
                      </div>
                    </ReviewProduct>
                    <ReviewActions>
                      <ActionButton onClick={() => handleEditReview(review)}>
                        <FaEdit /> Sửa
                      </ActionButton>
                      <ActionButton 
                        className="delete" 
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <FaTrash /> Xóa
                      </ActionButton>
                    </ReviewActions>
                  </ReviewHeader>

                  <ReviewContent>
                    <h4>{review.title}</h4>
                    <p>{review.comment}</p>
                  </ReviewContent>

                  {review.photos.length > 0 && (
                    <ReviewPhotos>
                      {review.photos.map((photo, idx) => (
                        <img key={idx} src={photo} alt={`Review ${idx + 1}`} />
                      ))}
                    </ReviewPhotos>
                  )}

                  <ReviewFooter>
                    <div>
                      {review.verified && <VerifiedBadge>✓ Đã mua hàng</VerifiedBadge>}
                    </div>
                    <div>{formatDate(review.createdAt)}</div>
                  </ReviewFooter>
                </ReviewCard>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showForm && (
        <ReviewForm
          pending={selectedPending}
          review={editingReview}
          onClose={handleFormClose}
        />
      )}
    </Container>
  );
};

export default ReviewsTab;
