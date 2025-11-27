import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../services/auth';
import { readProducts } from '../services/productsDatabase';

// Generate SKU automatically
function generateSKU(productName: string, collection?: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  let prefix = 'PRD';
  if (collection) {
    // Use first 3 letters of collection as prefix
    prefix = collection.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    if (prefix.length < 3) prefix = prefix.padEnd(3, 'X');
  }
  
  return `${prefix}-${timestamp}-${random}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const isAdmin = decoded.email === process.env.ADMIN_EMAIL || 
                   decoded.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.method === 'GET') {
      // Get all products
      const productsData = await readProducts();
      
      // Calculate stats
      const stats = {
        total: productsData.length,
        active: productsData.filter(p => p.status === 'active').length,
        lowStock: productsData.filter(p => p.stock < (p.lowStockThreshold || 10)).length,
        outOfStock: productsData.filter(p => p.stock === 0).length,
        totalValue: productsData.reduce((sum, p) => sum + (p.price * p.stock), 0)
      };

      return res.status(200).json({
        success: true,
        products: productsData,
        stats: stats
      });
    }

    if (req.method === 'POST') {
      // Create new product
      const { writeProductsDatabase, readProductsDatabase } = await import('../../../lib/productsDatabase');
      const productsData = await readProductsDatabase();
      
      const images = req.body.images || [];
      
      // Auto-generate SKU
      const sku = generateSKU(req.body.name, req.body.collection);
      
      const newProduct = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        ...req.body,
        sku, // Auto-generated SKU
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: req.body.status || 'draft',
        visibility: req.body.visibility || 'visible',
        trackQuantity: req.body.trackQuantity !== false,
        requiresShipping: req.body.requiresShipping !== false,
        images: images,
        featuredImage: images.length > 0 ? images[0] : req.body.featuredImage || '',
        stock: parseInt(req.body.stock) || 0,
        price: parseFloat(req.body.price) || 0,
        // New fields
        collection: req.body.collection || '',
        brand: req.body.brand || '',
        material: req.body.material || '',
        origin: req.body.origin || '',
        careInstructions: req.body.careInstructions || ''
      };
      
      productsData.products.push(newProduct);
      await writeProductsDatabase(productsData);
      
      return res.status(201).json({
        success: true,
        product: newProduct
      });
    }

    if (req.method === 'PUT') {
      // Update product
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product ID required' });
      }
      
      const { writeProductsDatabase, readProductsDatabase } = await import('../../../lib/productsDatabase');
      const productsData = await readProductsDatabase();
      
      const productIndex = productsData.products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const images = req.body.images || productsData.products[productIndex].images || [];
      productsData.products[productIndex] = {
        ...productsData.products[productIndex],
        ...req.body,
        id: productsData.products[productIndex].id, // Keep original ID
        images: images,
        featuredImage: images.length > 0 ? images[0] : req.body.featuredImage || productsData.products[productIndex].featuredImage || '',
        updatedAt: new Date().toISOString()
      };
      
      await writeProductsDatabase(productsData);
      
      return res.status(200).json({
        success: true,
        product: productsData.products[productIndex]
      });
    }

    if (req.method === 'DELETE') {
      // Delete product
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Product ID required' });
      }
      
      const { writeProductsDatabase, readProductsDatabase } = await import('../../../lib/productsDatabase');
      const productsData = await readProductsDatabase();
      
      const productIndex = productsData.products.findIndex(p => p.id === id);
      if (productIndex === -1) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      productsData.products.splice(productIndex, 1);
      await writeProductsDatabase(productsData);
      
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Admin products API error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}
