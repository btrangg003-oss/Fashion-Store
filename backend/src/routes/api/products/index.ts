import { NextApiRequest, NextApiResponse } from 'next'
import { getAllProducts } from '../services/productsDatabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit, sort, sale } = req.query;
    
    let products = await getAllProducts();
    
    // Filter only active and visible products
    products = products.filter(p => p.status === 'active' && p.visibility === 'visible');
    
    // Filter sale products
    if (sale === 'true') {
      products = products.filter(p => p.comparePrice && p.comparePrice > p.price);
    }
    
    // Sort products
    if (sort === 'newest') {
      products = products.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    // Limit results
    if (limit) {
      products = products.slice(0, parseInt(limit as string));
    }

    // ✅ Transform images từ object array sang string array
    const transformedProducts = products.map(p => ({
      ...p,
      images: Array.isArray(p.images) 
        ? p.images.map((img: any) => typeof img === 'string' ? img : img.url || img)
        : (p.featuredImage ? [p.featuredImage] : []),
      image: p.featuredImage || (Array.isArray(p.images) && p.images.length > 0 
        ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0]?.url) 
        : null)
    }));
    
    return res.status(200).json({
      success: true,
      data: transformedProducts
    });

  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}