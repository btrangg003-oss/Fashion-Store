import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getAllCampaigns,
  createCampaign,
  generateId,
  updateCampaignStatuses
} from '@/services/campaignsDatabase';
import { Campaign } from '@/models/campaign';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update campaign statuses before processing
    updateCampaignStatuses();

    if (req.method === 'GET') {
      const campaigns = getAllCampaigns();
      
      // Apply filters
      let filtered = campaigns;
      const { status, type, search } = req.query;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(c => c.status === status);
      }
      
      if (type && type !== 'all') {
        filtered = filtered.filter(c => c.type === type);
      }
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort by creation date (newest first)
      filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return res.status(200).json(filtered);
    }

    if (req.method === 'POST') {
      const campaignData = req.body;
      
      // Validate required fields
      if (!campaignData.name || !campaignData.type || !campaignData.startDate || !campaignData.endDate) {
        return res.status(400).json({
          message: 'Thiếu thông tin bắt buộc'
        });
      }
      
      // Determine initial status
      const now = new Date();
      const startDate = new Date(campaignData.startDate);
      let status: Campaign['status'] = 'draft';
      
      if (campaignData.status === 'scheduled' || now < startDate) {
        status = 'scheduled';
      } else if (campaignData.status === 'active') {
        status = 'active';
      }
      
      const newCampaign: Campaign = {
        id: generateId(),
        name: campaignData.name,
        description: campaignData.description || '',
        type: campaignData.type,
        status,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        timezone: campaignData.timezone || 'Asia/Ho_Chi_Minh',
        targetAudience: campaignData.targetAudience || 'all',
        targetSegmentIds: campaignData.targetSegmentIds || [],
        estimatedReach: campaignData.estimatedReach || 0,
        voucherIds: campaignData.voucherIds || [],
        productIds: campaignData.productIds || [],
        bannerImageUrl: campaignData.bannerImageUrl,
        landingPageUrl: campaignData.landingPageUrl,
        emailSubject: campaignData.emailSubject,
        emailTemplate: campaignData.emailTemplate,
        emailSentCount: 0,
        budget: campaignData.budget || 0,
        goalType: campaignData.goalType,
        goalValue: campaignData.goalValue,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        createdBy: decoded.userId,
        createdAt: new Date().toISOString(),
        launchedAt: status === 'active' ? new Date().toISOString() : undefined
      };
      
      const created = createCampaign(newCampaign);
      return res.status(201).json(created);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Campaign API error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}
