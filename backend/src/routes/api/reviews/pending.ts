import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getUserOrders } from '@/services/ordersDatabase';
import { hasUserReviewedProduct } from '@/services/reviewService';
import { PendingReview } from '@/models/reviews';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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

    // Get user's delivered orders
    const ordersResult = await getUserOrders(userId);
    const deliveredOrders = ordersResult.filter((order: any) => order.status === 'delivered');

    // Build pending reviews list
    const pendingReviews: PendingReview[] = [];

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        // Check if already reviewed
        const hasReviewed = hasUserReviewedProduct(userId, order.id, item.id);
        
        if (!hasReviewed) {
          pendingReviews.push({
            orderId: order.id,
            productId: item.id,
            productName: item.name,
            productImage: item.image,
            deliveredAt: order.updatedAt || order.createdAt,
            canReview: true
          });
        }
      }
    }

    // Sort by delivery date (newest first)
    pendingReviews.sort((a, b) => 
      new Date(b.deliveredAt).getTime() - new Date(a.deliveredAt).getTime()
    );

    return res.status(200).json({ 
      pendingReviews,
      total: pendingReviews.length
    });
  } catch (error: any) {
    console.error('Pending reviews API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
