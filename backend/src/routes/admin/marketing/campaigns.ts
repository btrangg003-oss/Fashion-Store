import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'campaigns.json');

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'discount' | 'banner' | 'social';
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  target: {
    segment: string[];
    minPurchase?: number;
    lastPurchaseDays?: number;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    roi: number;
  };
  content: {
    subject?: string;
    body?: string;
    discountCode?: string;
    discountPercent?: number;
    imageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

async function getCampaigns(): Promise<Campaign[]> {
  try {
    const data = await fs.readFile(CAMPAIGNS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCampaigns(campaigns: Campaign[]) {
  await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add admin authentication check
  
  if (req.method === 'GET') {
    const campaigns = await getCampaigns();
    const { status, type } = req.query;

    let filtered = campaigns;
    if (status) filtered = filtered.filter(c => c.status === status);
    if (type) filtered = filtered.filter(c => c.type === type);

    // Calculate performance metrics
    const stats = {
      total: filtered.length,
      active: filtered.filter(c => c.status === 'active').length,
      totalBudget: filtered.reduce((sum, c) => sum + c.budget, 0),
      totalSpent: filtered.reduce((sum, c) => sum + c.spent, 0),
      totalRevenue: filtered.reduce((sum, c) => sum + c.metrics.revenue, 0),
      avgROI: filtered.length > 0 
        ? filtered.reduce((sum, c) => sum + c.metrics.roi, 0) / filtered.length 
        : 0
    };

    return res.status(200).json({ campaigns: filtered, stats });
  }

  if (req.method === 'POST') {
    const campaigns = await getCampaigns();
    const newCampaign: Campaign = {
      id: `camp_${Date.now()}`,
      ...req.body,
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        roi: 0
      },
      spent: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    campaigns.push(newCampaign);
    await saveCampaigns(campaigns);

    return res.status(201).json(newCampaign);
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    const campaigns = await getCampaigns();
    const index = campaigns.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    campaigns[index] = {
      ...campaigns[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await saveCampaigns(campaigns);
    return res.status(200).json(campaigns[index]);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const campaigns = await getCampaigns();
    const filtered = campaigns.filter(c => c.id !== id);

    await saveCampaigns(filtered);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
