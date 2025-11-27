import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { 
  getUserReviews, 
  createReview 
} from '@/lib/reviewService';
import { getOrderById } from '@/lib/ordersDatabase';

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

    if (req.method === 'GET') {
      // Get user's reviews
      const reviews = getUserReviews(userId);
      
      // Sort by date (newest first)
      reviews.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return res.status(200).json({ reviews });
    }

    if (req.method === 'POST') {
      // Create new review
      const { orderId, productId, rating, title, comment, photos } = req.body;

      // Validation
      if (!orderId || !productId || !rating || !title || !comment) {
        return res.status(400).json({ 
          error: 'Vui lòng điền đầy đủ thông tin' 
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          error: 'Đánh giá phải từ 1-5 sao' 
        });
      }

      if (title.length < 5 || title.length > 100) {
        return res.status(400).json({ 
          error: 'Tiêu đề phải từ 5-100 ký tự' 
        });
      }

      if (comment.length < 10 || comment.length > 1000) {
        return res.status(400).json({ 
          error: 'Nội dung phải từ 10-1000 ký tự' 
        });
      }

      if (photos && photos.length > 5) {
        return res.status(400).json({ 
          error: 'Tối đa 5 ảnh' 
        });
      }

      // Verify order exists and belongs to user
      const orderResult = await getOrderById(orderId);
      if (!orderResult) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
      }

      const order = orderResult;

      if (order.customerEmail !== decoded.email) {
        return res.status(403).json({ 
          error: 'Bạn không có quyền đánh giá đơn hàng này' 
        });
      }

      // Check if order is delivered
      if (order.status !== 'delivered') {
        return res.status(400).json({ 
          error: 'Chỉ có thể đánh giá sau khi đơn hàng đã giao' 
        });
      }

      // Find product in order
      const product = order.items.find((item: any) => item.id === productId);
      if (!product) {
        return res.status(404).json({ 
          error: 'Không tìm thấy sản phẩm trong đơn hàng' 
        });
      }

      // Create review
      const review = createReview(
        userId,
        { orderId, productId, rating, title, comment, photos },
        product.name,
        product.image
      );

      // Award loyalty points for review (50 points)
      try {
        const fs = await import('fs');
        const path = await import('path');
        
        // Update loyalty.json
        const loyaltyPath = path.join(process.cwd(), 'data', 'loyalty.json');
        if (fs.existsSync(loyaltyPath)) {
          const loyaltyData = JSON.parse(fs.readFileSync(loyaltyPath, 'utf-8'));
          const userLoyalty = loyaltyData.accounts?.find((a: any) => a.userId === userId);
          
          if (userLoyalty) {
            userLoyalty.points += 50;
            userLoyalty.totalEarned += 50;
            userLoyalty.updatedAt = new Date().toISOString();
            fs.writeFileSync(loyaltyPath, JSON.stringify(loyaltyData, null, 2));
          }
        }
        
        // Also update auth.json as fallback
        const { findUserById } = await import('@/lib/database');
        const { updateUser } = await import('@/lib/userOperations');
        
        const user = await findUserById(userId);
        if (user) {
          const currentPoints = user.loyaltyPoints || 0;
          await updateUser(userId, {
            loyaltyPoints: currentPoints + 50
          });
        }
        
        console.log(`✅ Awarded 50 points to user ${userId} for review`);
      } catch (error) {
        console.error('Error awarding points:', error);
        // Don't fail the review if points award fails
      }

      return res.status(201).json({ 
        message: 'Đánh giá thành công! Bạn nhận được 50 điểm thưởng.',
        review,
        pointsAwarded: 50
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Reviews API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
