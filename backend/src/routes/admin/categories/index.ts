import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { getAllCategories, createCategory } from '../../../../lib/productsDatabase'

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

    if (req.method === 'GET') {
      const categories = await getAllCategories();

      return res.status(200).json({
        success: true,
        data: categories
      })
    }

    if (req.method === 'POST') {
      const { name, slug, description, image, parentId } = req.body

      if (!name) {
        return res.status(400).json({
          error: 'Category name is required'
        })
      }

      // Generate slug if not provided
      const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const newCategory = await createCategory({
        name,
        slug: categorySlug,
        description: description || '',
        image,
        parentId,
        sortOrder: 0
      });

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Categories API error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}