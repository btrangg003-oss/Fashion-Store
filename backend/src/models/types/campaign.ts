// Campaign Type Definitions

export type CampaignType = 'email' | 'banner' | 'flash_sale' | 'seasonal' | 'product_launch';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
export type CampaignTarget = 'all' | 'new_customers' | 'vip' | 'inactive' | 'segment';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  type: CampaignType;
  status: CampaignStatus;
  
  // Timing
  startDate: string;
  endDate: string;
  timezone: string;
  
  // Target Audience
  targetAudience: CampaignTarget;
  targetSegmentIds?: string[];
  estimatedReach: number;
  
  // Associated Items
  voucherIds?: string[];
  productIds?: string[];
  bannerImageUrl?: string;
  landingPageUrl?: string;
  
  // Email Campaign
  emailSubject?: string;
  emailTemplate?: string;
  emailSentCount?: number;
  
  // Budget & Goals
  budget?: number;
  goalType?: 'revenue' | 'orders' | 'signups' | 'engagement';
  goalValue?: number;
  
  // Performance Metrics
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi?: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  launchedAt?: string;
  completedAt?: string;
}

export interface CampaignPerformance {
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  scheduledCampaigns: number;
  completedCampaigns: number;
  totalRevenue: number;
  totalConversions: number;
  averageROI: number;
  topCampaign?: Campaign;
}
