/**
 * Customer Tier & Segment System
 * Tính toán và quản lý hạng và phân loại khách hàng
 */

// Hạng khách hàng (dựa trên chi tiêu)
export type CustomerTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Phân loại khách hàng (dựa trên thời gian & hành vi)
export type CustomerSegment = 'new' | 'regular' | 'loyal' | 'vip';

export interface TierInfo {
  tier: CustomerTier;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  minSpent: number;
  benefits: string[];
}

export interface SegmentInfo {
  segment: CustomerSegment;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

export interface CustomerTierData {
  totalOrders: number;
  totalSpent: number;
  accountAge: number; // days
  lastOrderDate?: string;
}

/**
 * Tính toán hạng khách hàng dựa trên tổng chi tiêu
 * - BRONZE: 0 - 5 triệu
 * - SILVER: 5 - 10 triệu
 * - GOLD: 10 - 20 triệu
 * - PLATINUM: 20 - 50 triệu
 * - DIAMOND: > 50 triệu
 */
export function calculateCustomerTier(data: CustomerTierData): CustomerTier {
  const { totalSpent } = data;

  if (totalSpent >= 50000000) return 'diamond';
  if (totalSpent >= 20000000) return 'platinum';
  if (totalSpent >= 10000000) return 'gold';
  if (totalSpent >= 5000000) return 'silver';
  return 'bronze';
}

/**
 * Tính toán phân loại khách hàng
 * - NEW: 0-30 ngày kể từ ngày đăng ký
 * - REGULAR: >30 ngày, <365 ngày, <20 đơn hàng
 * - LOYAL: ≥365 ngày (1 năm) - Khách hàng lâu năm
 * - VIP: ≥20 đơn hàng (ưu tiên cao nhất)
 */
export function calculateCustomerSegment(data: CustomerTierData): CustomerSegment {
  const { totalOrders, accountAge } = data;

  // VIP: Có từ 20 đơn hàng trở lên (ưu tiên cao nhất)
  if (totalOrders >= 20) {
    return 'vip';
  }

  // LOYAL: Tài khoản lâu năm (≥365 ngày = 1 năm)
  if (accountAge >= 365) {
    return 'loyal';
  }

  // NEW: Tài khoản mới (0-30 ngày)
  if (accountAge <= 30) {
    return 'new';
  }

  // REGULAR: Còn lại (>30 ngày, <365 ngày, <20 đơn)
  return 'regular';
}

/**
 * Lấy thông tin chi tiết về hạng
 */
export function getTierInfo(tier: CustomerTier): TierInfo {
  const tierMap: Record<CustomerTier, TierInfo> = {
    bronze: {
      tier: 'bronze',
      name: 'Đồng',
      color: '#cd7f32',
      bgColor: '#fef3e2',
      icon: '🥉',
      minSpent: 0,
      benefits: [
        'Tích điểm thưởng x1',
        'Ưu đãi sinh nhật',
        'Thông báo sản phẩm mới'
      ]
    },
    silver: {
      tier: 'silver',
      name: 'Bạc',
      color: '#c0c0c0',
      bgColor: '#f5f5f5',
      icon: '🥈',
      minSpent: 5000000,
      benefits: [
        'Giảm 5% mọi đơn hàng',
        'Tích điểm thưởng x1.2',
        'Ưu đãi sinh nhật đặc biệt',
        'Miễn phí vận chuyển đơn > 500k'
      ]
    },
    gold: {
      tier: 'gold',
      name: 'Vàng',
      color: '#ffd700',
      bgColor: '#fffbeb',
      icon: '🥇',
      minSpent: 10000000,
      benefits: [
        'Giảm 10% mọi đơn hàng',
        'Miễn phí vận chuyển',
        'Tích điểm thưởng x1.5',
        'Ưu tiên hỗ trợ',
        'Quà tặng sinh nhật'
      ]
    },
    platinum: {
      tier: 'platinum',
      name: 'Bạch Kim',
      color: '#e5e4e2',
      bgColor: '#f8f9fa',
      icon: '💎',
      minSpent: 20000000,
      benefits: [
        'Giảm 15% mọi đơn hàng',
        'Miễn phí vận chuyển toàn quốc',
        'Tích điểm thưởng x2',
        'Ưu tiên hỗ trợ 24/7',
        'Truy cập sớm sản phẩm mới',
        'Quà tặng sinh nhật cao cấp'
      ]
    },
    diamond: {
      tier: 'diamond',
      name: 'Kim Cương',
      color: '#b9f2ff',
      bgColor: '#e0f7ff',
      icon: '💠',
      minSpent: 50000000,
      benefits: [
        'Giảm 20% mọi đơn hàng',
        'Miễn phí vận chuyển toàn quốc',
        'Tích điểm thưởng x3',
        'Chăm sóc VIP 24/7',
        'Truy cập độc quyền bộ sưu tập mới',
        'Quà tặng sinh nhật đặc biệt',
        'Tư vấn stylist cá nhân',
        'Ưu đãi độc quyền'
      ]
    }
  };

  return tierMap[tier];
}

/**
 * Lấy thông tin chi tiết về phân loại
 */
export function getSegmentInfo(segment: CustomerSegment): SegmentInfo {
  const segmentMap: Record<CustomerSegment, SegmentInfo> = {
    new: {
      segment: 'new',
      name: 'Khách hàng mới',
      color: '#10b981',
      bgColor: '#d1fae5',
      icon: '🆕',
      description: 'Tài khoản mới (0-30 ngày)'
    },
    regular: {
      segment: 'regular',
      name: 'Khách hàng thân thiết',
      color: '#6b7280',
      bgColor: '#f3f4f6',
      icon: '👤',
      description: 'Tài khoản >30 ngày, <365 ngày'
    },
    loyal: {
      segment: 'loyal',
      name: 'Khách hàng lâu năm',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      icon: '🏆',
      description: 'Tài khoản ≥365 ngày (1 năm)'
    },
    vip: {
      segment: 'vip',
      name: 'Khách hàng VIP',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: '⭐',
      description: 'Có ≥20 đơn hàng'
    }
  };

  return segmentMap[segment];
}

/**
 * Tính số ngày kể từ ngày tạo tài khoản
 */
export function calculateAccountAge(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Kiểm tra xem tier có thay đổi không
 */
export function shouldUpdateTier(
  currentTier: CustomerTier,
  data: CustomerTierData
): boolean {
  const calculatedTier = calculateCustomerTier(data);
  return currentTier !== calculatedTier;
}

/**
 * Kiểm tra xem segment có thay đổi không
 */
export function shouldUpdateSegment(
  currentSegment: CustomerSegment,
  data: CustomerTierData
): boolean {
  const calculatedSegment = calculateCustomerSegment(data);
  return currentSegment !== calculatedSegment;
}

/**
 * Format tier name cho hiển thị
 */
export function formatTierName(tier: CustomerTier): string {
  const tierInfo = getTierInfo(tier);
  return tierInfo.name;
}

/**
 * Format segment name cho hiển thị
 */
export function formatSegmentName(segment: CustomerSegment): string {
  const segmentInfo = getSegmentInfo(segment);
  return segmentInfo.name;
}

/**
 * Lấy màu sắc cho tier badge
 */
export function getTierColors(tier: CustomerTier): { color: string; bgColor: string } {
  const tierInfo = getTierInfo(tier);
  return {
    color: tierInfo.color,
    bgColor: tierInfo.bgColor
  };
}

/**
 * Lấy màu sắc cho segment badge
 */
export function getSegmentColors(segment: CustomerSegment): { color: string; bgColor: string } {
  const segmentInfo = getSegmentInfo(segment);
  return {
    color: segmentInfo.color,
    bgColor: segmentInfo.bgColor
  };
}
