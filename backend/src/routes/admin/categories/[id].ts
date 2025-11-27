import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/authMiddleware';

// Mock data - replace with database in production
let categories = [
  {
    id: '1',
    name: 'Áo',
    description: 'Các loại áo thun, áo sơ mi, áo khoác',
    productCount: 25
  },
  {
    id: '2',
    name: 'Quần',
    description: 'Quần jean, quần tây, quần short',
    productCount: 18
  }
];

async function updateCategory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name,
      description: description || categories[categoryIndex].description
    };

    res.status(200).json(categories[categoryIndex]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteCategory(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // In production, check if category has associated products
    // and handle accordingly (e.g., prevent deletion or archive)
    categories = categories.filter(c => c.id !== id);

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      return await updateCategory(req, res);
    case 'DELETE':
      return await deleteCategory(req, res);
    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).json({ error: 'Method ' + req.method + ' Not Allowed' });
  }
}