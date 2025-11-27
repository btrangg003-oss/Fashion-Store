import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { readOrders } from '@/lib/ordersDatabase';
import fs from 'fs';
import path from 'path';

interface Activity {
  id: string;
  type: 'order' | 'review' | 'wishlist' | 'coupon' | 'points';
  title: string;
  description: string;
  icon: string;
  timestamp: string;
  link?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId;
    const activities: Activity[] = [];

    // 1. Đơn hàng
    const orders = await readOrders();
    const userOrders = orders
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    userOrders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'Đặt hàng thành công',
        description: `Đơn hàng #${order.id.slice(0, 8)} - ${order.total.toLocaleString('vi-VN')}đ`,
        icon: '🛍️',
        timestamp: order.createdAt,
        link: `/profile?tab=orders`
      });
    });

    // 2. Đánh giá
    const reviewsPath = path.join(process.cwd(), 'data', 'reviews.json');
    if (fs.existsSync(reviewsPath)) {
      try {
        const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
        const reviews = reviewsData.reviews || reviewsData || [];
        const userReviews = reviews
          .filter((r: any) => r.userId === userId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        userReviews.forEach((review: any) => {
          activities.push({
            id: `review-${review.id}`,
            type: 'review',
            title: 'Đánh giá sản phẩm',
            description: `${review.rating} sao - ${review.comment?.slice(0, 50)}...`,
            icon: '⭐',
            timestamp: review.createdAt,
            link: `/products/${review.productId}`
          });
        });
      } catch (e) {
        console.error('Error reading reviews:', e);
      }
    }

    // 3. Wishlist
    const wishlistPath = path.join(process.cwd(), 'data', 'wishlist.json');
    if (fs.existsSync(wishlistPath)) {
      try {
        const wishlistData = JSON.parse(fs.readFileSync(wishlistPath, 'utf-8'));
        const wishlist = wishlistData.wishlist || wishlistData || [];
        const userWishlist = wishlist
          .filter((w: any) => w.userId === userId)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        userWishlist.forEach((item: any) => {
          activities.push({
            id: `wishlist-${item.id}`,
            type: 'wishlist',
            title: 'Thêm vào yêu thích',
            description: item.productName || 'Sản phẩm',
            icon: '❤️',
            timestamp: item.createdAt,
            link: `/profile?tab=wishlist`
          });
        });
      } catch (e) {
        console.error('Error reading wishlist:', e);
      }
    }

    // Sắp xếp theo thời gian và lấy 10 hoạt động gần nhất
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.status(200).json({
      activities: activities.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
