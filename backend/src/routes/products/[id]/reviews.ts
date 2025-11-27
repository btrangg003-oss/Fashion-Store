import type { NextApiRequest, NextApiResponse } from 'next';
import { getProductReviews, getProductReviewStats } from '@/services/reviewService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const productId = id as string;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Get all reviews for this product
    const reviews = getProductReviews(productId);
    
    // Calculate stats
    const stats = getProductReviewStats(productId);

    // Sort reviews by date (newest first)
    reviews.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      success: true,
      reviews,
      stats
    });
  } catch (error: any) {
    console.error('Get product reviews error:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}
