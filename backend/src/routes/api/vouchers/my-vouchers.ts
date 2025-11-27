import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getAllVouchers, getVoucherUsageByUserId } from '@/services/vouchersDatabase';
import { getUserById } from '@/services/userOperations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user from token
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decoded.userId;
    
    // Get user data to check tier
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userTier = user.loyaltyTier || 'bronze';
    const userSegment = user.segment || 'new';

    // Get all public vouchers
    const allVouchers = getAllVouchers();
    const now = new Date();
    
    // Get user's usage history
    const userUsage = getVoucherUsageByUserId(userId);
    
    // Categorize vouchers
    const categorized = {
      available: [] as any[],
      locked: [] as any[],
      used: [] as any[],
      expired: [] as any[]
    };

    allVouchers.forEach(voucher => {
      // Must be public
      if (!voucher.isPublic) return;
      
      // Must be active
      if (voucher.status !== 'active') return;
      
      // Must be within date range
      const startDate = new Date(voucher.startDate);
      const endDate = new Date(voucher.endDate);
      if (now < startDate || now > endDate) return;
      
      // Must have usage left
      if (voucher.currentUsage >= voucher.maxUsageTotal) return;

      // Check if user can access this voucher
      let isUnlocked = false;
      let lockReason = '';

      // Check target audience
      if (voucher.targetAudience === 'all') {
        isUnlocked = true;
      } else if (voucher.targetAudience === 'tier') {
        // Auto-unlock based on tier
        if (voucher.targetTiers && voucher.targetTiers.includes(userTier)) {
          isUnlocked = true;
        } else {
          lockReason = `Yêu cầu hạng: ${voucher.targetTiers?.map(t => {
            const tierNames: any = {
              bronze: '🥉 Đồng',
              silver: '🥈 Bạc',
              gold: '🥇 Vàng',
              platinum: '💎 Bạch Kim',
              diamond: '💎 Kim Cương'
            };
            return tierNames[t] || t;
          }).join(', ')}`;
        }
      } else if (voucher.targetAudience === 'specific') {
        // Check specific users
        if (voucher.specificUserIds && voucher.specificUserIds.includes(userId)) {
          isUnlocked = true;
        } else if (voucher.specificUserEmails && voucher.specificUserEmails.includes(user.email)) {
          isUnlocked = true;
        } else {
          lockReason = 'Voucher dành riêng cho khách hàng được chọn';
        }
      } else if (voucher.targetAudience === 'new') {
        isUnlocked = userSegment === 'new';
        if (!isUnlocked) lockReason = 'Dành cho khách hàng mới';
      } else if (voucher.targetAudience === 'regular') {
        isUnlocked = userSegment === 'regular';
        if (!isUnlocked) lockReason = 'Dành cho khách hàng thường';
      } else if (voucher.targetAudience === 'long-term') {
        isUnlocked = userSegment === 'loyal' || userSegment === 'vip';
        if (!isUnlocked) lockReason = 'Dành cho khách hàng lâu năm';
      } else if (voucher.targetAudience === 'loyal') {
        isUnlocked = userSegment === 'loyal';
        if (!isUnlocked) lockReason = 'Dành cho khách hàng trung thành';
      } else if (voucher.targetAudience === 'vip') {
        isUnlocked = userSegment === 'vip';
        if (!isUnlocked) lockReason = 'Dành cho khách hàng VIP';
      }

      const usage = userUsage.filter(u => u.voucherId === voucher.id);
      const usageCount = usage.length;

      const voucherData = {
        ...voucher,
        userUsageCount: usageCount,
        isUnlocked,
        lockReason
      };

      if (isUnlocked) {
        // Check if user has used this voucher
        if (usageCount > 0) {
          // Check if can use again
          if (usageCount < voucher.maxUsagePerUser) {
            categorized.available.push({
              ...voucherData,
              canUseAgain: true
            });
          } else {
            categorized.used.push({
              ...voucherData,
              lastUsedAt: usage[usage.length - 1].usedAt
            });
          }
        } else {
          categorized.available.push({
            ...voucherData,
            canUseAgain: false
          });
        }
      } else {
        // Show locked vouchers
        categorized.locked.push(voucherData);
      }
    });

    // Add expired vouchers that user has used
    const expiredVouchers = allVouchers.filter(v => {
      const endDate = new Date(v.endDate);
      return now > endDate && userUsage.some(u => u.voucherId === v.id);
    });

    expiredVouchers.forEach(voucher => {
      const usage = userUsage.filter(u => u.voucherId === voucher.id);
      categorized.expired.push({
        ...voucher,
        userUsageCount: usage.length,
        lastUsedAt: usage[usage.length - 1].usedAt
      });
    });

    return res.status(200).json(categorized);

  } catch (error: any) {
    console.error('My vouchers error:', error);
    return res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}
