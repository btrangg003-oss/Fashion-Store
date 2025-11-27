// Review Types

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  userId: string;
  userName?: string; // Display name of reviewer
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  rating: ReviewRating;
  title: string;
  comment: string;
  photos: string[]; // max 5 photos
  helpful: number; // helpful votes count
  verified: boolean; // verified purchase
  createdAt: string;
  updatedAt: string;
  status: ReviewStatus;
}

export interface PendingReview {
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  deliveredAt: string;
  canReview: boolean;
}

export interface CreateReviewInput {
  orderId: string;
  productId: string;
  rating: ReviewRating;
  title: string;
  comment: string;
  photos?: string[];
}

export interface UpdateReviewInput {
  rating?: ReviewRating;
  title?: string;
  comment?: string;
  photos?: string[];
}

export interface ReviewStats {
  total: number;
  average: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
