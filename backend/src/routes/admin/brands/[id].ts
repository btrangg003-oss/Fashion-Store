import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/authMiddleware';

// Mock data - replace with database in production
let brands = [
  {
    id: '1',
    name: 'Zara',
    description: 'Thương hiệu thời trang quốc tế',
    productCount: 45
  },
  {
    id: '2',
    name: 'H&M',
    description: 'Thời trang bình dân cao cấp',
    productCount: 32
  }
];

async function updateBrand(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const brandIndex = brands.findIndex(b => b.id === id);
    if (brandIndex === -1) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    brands[brandIndex] = {
      ...brands[brandIndex],
      name,
      description: description || brands[brandIndex].description
    };

    res.status(200).json(brands[brandIndex]);
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteBrand(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    const brandIndex = brands.findIndex(b => b.id === id);
    if (brandIndex === -1) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // In production, check if brand has associated products
    // and handle accordingly (e.g., prevent deletion or archive)
    brands = brands.filter(b => b.id !== id);

    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      return await updateBrand(req, res);
    case 'DELETE':
      return await deleteBrand(req, res);
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).json({ error: 'Method ' + req.method + ' Not Allowed' });
  }
}