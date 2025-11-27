export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minOrderValue: number
  maxDiscount?: number
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  perUserLimit?: number
  description: string
  isActive: boolean
  createdAt: string
  
  // Eligibility conditions
  eligibility?: {
    minLoyaltyPoints?: number
    minTotalOrders?: number
    minTotalSpent?: number
    requiredTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
    newUsersOnly?: boolean
    specificUsers?: string[]
  }
  
  // Product restrictions
  applicableProducts?: string[]
  applicableCategories?: string[]
  excludedProducts?: string[]
}

export interface UserCoupon {
  id: string
  userId: string
  couponId: string
  coupon: Coupon
  claimedAt: string
  usedAt?: string
  orderId?: string
  status: 'available' | 'used' | 'expired'
  expiresAt?: string
}

export interface CouponEligibility {
  eligible: boolean
  reason?: string
  missingRequirements?: {
    loyaltyPoints?: number
    totalOrders?: number
    totalSpent?: number
    tier?: string
  }
}
