import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const reviewsPath = path.join(process.cwd(), 'data', 'reviews.json');
    const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));
    
    // Filter reviews by productId and approved status
    const productReviews = reviewsData.reviews.filter(
      (review: any) => review.productId === id && review.status === 'approved'
    );

    // Calculate stats
    const total = productReviews.length;
    const average = total > 0
      ? productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / total
      : 0;

    const breakdown = {
      5: productReviews.filter((r: any) => r.rating === 5).length,
      4: productReviews.filter((r: any) => r.rating === 4).length,
      3: productReviews.filter((r: any) => r.rating === 3).length,
      2: productReviews.filter((r: any) => r.rating === 2).length,
      1: productReviews.filter((r: any) => r.rating === 1).length,
    };

    // Sort by date (newest first)
    productReviews.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      reviews: productReviews,
      stats: {
        total,
        average: Math.round(average * 10) / 10,
        breakdown
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}
