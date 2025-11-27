import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { itemIds, field, value } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ message: 'Item IDs are required' });
    }

    if (!field || !value) {
      return res.status(400).json({ message: 'Field and value are required' });
    }

    // Validate field
    const allowedFields = ['category', 'location', 'status', 'costPrice', 'sellingPrice'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field' });
    }

    // Read inventory data
    let inventoryData: { items: any[] } = { items: [] };
    if (fs.existsSync(INVENTORY_FILE)) {
      const data = fs.readFileSync(INVENTORY_FILE, 'utf-8');
      inventoryData = JSON.parse(data);
    }

    // Update items
    let updatedCount = 0;
    inventoryData.items = inventoryData.items.map((item: any) => {
      if (itemIds.includes(item.id)) {
        updatedCount++;
        
        // Convert value to appropriate type
        let updatedValue = value;
        if (field === 'costPrice' || field === 'sellingPrice') {
          updatedValue = parseFloat(value);
        }
        
        return {
          ...item,
          [field]: updatedValue,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    // Save updated data
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventoryData, null, 2));

    res.status(200).json({ 
      message: 'Bulk update successful',
      updatedCount
    });
  } catch (error) {
    console.error('Error bulk updating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
