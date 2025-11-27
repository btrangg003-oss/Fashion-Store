import { Voucher, VoucherValidationResult } from '@/models/voucher';
import { getVoucherUsageByUserId } from './vouchersDatabase';
import { getUserById } from './userOperations';

interface ValidateVoucherParams {
  voucher: Voucher;
  userId: string;
  orderValue: number;
  cartItems?: any[];
}

export async function validateVoucher({
  voucher,
  userId,
  orderValue,
  cartItems = []
}: ValidateVoucherParams): Promise<VoucherValidationResult> {
  
  // Check if voucher is active
  if (!voucher.isActive || voucher.status !== 'active') {
    return {
      valid: false,
      message: 'Mã giảm giá không khả dụng'
    };
  }
  
  // Check date range
  const now = new Date();
  const startDate = new Date(voucher.startDate);
  const endDate = new Date(voucher.endDate);
  
  if (now < startDate) {
    return {
      valid: false,
      message: 'Mã giảm giá chưa có hiệu lực'
    };
  }
  
  if (now > endDate) {
    return {
      valid: false,
      message: 'Mã giảm giá đã hết hạn'
    };
  }
  
  // Check usage limit
  if (voucher.currentUsage >= voucher.maxUsageTotal) {
    return {
      valid: false,
      message: 'Mã giảm giá đã hết lượt sử dụng'
    };
  }
  
  // Check per-user usage limit
  const userUsage = getVoucherUsageByUserId(userId);
  const userUsageCount = userUsage.filter(u => u.voucherId === voucher.id).length;
  
  if (userUsageCount >= voucher.maxUsagePerUser) {
    return {
      valid: false,
      message: `Bạn đã sử dụng mã này ${voucher.maxUsagePerUser} lần`
    };
  }
  
  // Check minimum order value
  if (orderValue < voucher.minOrderValue) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu ${formatPrice(voucher.minOrderValue)}`
    };
  }
  
  // Check target audience
  if (userId !== 'guest') {
    const user = await getUserById(userId);
    
    if (user) {
      const userTier = user.loyaltyTier || 'bronze';
      const userSegment = user.segment || 'new';
      
      // Check tier-based vouchers
      if (voucher.targetAudience === 'tier') {
        if (!voucher.targetTiers || !voucher.targetTiers.includes(userTier)) {
          return {
            valid: false,
            message: 'Mã giảm giá không áp dụng cho hạng thành viên của bạn'
          };
        }
      }
      
      // Check segment-based vouchers
      if (voucher.targetAudience === 'new' && userSegment !== 'new') {
        return {
          valid: false,
          message: 'Mã giảm giá chỉ dành cho khách hàng mới'
        };
      }
      
      if (voucher.targetAudience === 'regular' && userSegment !== 'regular') {
        return {
          valid: false,
          message: 'Mã giảm giá chỉ dành cho khách hàng thường'
        };
      }
      
      if (voucher.targetAudience === 'long-term' && userSegment !== 'loyal' && userSegment !== 'vip') {
        return {
          valid: false,
          message: 'Mã giảm giá chỉ dành cho khách hàng lâu năm'
        };
      }
      
      if (voucher.targetAudience === 'loyal' && userSegment !== 'loyal') {
        return {
          valid: false,
          message: 'Mã giảm giá chỉ dành cho khách hàng trung thành'
        };
      }
      
      if (voucher.targetAudience === 'vip' && userSegment !== 'vip') {
        return {
          valid: false,
          message: 'Mã giảm giá chỉ dành cho khách hàng VIP'
        };
      }
      
      // Check specific users
      if (voucher.targetAudience === 'specific') {
        const isSpecificUser = 
          (voucher.specificUserIds && voucher.specificUserIds.includes(userId)) ||
          (voucher.specificUserEmails && voucher.specificUserEmails.includes(user.email));
        
        if (!isSpecificUser) {
          return {
            valid: false,
            message: 'Mã giảm giá không áp dụng cho tài khoản này'
          };
        }
      }
    }
  } else {
    // Guest users can only use 'all' vouchers
    if (voucher.targetAudience !== 'all') {
      return {
        valid: false,
        message: 'Vui lòng đăng nhập để sử dụng mã giảm giá này'
      };
    }
  }
  
  // Calculate discount
  const discountAmount = calculateDiscount(voucher, orderValue);
  const finalPrice = Math.max(0, orderValue - discountAmount);
  
  return {
    valid: true,
    discountAmount,
    finalPrice,
    message: `Giảm ${formatPrice(discountAmount)}`
  };
}

export function calculateDiscount(voucher: Voucher, orderValue: number): number {
  let discount = 0;
  
  switch (voucher.type) {
    case 'percentage':
      discount = (orderValue * voucher.value) / 100;
      // Apply maxDiscount if set
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
      break;
      
    case 'fixed':
      discount = voucher.value;
      break;
      
    case 'freeship':
      // Freeship typically has a fixed value (shipping cost)
      discount = voucher.value;
      break;
  }
  
  // Discount cannot exceed order value
  return Math.min(discount, orderValue);
}

export async function findBestVoucher(
  vouchers: Voucher[],
  userId: string,
  orderValue: number
): Promise<Voucher | null> {
  let bestVoucher: Voucher | null = null;
  let maxDiscount = 0;
  
  for (const voucher of vouchers) {
    const validation = await validateVoucher({ voucher, userId, orderValue });
    
    if (validation.valid && validation.discountAmount) {
      if (validation.discountAmount > maxDiscount) {
        maxDiscount = validation.discountAmount;
        bestVoucher = voucher;
      }
    }
  }
  
  return bestVoucher;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}
