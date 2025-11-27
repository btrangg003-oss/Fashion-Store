import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  pauseVoucher,
  resumeVoucher
} from '@/services/vouchersDatabase';

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
      return res.status(400).json({ message: 'Invalid voucher ID' });
    }

    if (req.method === 'GET') {
      const voucher = getVoucherById(id);
      if (!voucher) {
        return res.status(404).json({ message: 'Voucher not found' });
      }
      return res.status(200).json(voucher);
    }

    if (req.method === 'PUT') {
      const updates = req.body;
      
      // Validate maxDiscount if updating percentage voucher
      if (updates.type === 'percentage' && updates.maxDiscount !== undefined) {
        if (updates.maxDiscount <= 0) {
          return res.status(400).json({ 
            message: 'Mức giảm giá tối đa phải lớn hơn 0' 
          });
        }
      }
      
      const updated = updateVoucher(id, updates, decoded.userId);
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const deleted = deleteVoucher(id, decoded.userId);
      if (!deleted) {
        return res.status(404).json({ message: 'Voucher not found' });
      }
      return res.status(200).json({ message: 'Voucher deleted successfully' });
    }

    if (req.method === 'PATCH') {
      const { action } = req.body;
      
      if (action === 'pause') {
        const paused = pauseVoucher(id, decoded.userId);
        return res.status(200).json(paused);
      }
      
      if (action === 'resume') {
        const resumed = resumeVoucher(id, decoded.userId);
        return res.status(200).json(resumed);
      }
      
      return res.status(400).json({ message: 'Invalid action' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Voucher API error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}
