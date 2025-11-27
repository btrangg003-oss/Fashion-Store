import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { readOrders } from '@/services/ordersDatabase';
import fs from 'fs';
import path from 'path';

interface Notification {
  id: string;
  type: 'order' | 'coupon' | 'points' | 'sale';
  title: string;
  message: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  read: boolean;
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
    const notifications: Notification[] = [];
    const now = new Date();

    // 1. Kiểm tra đơn hàng đang vận chuyển
    const orders = await readOrders();
    const shippingOrders = orders.filter(o => 
      o.userId === userId && 
      (o.status === 'shipping' || o.status === 'processing')
    );

    shippingOrders.forEach(order => {
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        title: 'Đơn hàng đang vận chuyển',
        message: `Đơn hàng #${order.id.slice(0, 8)} đang được giao đến bạn`,
        icon: '📦',
        priority: 'high',
        createdAt: order.updatedAt || order.createdAt,
        read: false
      });
    });

    // 2. Kiểm tra coupon sắp hết hạn
    const couponsPath = path.join(process.cwd(), 'data', 'coupons.json');
    if (fs.existsSync(couponsPath)) {
      try {
        const couponsData = JSON.parse(fs.readFileSync(couponsPath, 'utf-8'));
        const coupons = couponsData.coupons || couponsData || [];
        const userCoupons = coupons.filter((c: any) => 
          c.userId === userId && 
          c.status === 'active' &&
          c.expiresAt
        );

        userCoupons.forEach((coupon: any) => {
          const expiryDate = new Date(coupon.expiresAt);
          const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft <= 3 && daysLeft > 0) {
            notifications.push({
              id: `coupon-${coupon.id}`,
              type: 'coupon',
              title: 'Coupon sắp hết hạn',
              message: `Mã giảm giá ${coupon.code} sẽ hết hạn trong ${daysLeft} ngày`,
              icon: '🎟️',
              priority: 'medium',
              createdAt: coupon.createdAt || new Date().toISOString(),
              read: false
            });
          }
        });
      } catch (e) {
        console.error('Error reading coupons:', e);
      }
    }

    // 3. Kiểm tra điểm thưởng sắp hết hạn (giả định)
    // TODO: Implement loyalty points expiry tracking

    // 4. Flash sale (giả định)
    // TODO: Implement flash sale notifications

    // Sắp xếp theo priority và thời gian
    notifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return res.status(200).json({
      notifications: notifications.slice(0, 10), // Lấy 10 thông báo mới nhất
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
