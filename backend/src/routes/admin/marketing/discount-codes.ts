import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const DISCOUNTS_FILE = path.join(process.cwd(), 'data', 'discounts.json');

interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  validFrom: string;
  validUntil: string;
  status: 'active' | 'inactive' | 'expired';
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludedProducts?: string[];
  createdAt: string;
}

async function getDiscounts(): Promise<DiscountCode[]> {
  try {
    const data = await fs.readFile(DISCOUNTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveDiscounts(discounts: DiscountCode[]) {
  await fs.writeFile(DISCOUNTS_FILE, JSON.stringify(discounts, null, 2));
}

function generateCode(prefix: string = 'SALE'): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix;
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add admin authentication check

  if (req.method === 'GET') {
    const discounts = await getDiscounts();
    const now = new Date();

    // Update expired status
    const updated = discounts.map(d => {
      if (new Date(d.validUntil) < now && d.status === 'active') {
        return { ...d, status: 'expired' as const };
      }
      return d;
    });

    await saveDiscounts(updated);

    const stats = {
      total: updated.length,
      active: updated.filter(d => d.status === 'active').length,
      expired: updated.filter(d => d.status === 'expired').length,
      totalUsage: updated.reduce((sum, d) => sum + d.usageCount, 0)
    };

    return res.status(200).json({ discounts: updated, stats });
  }

  if (req.method === 'POST') {
    const discounts = await getDiscounts();

    if (req.body.action === 'generate') {
      const { count = 1, prefix, ...config } = req.body;
      const newCodes: DiscountCode[] = [];

      for (let i = 0; i < count; i++) {
        const code: DiscountCode = {
          id: `disc_${Date.now()}_${i}`,
          code: generateCode(prefix),
          ...config,
          usageCount: 0,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        newCodes.push(code);
      }

      discounts.push(...newCodes);
      await saveDiscounts(discounts);

      return res.status(201).json({ codes: newCodes });
    }

    const newDiscount: DiscountCode = {
      id: `disc_${Date.now()}`,
      ...req.body,
      usageCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    discounts.push(newDiscount);
    await saveDiscounts(discounts);

    return res.status(201).json(newDiscount);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const discounts = await getDiscounts();
    const index = discounts.findIndex(d => d.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Discount not found' });
    }

    discounts[index] = { ...discounts[index], ...req.body };
    await saveDiscounts(discounts);

    return res.status(200).json(discounts[index]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const discounts = await getDiscounts();
    const filtered = discounts.filter(d => d.id !== id);

    await saveDiscounts(filtered);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
