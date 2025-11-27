import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  launchCampaign,
  pauseCampaign,
  resumeCampaign,
  completeCampaign
} from '@/services/campaignsDatabase';

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

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid campaign ID' });
    }

    if (req.method === 'GET') {
      const campaign = getCampaignById(id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      return res.status(200).json(campaign);
    }

    if (req.method === 'PUT') {
      const updates = req.body;
      const updated = updateCampaign(id, {
        ...updates,
        updatedBy: decoded.userId
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const deleted = deleteCampaign(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Campaign not found' });
      }
      return res.status(200).json({ message: 'Campaign deleted successfully' });
    }

    if (req.method === 'PATCH') {
      const { action } = req.body;
      
      let result;
      switch (action) {
        case 'launch':
          result = launchCampaign(id);
          break;
        case 'pause':
          result = pauseCampaign(id);
          break;
        case 'resume':
          result = resumeCampaign(id);
          break;
        case 'complete':
          result = completeCampaign(id);
          break;
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
      
      return res.status(200).json(result);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Campaign API error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}
