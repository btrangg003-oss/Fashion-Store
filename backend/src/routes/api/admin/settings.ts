import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

const defaultSettings = {
  general: {
    siteName: 'Fashion Store',
    siteUrl: 'https://fashionstore.com',
    contactEmail: 'contact@fashionstore.com',
    supportPhone: '1900-xxxx'
  },
  payment: {
    currency: 'VND',
    taxRate: 10,
    shippingFee: 30000,
    freeShippingThreshold: 500000
  },
  email: {
    provider: 'gmail',
    fromName: 'Fashion Store',
    fromEmail: 'noreply@fashionstore.com',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireEmailVerification: true,
    enableTwoFactor: false
  },
  inventory: {
    lowStockThreshold: 10,
    autoReorderEnabled: false,
    reorderQuantity: 50
  }
};

async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, create it with defaults
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  }
}

async function writeSettings(settings: any) {
  await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const settings = await readSettings();
      return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
      const newSettings = req.body;
      
      // Validate settings
      if (!newSettings.general || !newSettings.payment || !newSettings.email || 
          !newSettings.security || !newSettings.inventory) {
        return res.status(400).json({ message: 'Invalid settings format' });
      }

      await writeSettings(newSettings);
      return res.status(200).json({ message: 'Settings saved successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Settings API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
