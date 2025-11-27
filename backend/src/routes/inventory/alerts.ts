import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getAllAlerts,
  getActiveAlerts,
  createAlert,
  resolveAlert,
  checkAndCreateAlerts
} from '@/services/inventoryDatabase';

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

    if (req.method === 'GET') {
      // Auto-generate alerts based on current inventory
      checkAndCreateAlerts();
      
      const alerts = getAllAlerts();
      
      // Apply filters
      let filtered = alerts;
      const { type, severity, resolved } = req.query;
      
      if (type && type !== 'all') {
        filtered = filtered.filter(a => a.type === type);
      }
      
      if (severity && severity !== 'all') {
        filtered = filtered.filter(a => a.severity === severity);
      }
      
      if (resolved === 'false') {
        filtered = filtered.filter(a => !a.isResolved);
      } else if (resolved === 'true') {
        filtered = filtered.filter(a => a.isResolved);
      }
      
      // Sort by severity and date
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort((a, b) => {
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      return res.status(200).json({ alerts: filtered });
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error: any) {
    console.error('Alerts API error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
