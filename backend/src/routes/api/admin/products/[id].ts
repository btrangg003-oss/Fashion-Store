import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { 
  getProductById, 
  updateProduct, 
  deleteProduct,
  updateProductStock
} from '../../../../lib/productsDatabase'
import { UpdateProductData } from '../../../../types/products'

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

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (req.method === 'GET') {
      const product = await getProductById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    }

    if (req.method === 'PUT') {
      const updateData: UpdateProductData = req.body;

      // Handle stock update specifically
      if (updateData.stock !== undefined && Object.keys(updateData).length === 2) { // id + stock
        const updatedProduct = await updateProductStock(id, updateData.stock);
        
        if (!updatedProduct) {
          return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json({
          success: true,
          message: 'Stock updated successfully',
          data: updatedProduct
        });
      }

      // Regular product update
      const updatedProduct = await updateProduct(id, updateData);
      
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    }

    if (req.method === 'DELETE') {
      const deleted = await deleteProduct(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Product API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}