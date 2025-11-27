import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { createProduct } from '../../../../lib/productsDatabase'
import { 
  parseCSV, 
  validateProductImport, 
  generateImportTemplate 
} from '../../../../lib/exportService'

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
      // Return import template
      const template = generateImportTemplate('products');
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="products_import_template.csv"');
      
      const BOM = '\uFEFF';
      return res.status(200).send(BOM + template);
    }

    if (req.method === 'POST') {
      const { csvData } = req.body;

      if (!csvData || typeof csvData !== 'string') {
        return res.status(400).json({ error: 'CSV data is required' });
      }

      // Parse CSV content
      const parsedData = parseCSV(csvData);

      if (parsedData.length === 0) {
        return res.status(400).json({ error: 'Empty or invalid CSV data' });
      }

      // Validate data
      const { valid, invalid } = validateProductImport(parsedData);

      // Import valid products
      const importResults = {
        total: parsedData.length,
        valid: valid.length,
        invalid: invalid.length,
        imported: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (const productData of valid) {
        try {
          await createProduct({
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            comparePrice: productData.comparePrice,
            cost: productData.cost,
            sku: productData.sku,
            stock: productData.stock,
            lowStockThreshold: 10,
            trackQuantity: true,
            categoryId: productData.categoryId,
            tags: productData.tags ? productData.tags.split(',').map((t: string) => t.trim()) : [],
            vendor: productData.vendor,
            images: [],
            status: productData.status,
            visibility: productData.visibility,
            slug: productData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            requiresShipping: true
          });
          
          importResults.imported++;
        } catch (error) {
          importResults.failed++;
          importResults.errors.push(`${productData.sku}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return res.status(200).json({
        success: true,
        message: `Import completed: ${importResults.imported} imported, ${importResults.failed} failed`,
        data: {
          ...importResults,
          invalidRows: invalid
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Import products API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}