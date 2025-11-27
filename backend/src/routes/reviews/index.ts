import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { 
  getUserReviews, 
  createReview 
} from '@/services/reviewService';
import { getOrderById } from '@/services/ordersDatabase';
import { calculateReviewPoints } from '@/services/pointsCalculator';

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

      // Get user info for display name
      const { findUserById } = await import('@/services/database');
      const user = await findUserById(userId);
      const userName = user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Khách hàng';

      // Create review
      const review = createReview(
        userId,
        { orderId, productId, rating, title, comment, photos },
        product.name,
        product.image,
        userName
      );

      // Calculate points based on review quality
      const userReviews = getUserReviews(userId);
      const isFirstReview = userReviews.length === 1; // Just created first one
      
      const pointsBreakdown = calculateReviewPoints(
        photos?.length || 0,
        comment.length,
        order.updatedAt, // Use order update time as delivery time
        isFirstReview
      );

      const pointsAwarded = pointsBreakdown.totalPoints;

      // Award loyalty points (only if account is not restricted)
      let isRestricted = false;
      try {
        // Check if user account is restricted
        const user = await findUserById(userId);
        isRestricted = !!(user && user.accountStatus === 'restricted');
        
        if (!isRestricted) {
          const fs = await import('fs');
          const path = await import('path');
          
          // Update loyalty.json
          const loyaltyPath = path.join(process.cwd(), 'data', 'loyalty.json');
          if (fs.existsSync(loyaltyPath)) {
            const loyaltyData = JSON.parse(fs.readFileSync(loyaltyPath, 'utf-8'));
            const userLoyalty = loyaltyData.accounts?.find((a: any) => a.userId === userId);
          
            if (userLoyalty) {
              userLoyalty.points += pointsAwarded;
              userLoyalty.totalEarned += pointsAwarded;
              userLoyalty.updatedAt = new Date().toISOString();
              
              // Add transaction record
              if (!userLoyalty.transactions) {
                userLoyalty.transactions = [];
              }
              userLoyalty.transactions.push({
                id: `trans_${Date.now()}`,
                type: 'earn',
                amount: pointsAwarded,
                description: `Đánh giá sản phẩm: ${product.name}`,
                date: new Date().toISOString(),
                relatedId: review.id
              });
              
              fs.writeFileSync(loyaltyPath, JSON.stringify(loyaltyData, null, 2));
            }
          }
          
          // Also update auth.json as fallback
          const { updateUser } = await import('@/services/userOperations');
          
          if (user) {
            const currentPoints = user.loyaltyPoints || 0;
            await updateUser(userId, {
              loyaltyPoints: currentPoints + pointsAwarded
            });
          }
          
          console.log(`✅ Awarded ${pointsAwarded} points to user ${userId} for review`);
          console.log('Points breakdown:', pointsBreakdown);
        } else {
          console.log(`⚠️ User ${userId} is restricted - no points awarded`);
        }
      } catch (error) {
        console.error('Error awarding points:', error);
        // Don't fail the review if points award fails
      }

      // Build success message
      let message = isRestricted 
        ? `✅ Đánh giá thành công!\n⚠️ Tài khoản bị hạn chế nên không được cộng điểm`
        : `✅ Đánh giá thành công!\n🎉 Bạn nhận được +${pointsAwarded} điểm thưởng`;
      
      if (pointsBreakdown.photoBonus > 0) {
        message += `\n📸 Thưởng ảnh: +${pointsBreakdown.photoBonus} điểm`;
      }
      if (pointsBreakdown.speedBonus > 0) {
        message += `\n⚡ Đánh giá nhanh: +${pointsBreakdown.speedBonus} điểm`;
      }
      if (pointsBreakdown.detailBonus > 0) {
        message += `\n📝 Đánh giá chi tiết: +${pointsBreakdown.detailBonus} điểm`;
      }
      if (pointsBreakdown.firstReviewBonus > 0) {
        message += `\n🌟 Đánh giá đầu tiên: +${pointsBreakdown.firstReviewBonus} điểm`;
      }

      return res.status(201).json({ 
        success: true,
        message,
        review,
        pointsAwarded,
        pointsBreakdown
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
