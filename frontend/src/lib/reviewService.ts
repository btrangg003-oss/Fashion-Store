// Review Service
import fs from 'fs';
import path from 'path';
import { Review, CreateReviewInput, UpdateReviewInput, ReviewStats } from '@/types/reviews';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read reviews from file
const readReviews = (): Review[] => {
  ensureDataDir();
  if (!fs.existsSync(REVIEWS_FILE)) {
    const initialData = { reviews: [] };
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(initialData, null, 2));
    return [];
  }
  const data = fs.readFileSync(REVIEWS_FILE, 'utf-8');
  const parsed = JSON.parse(data);
  // Handle both formats: { reviews: [...] } or [...]
  return parsed.reviews || parsed;
};

// Write reviews to file
const writeReviews = (reviews: Review[]): void => {
  ensureDataDir();
  const data = { reviews };
  fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2));
};

// Generate unique ID
const generateId = (): string => {
  return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get all reviews for a user
export const getUserReviews = (userId: string): Review[] => {
  const reviews = readReviews();
  return reviews.filter(r => r.userId === userId);
};

// Get review by ID
export const getReviewById = (reviewId: string): Review | null => {
  const reviews = readReviews();
  return reviews.find(r => r.id === reviewId) || null;
};

// Get reviews for a product
export const getProductReviews = (productId: string): Review[] => {
  const reviews = readReviews();
  return reviews.filter(r => r.productId === productId && r.status === 'approved');
};

// Check if user has reviewed a product in an order
export const hasUserReviewedProduct = (userId: string, orderId: string, productId: string): boolean => {
  const reviews = readReviews();
  return reviews.some(r => 
    r.userId === userId && 
    r.orderId === orderId && 
    r.productId === productId
  );
};

// Create new review
export const createReview = (
  userId: string,
  input: CreateReviewInput,
  productName: string,
  productImage: string,
  userName?: string
): Review => {
  const reviews = readReviews();
  
  // Check if already reviewed
  const existing = reviews.find(r => 
    r.userId === userId && 
    r.orderId === input.orderId && 
    r.productId === input.productId
  );
  
  if (existing) {
    throw new Error('Bạn đã đánh giá sản phẩm này rồi');
  }
  
  const newReview: Review = {
    id: generateId(),
    userId,
    userName: userName || 'Khách hàng',
    orderId: input.orderId,
    productId: input.productId,
    productName,
    productImage,
    rating: input.rating,
    title: input.title,
    comment: input.comment,
    photos: input.photos || [],
    helpful: 0,
    verified: true, // verified purchase
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'approved' // auto-approve for now
  };
  
  reviews.push(newReview);
  writeReviews(reviews);
  
  return newReview;
};

// Update review
export const updateReview = (
  reviewId: string,
  userId: string,
  input: UpdateReviewInput
): Review => {
  const reviews = readReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  
  if (index === -1) {
    throw new Error('Không tìm thấy đánh giá');
  }
  
  const review = reviews[index];
  
  // Check ownership
  if (review.userId !== userId) {
    throw new Error('Bạn không có quyền sửa đánh giá này');
  }
  
  // Update fields
  if (input.rating !== undefined) review.rating = input.rating;
  if (input.title !== undefined) review.title = input.title;
  if (input.comment !== undefined) review.comment = input.comment;
  if (input.photos !== undefined) review.photos = input.photos;
  review.updatedAt = new Date().toISOString();
  
  reviews[index] = review;
  writeReviews(reviews);
  
  return review;
};

// Delete review
export const deleteReview = (reviewId: string, userId: string): boolean => {
  const reviews = readReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  
  if (index === -1) {
    throw new Error('Không tìm thấy đánh giá');
  }
  
  const review = reviews[index];
  
  // Check ownership
  if (review.userId !== userId) {
    throw new Error('Bạn không có quyền xóa đánh giá này');
  }
  
  reviews.splice(index, 1);
  writeReviews(reviews);
  
  return true;
};

// Get review statistics for a product
export const getProductReviewStats = (productId: string): ReviewStats => {
  const reviews = getProductReviews(productId);
  
  const breakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };
  
  let totalRating = 0;
  
  reviews.forEach(review => {
    breakdown[review.rating]++;
    totalRating += review.rating;
  });
  
  return {
    total: reviews.length,
    average: reviews.length > 0 ? totalRating / reviews.length : 0,
    breakdown
  };
};

// Add helpful vote
export const addHelpfulVote = (reviewId: string): Review => {
  const reviews = readReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  
  if (index === -1) {
    throw new Error('Không tìm thấy đánh giá');
  }
  
  reviews[index].helpful++;
  writeReviews(reviews);
  
  return reviews[index];
};
