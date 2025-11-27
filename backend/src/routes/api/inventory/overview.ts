import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const MOVEMENTS_FILE = path.join(DATA_DIR, 'movements.json');

interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  status: string;
  supplier?: string;
  batches?: Array<{
    batchNumber: string;
    quantity: number;
    expiryDate?: string;
  }>;
}

interface StockMovement {
  id: string;
  type: 'inbound' | 'outbound';
  receiptDate: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  finalTotal: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Read inventory data
    let inventory: InventoryItem[] = [];
    if (fs.existsSync(INVENTORY_FILE)) {
      const data = fs.readFileSync(INVENTORY_FILE, 'utf-8');
      inventory = JSON.parse(data).items || [];
    }

    // Read movements data
    let movements: StockMovement[] = [];
    if (fs.existsSync(MOVEMENTS_FILE)) {
      const data = fs.readFileSync(MOVEMENTS_FILE, 'utf-8');
      movements = JSON.parse(data).movements || [];
    }

    // Calculate overview statistics
    const totalProducts = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

    // Count alerts
    const lowStockCount = inventory.filter(item => item.status === 'low_stock').length;
    const outOfStockCount = inventory.filter(item => item.status === 'out_of_stock').length;
    const overstockCount = inventory.filter(item => item.status === 'overstock').length;

    // Count expiring items
    const now = Date.now();
    const expiringCount = inventory.filter(item => {
      if (!item.batches || item.batches.length === 0) return false;
      return item.batches.some(batch => {
        if (!batch.expiryDate) return false;
        const daysUntil = Math.floor((new Date(batch.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
        return daysUntil <= 30 && daysUntil >= 0;
      });
    }).length;

    // Top selling products (mock data - should come from sales data)
    const topSellingProducts = inventory
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        sales: Math.floor(Math.random() * 100) + 50,
        revenue: (Math.floor(Math.random() * 100) + 50) * item.sellingPrice
      }))
      .sort((a, b) => b.sales - a.sales);

    // Stock by category
    const categoryMap = new Map<string, { quantity: number; value: number }>();
    inventory.forEach(item => {
      const existing = categoryMap.get(item.category) || { quantity: 0, value: 0 };
      categoryMap.set(item.category, {
        quantity: existing.quantity + item.quantity,
        value: existing.value + (item.quantity * item.costPrice)
      });
    });

    const stockByCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      quantity: data.quantity,
      value: data.value
    }));

    // Stock by supplier
    const supplierMap = new Map<string, { quantity: number; value: number }>();
    inventory.forEach(item => {
      const supplier = item.supplier || 'Chưa xác định';
      const existing = supplierMap.get(supplier) || { quantity: 0, value: 0 };
      supplierMap.set(supplier, {
        quantity: existing.quantity + item.quantity,
        value: existing.value + (item.quantity * item.costPrice)
      });
    });

    const stockBySupplier = Array.from(supplierMap.entries())
      .map(([supplier, data]) => ({
        supplier,
        quantity: data.quantity,
        value: data.value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Recent movements
    const recentMovements = movements
      .sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime())
      .slice(0, 5)
      .map(movement => ({
        id: movement.id,
        type: movement.type,
        date: movement.receiptDate,
        items: movement.items.length,
        value: movement.finalTotal
      }));

    const overview = {
      totalProducts,
      totalQuantity,
      totalValue,
      lowStockCount,
      outOfStockCount,
      overstockCount,
      expiringCount,
      topSellingProducts,
      stockByCategory,
      stockBySupplier,
      recentMovements
    };

    res.status(200).json(overview);
  } catch (error) {
    console.error('Error loading overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
