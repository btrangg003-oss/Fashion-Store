import fs from 'fs/promises'
import path from 'path'
import { Coupon, UserCoupon, CouponEligibility } from '../models/coupons'

const COUPONS_FILE = path.join(process.cwd(), 'data', 'coupons.json')
const USER_COUPONS_FILE = path.join(process.cwd(), 'data', 'user-coupons.json')

interface CouponsData {
  coupons: Coupon[]
  userCoupons: UserCoupon[]
}

// Read data
async function readData(): Promise<CouponsData> {
  try {
    const [couponsData, userCouponsData] = await Promise.all([
      fs.readFile(COUPONS_FILE, 'utf-8').catch(() => '{"coupons":[]}'),
      fs.readFile(USER_COUPONS_FILE, 'utf-8').catch(() => '{"userCoupons":[]}')
    ])
    
    return {
      coupons: JSON.parse(couponsData).coupons || [],
      userCoupons: JSON.parse(userCouponsData).userCoupons || []
    }
  } catch (error) {
    return { coupons: [], userCoupons: [] }
  }
}

// Save data
async function saveData(data: Partial<CouponsData>) {
  if (data.coupons) {
    await fs.writeFile(COUPONS_FILE, JSON.stringify({ coupons: data.coupons }, null, 2))
  }
  if (data.userCoupons) {
    await fs.writeFile(USER_COUPONS_FILE, JSON.stringify({ userCoupons: data.userCoupons }, null, 2))
  }
}

// Check eligibility
export async function checkCouponEligibility(
  coupon: Coupon,
  userStats: {
    loyaltyPoints: number
    totalOrders: number
    totalSpent: number
    tier: string
    isNewUser: boolean
  },
  userId: string
): Promise<CouponEligibility> {
  if (!coupon.eligibility) {
    return { eligible: true }
  }

  const { eligibility } = coupon
  const missing: any = {}

  // Check loyalty points
  if (eligibility.minLoyaltyPoints && userStats.loyaltyPoints < eligibility.minLoyaltyPoints) {
    missing.loyaltyPoints = eligibility.minLoyaltyPoints - userStats.loyaltyPoints
  }

  // Check total orders
  if (eligibility.minTotalOrders && userStats.totalOrders < eligibility.minTotalOrders) {
    missing.totalOrders = eligibility.minTotalOrders - userStats.totalOrders
  }

  // Check total spent
  if (eligibility.minTotalSpent && userStats.totalSpent < eligibility.minTotalSpent) {
    missing.totalSpent = eligibility.minTotalSpent - userStats.totalSpent
  }

  // Check tier
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum']
  if (eligibility.requiredTier) {
    const userTierIndex = tierOrder.indexOf(userStats.tier.toLowerCase())
    const requiredTierIndex = tierOrder.indexOf(eligibility.requiredTier)
    if (userTierIndex < requiredTierIndex) {
      missing.tier = eligibility.requiredTier
    }
  }

  // Check new users only
  if (eligibility.newUsersOnly && !userStats.isNewUser) {
    return {
      eligible: false,
      reason: 'Chỉ dành cho khách hàng mới'
    }
  }

  // Check specific users
  if (eligibility.specificUsers && !eligibility.specificUsers.includes(userId)) {
    return {
      eligible: false,
      reason: 'Mã giảm giá không dành cho bạn'
    }
  }

  if (Object.keys(missing).length > 0) {
    return {
      eligible: false,
      reason: 'Chưa đủ điều kiện',
      missingRequirements: missing
    }
  }

  return { eligible: true }
}

// Get available coupons for user
export async function getAvailableCoupons(
  userId: string,
  userStats: {
    loyaltyPoints: number
    totalOrders: number
    totalSpent: number
    tier: string
    isNewUser: boolean
  }
): Promise<{ eligible: Coupon[], ineligible: Array<Coupon & { eligibilityCheck: CouponEligibility }> }> {
  const { coupons, userCoupons } = await readData()
  const now = new Date()

  // Filter active coupons
  const activeCoupons = coupons.filter(c => 
    c.isActive && 
    new Date(c.startDate) <= now && 
    new Date(c.endDate) >= now &&
    (!c.usageLimit || c.usedCount < c.usageLimit)
  )

  // Check user's claimed coupons
  const userClaimedIds = userCoupons
    .filter(uc => uc.userId === userId)
    .map(uc => uc.couponId)

  const eligible: Coupon[] = []
  const ineligible: Array<Coupon & { eligibilityCheck: CouponEligibility }> = []

  for (const coupon of activeCoupons) {
    // Skip if already claimed and has per-user limit
    const userClaimCount = userCoupons.filter(
      uc => uc.userId === userId && uc.couponId === coupon.id
    ).length
    
    if (coupon.perUserLimit && userClaimCount >= coupon.perUserLimit) {
      continue
    }

    const eligibilityCheck = await checkCouponEligibility(coupon, userStats, userId)
    
    if (eligibilityCheck.eligible) {
      eligible.push(coupon)
    } else {
      ineligible.push({ ...coupon, eligibilityCheck })
    }
  }

  return { eligible, ineligible }
}

