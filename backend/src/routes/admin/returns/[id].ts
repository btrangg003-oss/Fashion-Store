import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getReturnById, updateReturn } from '@/services/returnService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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

    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid return ID' });
    }

    // GET - Get return details
    if (req.method === 'GET') {
      const returnRequest = await getReturnById(id);

      if (!returnRequest) {
        return res.status(404).json({ error: 'Return request not found' });
      }

      return res.status(200).json({
        success: true,
        return: returnRequest
      });
    }

    // PUT - Update return (approve/reject)
    if (req.method === 'PUT') {
      const { status, adminNote } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      if (!['approved', 'rejected', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const returnRequest = await getReturnById(id);

      if (!returnRequest) {
        return res.status(404).json({ error: 'Return request not found' });
      }

      // Update return with admin info
      const updates: any = {
        status,
        processedBy: decoded.email,
        processedAt: new Date().toISOString()
      };

      if (adminNote) {
        updates.adminNote = adminNote;
      }

      if (status === 'approved') {
        updates.approvedAt = new Date().toISOString();
      }

      if (status === 'completed') {
        updates.completedAt = new Date().toISOString();
        updates.refundStatus = 'completed';
      }

      const updated = await updateReturn(id, updates);

      return res.status(200).json({
        success: true,
        message: `Return request ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'completed'}`,
        return: updated
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Admin return API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
