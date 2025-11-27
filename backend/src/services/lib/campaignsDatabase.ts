import fs from 'fs';
import path from 'path';
import { Campaign, CampaignPerformance, CampaignStatus } from '@/models/campaign';

const DATA_DIR = path.join(process.cwd(), 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const PERFORMANCE_FILE = path.join(DATA_DIR, 'campaign-performance.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files
if (!fs.existsSync(CAMPAIGNS_FILE)) {
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(PERFORMANCE_FILE)) {
  fs.writeFileSync(PERFORMANCE_FILE, JSON.stringify([], null, 2));
}

// Read functions
export function getAllCampaigns(): Campaign[] {
  const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getCampaignById(id: string): Campaign | null {
  const campaigns = getAllCampaigns();
  return campaigns.find(c => c.id === id) || null;
}

export function getActiveCampaigns(): Campaign[] {
  const campaigns = getAllCampaigns();
  const now = new Date();
  
  return campaigns.filter(c => {
    if (c.status !== 'active') return false;
    const startDate = new Date(c.startDate);
    const endDate = new Date(c.endDate);
    return now >= startDate && now <= endDate;
  });
}

export function getCampaignsByStatus(status: CampaignStatus): Campaign[] {
  const campaigns = getAllCampaigns();
  return campaigns.filter(c => c.status === status);
}

// Write functions
export function createCampaign(campaign: Campaign): Campaign {
  const campaigns = getAllCampaigns();
  campaigns.push(campaign);
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
  return campaign;
}

export function updateCampaign(id: string, updates: Partial<Campaign>): Campaign {
  const campaigns = getAllCampaigns();
  const index = campaigns.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error('Campaign not found');
  }
  
  campaigns[index] = {
    ...campaigns[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
  return campaigns[index];
}

export function deleteCampaign(id: string): boolean {
  const campaigns = getAllCampaigns();
  const filtered = campaigns.filter(c => c.id !== id);
  
  if (filtered.length === campaigns.length) {
    return false;
  }
  
  fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// Status management
export function launchCampaign(id: string): Campaign {
  return updateCampaign(id, {
    status: 'active',
    launchedAt: new Date().toISOString()
  });
}

export function pauseCampaign(id: string): Campaign {
  return updateCampaign(id, { status: 'paused' });
}

export function resumeCampaign(id: string): Campaign {
  return updateCampaign(id, { status: 'active' });
}

export function completeCampaign(id: string): Campaign {
  return updateCampaign(id, {
    status: 'completed',
    completedAt: new Date().toISOString()
  });
}

// Performance tracking
export function recordPerformance(performance: CampaignPerformance): void {
  const data = fs.readFileSync(PERFORMANCE_FILE, 'utf-8');
  const allPerformance: CampaignPerformance[] = JSON.parse(data);
  allPerformance.push(performance);
  fs.writeFileSync(PERFORMANCE_FILE, JSON.stringify(allPerformance, null, 2));
}

export function getCampaignPerformance(campaignId: string): CampaignPerformance[] {
  const data = fs.readFileSync(PERFORMANCE_FILE, 'utf-8');
  const allPerformance: CampaignPerformance[] = JSON.parse(data);
  return allPerformance.filter(p => p.campaignId === campaignId);
}

// Auto update campaign status
export function updateCampaignStatuses(): void {
  const campaigns = getAllCampaigns();
  const now = new Date();
  let updated = false;
  
  campaigns.forEach(campaign => {
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    let newStatus: CampaignStatus = campaign.status;
    
    if (campaign.status === 'scheduled' && now >= startDate) {
      newStatus = 'active';
      campaign.launchedAt = now.toISOString();
      updated = true;
    } else if (campaign.status === 'active' && now > endDate) {
      newStatus = 'completed';
      campaign.completedAt = now.toISOString();
      updated = true;
    }
    
    if (newStatus !== campaign.status) {
      campaign.status = newStatus;
      campaign.updatedAt = now.toISOString();
    }
  });
  
  if (updated) {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2));
  }
}

// Utility functions
export function generateId(): string {
  return 'camp_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function calculateROI(campaign: Campaign): number {
  if (!campaign.budget || campaign.budget === 0) return 0;
  return ((campaign.revenue - campaign.budget) / campaign.budget) * 100;
}

export function getCampaignStats() {
  const campaigns = getAllCampaigns();
  
  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
    completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
    averageROI: campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + calculateROI(c), 0) / campaigns.length
      : 0
  };
}
