import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/authMiddleware';

// Mock data - replace with database in production
const brands = [
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
  },
  {
    id: '3',
    name: 'Local Brand',
    description: 'Thương hiệu thời trang nội địa',
    productCount: 28
  }
];

async function getBrands(req: NextApiRequest, res: NextApiResponse) {
  try {
    // In production, fetch from database
    res.status(200).json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createBrand(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newBrand = {
      id: Date.now().toString(),
      name,
      description: description || '',
      productCount: 0
    };

    brands.push(newBrand);
    res.status(201).json(newBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return await getBrands(req, res);
    case 'POST':
      return await createBrand(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method ' + req.method + ' Not Allowed' });
  }
}