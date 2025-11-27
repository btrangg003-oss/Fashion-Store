import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { getAllProducts, updateProduct } from '../services/productsDatabase'
import { getAllOrders } from '../services/ordersDatabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (req.method === 'GET') {
      const products = await getAllProducts();
      const orders = await getAllOrders();
      
      // Calculate profit margins
      const productsWithMargins = products.map(product => {
        const cost = product.cost || 0;
        const price = product.price;
        const margin = cost > 0 ? ((price - cost) / price) * 100 : 0;
        const profit = price - cost;
        
        // Calculate sales performance
        let totalSold = 0;
        let totalRevenue = 0;
        
        orders.forEach(order => {
          order.items.forEach(item => {
            if (item.productId === product.id) {
              totalSold += item.quantity;
              totalRevenue += item.price * item.quantity;
            }
          });
        });

        return {
          ...product,
          margin,
          profit,
          totalSold,
          totalRevenue,
          averageSellingPrice: totalSold > 0 ? totalRevenue / totalSold : price
        };
      });

      // Pricing insights
      const lowMarginProducts = productsWithMargins.filter(p => p.margin < 20);
      const highMarginProducts = productsWithMargins.filter(p => p.margin > 50);
      const bestSellers = productsWithMargins
        .filter(p => p.totalSold > 0)
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 10);

      // Price optimization suggestions
      const suggestions = productsWithMargins.map(product => {
        const suggestions = [];
        
        if (product.margin < 15) {
          suggestions.push({
            type: 'increase_price',
            message: 'Lợi nhuận thấp, nên tăng giá',
            suggestedPrice: Math.ceil(product.cost * 1.3) // 30% margin
          });
        }
        
        if (product.totalSold === 0 && product.margin > 60) {
          suggestions.push({
            type: 'decrease_price',
            message: 'Không bán được, có thể giảm giá để tăng doanh số',
            suggestedPrice: Math.ceil(product.price * 0.9)
          });
        }
        
        if (product.totalSold > 50 && product.margin < 40) {
          suggestions.push({
            type: 'increase_price',
            message: 'Sản phẩm bán chạy, có thể tăng giá',
            suggestedPrice: Math.ceil(product.price * 1.1)
          });
        }

        return {
          productId: product.id,
          name: product.name,
          currentPrice: product.price,
          currentMargin: product.margin,
          suggestions
        };
      }).filter(p => p.suggestions.length > 0);

      return res.status(200).json({
        success: true,
        data: {
          products: productsWithMargins,
          insights: {
            lowMarginProducts,
            highMarginProducts,
            bestSellers,
            averageMargin: productsWithMargins.reduce((sum, p) => sum + p.margin, 0) / productsWithMargins.length,
            totalProfit: productsWithMargins.reduce((sum, p) => sum + (p.totalRevenue - (p.totalSold * (p.cost || 0))), 0)
          },
          suggestions
        }
      });
    }

    if (req.method === 'PUT') {
      const { productId, price, comparePrice, cost } = req.body;
      
      if (!productId || !price) {
        return res.status(400).json({ error: 'Product ID and price are required' });
      }

      const updateData: any = {
        price: parseFloat(price),
        updatedAt: new Date().toISOString()
      };

      if (comparePrice) {
        updateData.comparePrice = parseFloat(comparePrice);
      }

      if (cost) {
        updateData.cost = parseFloat(cost);
      }

      const updatedProduct = await updateProduct(productId, updateData);

      return res.status(200).json({
        success: true,
        data: updatedProduct,
        message: 'Product pricing updated successfully'
      });
    }

    if (req.method === 'POST') {
      const { action, percentage, productIds, categoryId } = req.body;
      
      if (!action || !percentage) {
        return res.status(400).json({ error: 'Action and percentage are required' });
      }

      const products = await getAllProducts();
      let targetProducts = products;

      // Filter products
      if (productIds && Array.isArray(productIds)) {
        targetProducts = products.filter(p => productIds.includes(p.id));
      } else if (categoryId) {
        targetProducts = products.filter(p => p.categoryId === categoryId);
      }

      const results = [];
      const multiplier = action === 'increase' ? (1 + percentage / 100) : (1 - percentage / 100);

      for (const product of targetProducts) {
        try {
          const newPrice = Math.ceil(product.price * multiplier);
          const newComparePrice = product.comparePrice ? Math.ceil(product.comparePrice * multiplier) : undefined;

          const updatedProduct = await updateProduct(product.id, {
            price: newPrice,
            comparePrice: newComparePrice,
            updatedAt: new Date().toISOString()
          });

          results.push({ 
            productId: product.id, 
            success: true, 
            oldPrice: product.price,
            newPrice,
            product: updatedProduct 
          });
        } catch (error) {
          results.push({ 
            productId: product.id, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: results,
        message: `Bulk price ${action} completed`
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Pricing API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}