// Get user's coupons
export async function getUserCoupons(userId: string): Promise<UserCoupon[]> {
  const { userCoupons, coupons } = await readData()
  const now = new Date()

  return userCoupons
    .filter(uc => uc.userId === userId)
    .map(uc => {
      const coupon = coupons.find(c => c.id === uc.couponId)
      if (!coupon) return null

      // Update status
      let status = uc.status
      if (status === 'available') {
        if (uc.expiresAt && new Date(uc.expiresAt) < now) {
          status = 'expired'
        } else if (new Date(coupon.endDate) < now) {
          status = 'expired'
        }
      }

      return {
        ...uc,
        coupon,
        status
      }
    })
    .filter(Boolean) as UserCoupon[]
}

// Claim coupon
export async function claimCoupon(
  userId: string,
  couponId: string,
  userStats: {
    loyaltyPoints: number
    totalOrders: number
    totalSpent: number
    tier: string
    isNewUser: boolean
  }
): Promise<{ success: boolean, message: string, userCoupon?: UserCoupon }> {
  const { coupons, userCoupons } = await readData()
  
  const coupon = coupons.find(c => c.id === couponId)
  if (!coupon) {
    return { success: false, message: 'Mã giảm giá không tồn tại' }
  }

  // Check eligibility
  const eligibility = await checkCouponEligibility(coupon, userStats, userId)
  if (!eligibility.eligible) {
    return { success: false, message: eligibility.reason || 'Không đủ điều kiện' }
  }

  // Check per-user limit
  const userClaimCount = userCoupons.filter(
    uc => uc.userId === userId && uc.couponId === couponId
  ).length
  
  if (coupon.perUserLimit && userClaimCount >= coupon.perUserLimit) {
    return { success: false, message: 'Bạn đã nhận tối đa mã này' }
  }

  // Create user coupon
  const userCoupon: UserCoupon = {
    id: `uc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    couponId,
    coupon,
    claimedAt: new Date().toISOString(),
    status: 'available',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
  }

  userCoupons.push(userCoupon)
  await saveData({ userCoupons })

  return { success: true, message: 'Nhận mã thành công', userCoupon }
}

// Use coupon
export async function useCoupon(
  userCouponId: string,
  orderId: string
): Promise<{ success: boolean, message: string }> {
  const { userCoupons } = await readData()
  
  const userCoupon = userCoupons.find(uc => uc.id === userCouponId)
  if (!userCoupon) {
    return { success: false, message: 'Mã không tồn tại' }
  }

  if (userCoupon.status !== 'available') {
    return { success: false, message: 'Mã không khả dụng' }
  }

  userCoupon.status = 'used'
  userCoupon.usedAt = new Date().toISOString()
  userCoupon.orderId = orderId

  await saveData({ userCoupons })

  return { success: true, message: 'Áp dụng mã thành công' }
}

// Validate coupon for order
export async function validateCouponForOrder(
  code: string,
  userId: string,
  orderTotal: number,
  productIds: string[]
): Promise<{ valid: boolean, message?: string, discount: number, userCouponId?: string }> {
  const { coupons, userCoupons } = await readData()
  
  // Find coupon by code
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase())
  if (!coupon) {
    return { valid: false, message: 'Mã không tồn tại', discount: 0 }
  }

  // Check if user has claimed this coupon
  const userCoupon = userCoupons.find(
    uc => uc.userId === userId && uc.couponId === coupon.id && uc.status === 'available'
  )
  
  if (!userCoupon) {
    return { valid: false, message: 'Bạn chưa nhận mã này', discount: 0 }
  }

  // Check active
  if (!coupon.isActive) {
    return { valid: false, message: 'Mã không còn hiệu lực', discount: 0 }
  }

  // Check date
  const now = new Date()
  if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
    return { valid: false, message: 'Mã đã hết hạn', discount: 0 }
  }

  // Check min order value
  if (orderTotal < coupon.minOrderValue) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫`,
      discount: 0
    }
  }

  // Check product restrictions
  if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
    const hasApplicable = productIds.some(id => coupon.applicableProducts!.includes(id))
    if (!hasApplicable) {
      return { valid: false, message: 'Mã không áp dụng cho sản phẩm này', discount: 0 }
    }
  }

  if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
    const hasExcluded = productIds.some(id => coupon.excludedProducts!.includes(id))
    if (hasExcluded) {
      return { valid: false, message: 'Có sản phẩm không được áp dụng mã', discount: 0 }
    }
  }

  // Calculate discount
  let discount = 0
  if (coupon.type === 'percentage') {
    discount = (orderTotal * coupon.value) / 100
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount)
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value
  } else if (coupon.type === 'free_shipping') {
    discount = 30000 // Default shipping fee
  }

  return {
    valid: true,
    discount: Math.floor(discount),
    userCouponId: userCoupon.id
  }
}

export default {
  checkCouponEligibility,
  getAvailableCoupons,
  getUserCoupons,
  claimCoupon,
  useCoupon,
  validateCouponForOrder
}
