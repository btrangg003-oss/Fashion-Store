import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { updateRequest, getRequestById } from '@/services/requestsDatabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    // Verify authentication
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const isAdmin = decoded.email === process.env.ADMIN_EMAIL || 
                   decoded.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { action, adminNote } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Get request
    const request = getRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update request
    const updatedRequest = updateRequest(id, {
      status: action === 'approve' ? 'approved' : 'rejected',
      adminNote: adminNote || '',
      processedBy: decoded.email,
      processedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
