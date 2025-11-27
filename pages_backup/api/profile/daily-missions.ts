import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';
import { readOrders } from '@/lib/ordersDatabase';
import fs from 'fs';
import path from 'path';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  icon: string;
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
    const today = new Date().toISOString().split('T')[0];

    // Đọc dữ liệu từ các file
    const orders = await readOrders();
    const reviewsPath = path.join(process.cwd(), 'data', 'reviews.json');
    const wishlistPath = path.join(process.cwd(), 'data', 'wishlist.json');
    
    let reviews = [];
    let wishlist = [];
    
    try {
      if (fs.existsSync(reviewsPath)) {
        const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
        reviews = reviewsData.reviews || reviewsData || [];
      }
    } catch (e) {
      console.error('Error reading reviews:', e);
    }

    try {
      if (fs.existsSync(wishlistPath)) {
        const wishlistData = JSON.parse(fs.readFileSync(wishlistPath, 'utf-8'));
        wishlist = wishlistData.wishlist || wishlistData || [];
      }
    } catch (e) {
      console.error('Error reading wishlist:', e);
    }

    // Tính progress cho từng nhiệm vụ (chỉ tính hôm nay)
    const todayOrders = orders.filter(o => 
      o.userId === userId && 
      o.createdAt.startsWith(today)
    );

    const todayReviews = reviews.filter((r: any) => 
      r.userId === userId && 
      r.createdAt?.startsWith(today)
    );

    const todayWishlist = wishlist.filter((w: any) => 
      w.userId === userId && 
      w.createdAt?.startsWith(today)
    );

    // Giả sử có tracking cho product views (có thể implement sau)
    const productViews = 0; // TODO: Implement product view tracking

    const missions: Mission[] = [
      {
        id: 'view-products',
        title: 'Khám phá sản phẩm mới',
        description: 'Xem 5 sản phẩm mới',
        points: 5,
        progress: Math.min(productViews, 5),
        target: 5,
        completed: productViews >= 5,
        icon: '👀'
      },
      {
        id: 'add-wishlist',
        title: 'Thêm vào yêu thích',
        description: 'Thêm 1 sản phẩm vào wishlist',
        points: 10,
        progress: Math.min(todayWishlist.length, 1),
        target: 1,
        completed: todayWishlist.length >= 1,
        icon: '❤️'
      },
      {
        id: 'write-review',
        title: 'Viết đánh giá',
        description: 'Đánh giá 1 sản phẩm đã mua',
        points: 50,
        progress: Math.min(todayReviews.length, 1),
        target: 1,
        completed: todayReviews.length >= 1,
        icon: '⭐'
      },
      {
        id: 'make-purchase',
        title: 'Mua sắm',
        description: 'Hoàn thành 1 đơn hàng',
        points: 100,
        progress: Math.min(todayOrders.length, 1),
        target: 1,
        completed: todayOrders.length >= 1,
        icon: '🛍️'
      }
    ];

    const completedCount = missions.filter(m => m.completed).length;
    const totalPoints = missions.reduce((sum, m) => sum + (m.completed ? m.points : 0), 0);
    const possiblePoints = missions.reduce((sum, m) => sum + m.points, 0);

    return res.status(200).json({
      missions,
      summary: {
        completed: completedCount,
        total: missions.length,
        earnedPoints: totalPoints,
        possiblePoints
      }
    });
  } catch (error) {
    console.error('Error fetching daily missions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
