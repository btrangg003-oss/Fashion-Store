import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getVoucherByCode } from '@/services/vouchersDatabase';
import { validateVoucher } from '@/services/voucherValidation';
import { findUserById } from '@/services/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user from token (optional - vouchers can work for guests too)
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    let userId = 'guest';
    let user = null;
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          userId = decoded.userId;
          user = await findUserById(userId);
          
          // Check if account is restricted - cannot use vouchers
          if (user && user.accountStatus === 'restricted') {
            return res.status(403).json({
              valid: false,
              message: '⚠️ Tài khoản của bạn bị hạn chế không thể sử dụng mã giảm giá/voucher.',
              accountStatus: 'restricted'
            });
          }
        }
      } catch (error) {
        // Token invalid but continue as guest
        console.log('Invalid token, continuing as guest');
      }
    }

    const { code, orderValue } = req.body;

    if (!code) {
      return res.status(400).json({
        valid: false,
        message: 'Vui lòng nhập mã giảm giá'
      });
    }

    if (!orderValue || orderValue <= 0) {
      return res.status(400).json({
        valid: false,
        message: 'Giá trị đơn hàng không hợp lệ'
      });
    }

    // Get voucher by code
    const voucher = getVoucherByCode(code);

    if (!voucher) {
      return res.status(404).json({
        valid: false,
        message: 'Mã giảm giá không tồn tại'
      });
    }

    // Validate voucher
    const validation = await validateVoucher({
      voucher,
      userId,
      orderValue
    });

    if (!validation.valid) {
      return res.status(400).json({
        valid: false,
        message: validation.message
      });
    }

    return res.status(200).json({
      valid: true,
      voucherId: voucher.id,
      code: voucher.code,
      discountAmount: validation.discountAmount,
      finalPrice: validation.finalPrice,
      message: validation.message
    });

  } catch (error: any) {
    console.error('Voucher validation error:', error);
    return res.status(500).json({
      valid: false,
      message: 'Có lỗi xảy ra khi kiểm tra mã giảm giá'
    });
  }
}
