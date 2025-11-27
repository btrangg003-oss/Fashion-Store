import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getAllInventory, getAllMovements } from '@/services/inventoryDatabase';
import { InventoryStats, CategoryStock, SupplierStock, TopProduct } from '@/models/inventory';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const inventory = getAllInventory();
    const movements = getAllMovements();

    // Calculate stats
    const stats: InventoryStats = {
      totalProducts: inventory.length,
      totalSKUs: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0),
      inStock: inventory.filter(i => i.status === 'in_stock').length,
      lowStock: inventory.filter(i => i.status === 'low_stock').length,
      outOfStock: inventory.filter(i => i.status === 'out_of_stock').length,
      overstock: inventory.filter(i => i.status === 'overstock').length,
      lowStockPercentage: 0,
      outOfStockPercentage: 0,
      totalInbound: movements.filter(m => m.type === 'inbound').length,
      totalOutbound: movements.filter(m => m.type === 'outbound').length,
      totalAdjustments: movements.filter(m => m.type === 'adjustment').length,
      activeAlerts: 0,
      criticalAlerts: 0
    };

    stats.lowStockPercentage = (stats.lowStock + stats.outOfStock) / stats.totalProducts * 100;
    stats.outOfStockPercentage = stats.outOfStock / stats.totalProducts * 100;

    // Category stock
    const categoryMap = new Map<string, CategoryStock>();
    inventory.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, {
          category: item.category,
          totalProducts: 0,
          totalQuantity: 0,
          totalValue: 0,
          lowStockCount: 0
        });
      }
      
      const cat = categoryMap.get(item.category)!;
      cat.totalProducts++;
      cat.totalQuantity += item.quantity;
      cat.totalValue += item.quantity * item.costPrice;
      if (item.status === 'low_stock' || item.status === 'out_of_stock') {
        cat.lowStockCount++;
      }
    });

    const categoryStock = Array.from(categoryMap.values());

    // Top products (mock data - should come from orders)
    const topProducts: TopProduct[] = inventory
      .slice(0, 10)
      .map(item => ({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        image: item.image,
        soldQuantity: Math.floor(Math.random() * 100),
        revenue: Math.floor(Math.random() * 10000000)
      }))
      .sort((a, b) => b.soldQuantity - a.soldQuantity);

    return res.status(200).json({
      stats,
      categoryStock,
      topProducts
    });

  } catch (error: any) {
    console.error('Inventory stats error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
