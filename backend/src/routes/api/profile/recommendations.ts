import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { readOrders } from '@/services/ordersDatabase';
import { readProducts } from '@/services/productsDatabase';

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

    const orders = await readOrders();
    const products = await readProducts();
    const userOrders = orders.filter(order => order.userId === decoded.userId);

    // Lấy categories đã mua
    const purchasedCategories = new Set<string>();
    const purchasedProductIds = new Set<string>();
    
    userOrders.forEach(order => {
      order.items?.forEach(item => {
        purchasedProductIds.add(item.productId);
        const product = products.find(p => p.id === item.productId);
        if (product?.category) {
          purchasedCategories.add(product.category);
        }
      });
    });

    // Lọc sản phẩm đề xuất
    let recommendations = products.filter(product => {
      // Không đề xuất sản phẩm đã mua
      if (purchasedProductIds.has(product.id)) return false;
      
      // Ưu tiên sản phẩm cùng category
      if (purchasedCategories.has(product.category)) return true;
      
      // Hoặc sản phẩm mới/trending
      return product.featured || product.trending;
    });

    // Sắp xếp theo độ ưu tiên
    recommendations.sort((a, b) => {
      const aScore = (purchasedCategories.has(a.category) ? 10 : 0) +
                     (a.featured ? 5 : 0) +
                     (a.trending ? 3 : 0);
      const bScore = (purchasedCategories.has(b.category) ? 10 : 0) +
                     (b.featured ? 5 : 0) +
                     (b.trending ? 3 : 0);
      return bScore - aScore;
    });

    // Lấy 6 sản phẩm đầu tiên
    recommendations = recommendations.slice(0, 6);

    return res.status(200).json({
      products: recommendations,
      reason: purchasedCategories.size > 0 
        ? 'Dựa trên lịch sử mua hàng của bạn'
        : 'Sản phẩm nổi bật và mới nhất'
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
