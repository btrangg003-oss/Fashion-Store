import { NextApiRequest, NextApiResponse } from 'next'
import { getAllProducts } from '../../../lib/productsDatabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { q, limit = '10' } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const products = await getAllProducts();
    const searchQuery = q.toLowerCase().trim();

    // Search in product name, description, tags
    const results = products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchQuery);
      const descMatch = product.description?.toLowerCase().includes(searchQuery);
      const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchQuery));
      const categoryMatch = product.categoryId?.toLowerCase().includes(searchQuery);
      
      return nameMatch || descMatch || tagsMatch || categoryMatch;
    });

    // Sort by relevance (name match first, then description)
    const sortedResults = results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(searchQuery);
      const bNameMatch = b.name.toLowerCase().includes(searchQuery);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return 0;
    });

    // Limit results
    const limitedResults = sortedResults.slice(0, parseInt(limit as string));

    // Return simplified data for autocomplete
    const suggestions = limitedResults.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || product.featuredImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
      slug: product.slug,
      categoryId: product.categoryId
    }));

    return res.status(200).json({
      success: true,
      data: {
        query: q,
        total: results.length,
        suggestions
      }
    });

  } catch (error) {
    console.error('Product search error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}