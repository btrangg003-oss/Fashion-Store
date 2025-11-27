import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { 
  getReviewById,
  updateReview,
  deleteReview
} from '@/lib/reviewService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.userId;
    const reviewId = req.query.id as string;

    if (req.method === 'GET') {
      // Get review by ID
      const review = getReviewById(reviewId);
      
      if (!review) {
        return res.status(404).json({ error: 'Không tìm thấy đánh giá' });
      }

      // Check ownership
      if (review.userId !== userId) {
        return res.status(403).json({ 
          error: 'Bạn không có quyền xem đánh giá này' 
        });
      }

      return res.status(200).json({ review });
    }

    if (req.method === 'PUT') {
      // Update review
      const { rating, title, comment, photos } = req.body;

      // Validation
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ 
          error: 'Đánh giá phải từ 1-5 sao' 
        });
      }

      if (title && (title.length < 5 || title.length > 100)) {
        return res.status(400).json({ 
          error: 'Tiêu đề phải từ 5-100 ký tự' 
        });
      }

      if (comment && (comment.length < 10 || comment.length > 1000)) {
        return res.status(400).json({ 
          error: 'Nội dung phải từ 10-1000 ký tự' 
        });
      }

      if (photos && photos.length > 5) {
        return res.status(400).json({ 
          error: 'Tối đa 5 ảnh' 
        });
      }

      const review = updateReview(reviewId, userId, {
        rating,
        title,
        comment,
        photos
      });

      return res.status(200).json({ 
        message: 'Cập nhật đánh giá thành công',
        review 
      });
    }

    if (req.method === 'DELETE') {
      // Delete review
      deleteReview(reviewId, userId);

      return res.status(200).json({ 
        message: 'Xóa đánh giá thành công' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Review API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
