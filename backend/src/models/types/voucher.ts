// Voucher Type Definitions

export type VoucherType = 'percentage' | 'fixed' | 'freeship';
export type VoucherStatus = 'active' | 'expired' | 'paused' | 'upcoming';
export type VoucherTargetAudience = 'all' | 'new' | 'regular' | 'loyal' | 'vip' | 'tier' | 'specific' | 'long-term';
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type CustomerSegment = 'new' | 'regular' | 'loyal' | 'vip';

export interface Voucher {
  id: string;
  code: string; // Mã voucher (uppercase, 6-20 chars)
  description: string; // Mô tả nội bộ
  type: VoucherType; // Loại giảm giá
  value: number; // Giá trị giảm (% hoặc số tiền)
  maxDiscount?: number; // Mức giảm giá tối đa (cho type percentage)
  
  // Thời gian
  startDate: string; // ISO date
  endDate: string; // ISO date
  
  // Điều kiện áp dụng
  minOrderValue: number; // Giá trị đơn tối thiểu
  maxUsageTotal: number; // Số lần sử dụng tối đa (toàn hệ thống)
  maxUsagePerUser: number; // Số lần mỗi user được dùng
  currentUsage: number; // Số lần đã dùng
  
  // Phạm vi áp dụng
  targetAudience: VoucherTargetAudience;
  targetTiers?: CustomerTier[]; // Hạng khách hàng cụ thể (bronze, silver, gold, platinum, diamond)
  targetSegments?: CustomerSegment[]; // Phân loại khách hàng (new, regular, loyal, vip)
  specificUserIds?: string[]; // Danh sách user ID cụ thể
  specificUserEmails?: string[]; // Danh sách email cụ thể
  applicableCategories?: string[]; // Danh mục áp dụng
  applicableProductIds?: string[]; // Sản phẩm cụ thể
  
  // Cấu hình
  noStacking: boolean; // Không chồng mã khác
  noSaleProducts: boolean; // Không áp dụng với sản phẩm đang sale
  isPublic: boolean; // Hiển thị công khai
  eventLabel?: string; // Nhãn sự kiện (BLACK FRIDAY, 11.11, etc.)
  
  // Trạng thái
  status: VoucherStatus;
  isActive: boolean;
  
  // Metadata
  createdBy: string; // User ID
  createdAt: string; // ISO date
  updatedBy?: string;
  updatedAt?: string;
}

export interface VoucherUsage {
  id: string;
  voucherId: string;
  voucherCode: string;
  userId: string;
  orderId: string;
  discountAmount: number; // Số tiền đã giảm
  orderValue: number; // Giá trị đơn hàng
  usedAt: string; // ISO date
}

export interface VoucherHistory {
  id: string;
  voucherId: string;
  userId: string; // Admin ID
  action: 'created' | 'updated' | 'paused' | 'resumed' | 'deleted';
  changes?: {
    field: string;
    before: any;
    after: any;
  }[];
  reason?: string;
  timestamp: string;
}

export interface VoucherStats {
  totalVouchers: number;
  activeVouchers: number;
  expiredVouchers: number;
  pausedVouchers: number;
  totalUsage: number;
  totalRevenue: number;
  totalDiscount: number;
  conversionRate: number;
}

export interface VoucherValidationResult {
  valid: boolean;
  message?: string;
  discountAmount?: number;
  finalPrice?: number;
}
