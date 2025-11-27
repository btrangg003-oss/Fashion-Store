import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { getAllProducts, updateProduct } from '../services/productsDatabase'

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
      
      // Inventory analysis
      const lowStock = products.filter(p => p.stock <= (p.lowStockThreshold || 10));
      const outOfStock = products.filter(p => p.stock === 0);
      const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.cost || p.price)), 0);
      
      return res.status(200).json({
        success: true,
        data: {
          products,
          lowStock,
          outOfStock,
          totalValue,
          stats: {
            totalProducts: products.length,
            lowStockCount: lowStock.length,
            outOfStockCount: outOfStock.length,
            averageStock: products.reduce((sum, p) => sum + p.stock, 0) / products.length
          }
        }
      });
    }

    if (req.method === 'PUT') {
      const { productId, stock, lowStockThreshold } = req.body;
      
      if (!productId || stock === undefined) {
        return res.status(400).json({ error: 'Product ID and stock are required' });
      }

      const updatedProduct = await updateProduct(productId, {
        stock: parseInt(stock),
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined,
        updatedAt: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        data: updatedProduct,
        message: 'Stock updated successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Inventory API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}