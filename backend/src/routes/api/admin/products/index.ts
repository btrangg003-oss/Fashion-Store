import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { 
  getAllProducts, 
  createProduct, 
  getProductsWithFilters,
  getProductAnalytics,
  searchProducts
} from '../../../../lib/productsDatabase'
import { CreateProductData, ProductFilters } from '../../../../types/products'

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
      const { 
        page = '1', 
        limit = '10', 
        search,
        categoryId,
        status,
        minPrice,
        maxPrice,
        inStock,
        analytics
      } = req.query;

      // Return analytics if requested
      if (analytics === 'true') {
        const analyticsData = await getProductAnalytics();
        return res.status(200).json({
          success: true,
          data: analyticsData
        });
      }

      let products;

      // Handle search
      if (search) {
        products = await searchProducts(search as string);
      } else {
        // Handle filters
        const filters: any = {};
        if (categoryId) filters.categoryId = categoryId as string;
        if (status) filters.status = status;
        if (minPrice) filters.minPrice = parseFloat(minPrice as string);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
        if (inStock) filters.inStock = inStock === 'true';

        products = await getProductsWithFilters(filters);
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = pageNum * limitNum;

      const paginatedProducts = products.slice(startIndex, endIndex);

      return res.status(200).json({
        success: true,
        data: paginatedProducts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(products.length / limitNum),
          totalProducts: products.length,
          hasNext: endIndex < products.length,
          hasPrev: startIndex > 0
        }
      });
    }

    if (req.method === 'POST') {
      const productData: CreateProductData = req.body;

      // Validate required fields
      if (!productData.name || !productData.description || !productData.price || !productData.categoryId) {
        return res.status(400).json({
          error: 'Missing required fields: name, description, price, categoryId'
        });
      }

      // Generate SKU if not provided
      if (!productData.sku) {
        const timestamp = Date.now().toString().slice(-6);
        const nameCode = productData.name.replace(/\s+/g, '').toUpperCase().substring(0, 3);
        productData.sku = `${nameCode}-${timestamp}`;
      }

      // Create product
      const newProduct = await createProduct({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        comparePrice: productData.comparePrice,
        cost: productData.cost,
        sku: productData.sku,
        stock: productData.stock || 0,
        lowStockThreshold: 10,
        trackQuantity: true,
        categoryId: productData.categoryId,
        tags: productData.tags || [],
        vendor: productData.vendor,
        images: [],
        status: productData.status || 'active',
        visibility: productData.visibility || 'visible',
        slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        requiresShipping: productData.requiresShipping ?? true,
        weight: productData.weight,
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription
      });

      // Notify sync service
      if (typeof window !== 'undefined') {
        const { syncService } = await import('../../../../lib/syncService');
        syncService.notify('product:created', newProduct);
      }

      return res.status(201).json({
        success: true,
        message: 'Sản phẩm đã được tạo thành công',
        data: newProduct,
        sync: true // Indicate sync notification sent
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}