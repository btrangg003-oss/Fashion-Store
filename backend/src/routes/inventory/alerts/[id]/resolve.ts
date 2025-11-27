import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { resolveAlert } from '@/services/inventoryDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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
      return res.status(400).json({ message: 'Missing alert ID' });
    }

    const resolved = resolveAlert(id, decoded.userId);
    
    return res.status(200).json({
      message: 'Alert resolved successfully',
      alert: resolved
    });

  } catch (error: any) {
    console.error('Resolve alert error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
