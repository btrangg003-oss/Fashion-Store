import type { NextApiRequest, NextApiResponse } from 'next';
import { getVoucherByCode, recordVoucherUsage, generateId } from '@/services/vouchersDatabase';
import { findUserById } from '@/services/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { voucherCode, orderId, userId, discountAmount, orderValue } = req.body;

    if (!voucherCode || !orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if user account is restricted
    if (userId !== 'guest') {
      const user = await findUserById(userId);
      if (user && user.accountStatus === 'restricted') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản bị hạn chế không thể sử dụng voucher',
          accountStatus: 'restricted'
        });
      }
    }

    // Get voucher
    const voucher = getVoucherByCode(voucherCode);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Record usage
    const usage = {
      id: generateId(),
      voucherId: voucher.id,
      voucherCode: voucher.code,
      userId,
      orderId,
      discountAmount: discountAmount || 0,
      orderValue: orderValue || 0,
      usedAt: new Date().toISOString()
    };

    recordVoucherUsage(usage);

    return res.status(200).json({
      success: true,
      message: 'Voucher usage recorded successfully'
    });

  } catch (error: any) {
    console.error('Record voucher usage error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
