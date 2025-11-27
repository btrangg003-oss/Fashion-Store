import { NextApiRequest, NextApiResponse } from 'next';
import { readProducts } from '../services/productsDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const products = await readProducts();
    
    // Filter by query parameters
    const { category, status, search, limit } = req.query;
    
    let filtered = products;
    
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.categoryId === category);
    }
    
    if (status && status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }
    
    if (search) {
      const searchLower = String(search).toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower)
      );
    }
    
    if (limit) {
      filtered = filtered.slice(0, parseInt(String(limit)));
    }

    return res.status(200).json({
      success: true,
      data: filtered,
      total: filtered.length
    });

  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products' 
    });
  }
}
