import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import {
  getAllVouchers,
  createVoucher,
  generateVoucherCode,
  generateId,
  validateVoucherCode,
  updateVoucherStatuses
} from '@/services/vouchersDatabase';
import { Voucher } from '@/models/voucher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify admin authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update voucher statuses before processing
    updateVoucherStatuses();

    if (req.method === 'GET') {
      const vouchers = getAllVouchers();
      
      // Apply filters
      let filtered = vouchers;
      const { status, type, search, targetAudience } = req.query;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(v => v.status === status);
      }
      
      if (type && type !== 'all') {
        filtered = filtered.filter(v => v.type === type);
      }
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filtered = filtered.filter(v => 
          v.code.toLowerCase().includes(searchLower) ||
          v.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (targetAudience && targetAudience !== 'all') {
        filtered = filtered.filter(v => v.targetAudience === targetAudience);
      }
      
      // Sort by creation date (newest first)
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return res.status(200).json(filtered);
    }

    if (req.method === 'POST') {
      const voucherData = req.body;
      
      // Validate required fields
      if (!voucherData.code || !voucherData.type || !voucherData.value) {
        return res.status(400).json({ 
          message: 'Thiếu thông tin bắt buộc' 
        });
      }
      
      // Validate voucher code format
      if (!validateVoucherCode(voucherData.code)) {
        return res.status(400).json({ 
          message: 'Mã voucher không hợp lệ (6-20 ký tự, chỉ chữ in hoa và số)' 
        });
      }
      
      // Validate percentage
      if (voucherData.type === 'percentage' && voucherData.value > 100) {
        return res.status(400).json({ 
          message: 'Phần trăm giảm giá không được vượt quá 100%' 
        });
      }
      
      // Validate maxDiscount for percentage type
      if (voucherData.type === 'percentage' && voucherData.maxDiscount) {
        if (voucherData.maxDiscount <= 0) {
          return res.status(400).json({ 
            message: 'Mức giảm giá tối đa phải lớn hơn 0' 
          });
        }
      }
      
      // Determine initial status
      const now = new Date();
      const startDate = new Date(voucherData.startDate);
      const endDate = new Date(voucherData.endDate);
      
      let status: Voucher['status'] = 'active';
      if (now < startDate) {
        status = 'upcoming';
      } else if (now > endDate) {
        status = 'expired';
      }
      
      const newVoucher: Voucher = {
        id: generateId(),
        code: voucherData.code.toUpperCase(),
        description: voucherData.description || '',
        type: voucherData.type,
        value: voucherData.value,
        maxDiscount: voucherData.maxDiscount || undefined,
        startDate: voucherData.startDate,
        endDate: voucherData.endDate,
        minOrderValue: voucherData.minOrderValue || 0,
        maxUsageTotal: voucherData.maxUsageTotal || 1000,
        maxUsagePerUser: voucherData.maxUsagePerUser || 1,
        currentUsage: 0,
        targetAudience: voucherData.targetAudience || 'all',
        targetTiers: voucherData.targetTiers || [],
        targetSegments: voucherData.targetSegments || [],
        specificUserIds: voucherData.specificUserIds || [],
        specificUserEmails: voucherData.specificUserEmails || [],
        applicableCategories: voucherData.applicableCategories || [],
        applicableProductIds: voucherData.applicableProductIds || [],
        noStacking: voucherData.noStacking || false,
        noSaleProducts: voucherData.noSaleProducts || false,
        isPublic: voucherData.isPublic !== false,
        eventLabel: voucherData.eventLabel || undefined,
        status,
        isActive: voucherData.isActive !== false,
        createdBy: decoded.userId,
        createdAt: new Date().toISOString()
      };
      
      const created = createVoucher(newVoucher);
      return res.status(201).json(created);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('Voucher API error:', error);
    return res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}
