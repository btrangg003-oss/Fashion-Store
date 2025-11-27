import type { NextApiRequest, NextApiResponse } from 'next';
import { getProductById } from '@/lib/productsDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const product = await getProductById(id as string);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // ✅ Transform images từ object array sang string array
      const transformedProduct = {
        ...product,
        images: Array.isArray(product.images) 
          ? product.images.map((img: any) => typeof img === 'string' ? img : img.url || img)
          : (product.featuredImage ? [product.featuredImage] : []),
        image: product.featuredImage || (Array.isArray(product.images) && product.images.length > 0 
          ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url) 
          : null)
      };

      res.status(200).json(transformedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
