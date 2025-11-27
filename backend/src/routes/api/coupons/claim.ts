import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { claimCoupon } from '../services/couponService'
import { getUserById } from '../services/userOperations'
import { getOrdersByUserId } from '../services/ordersDatabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    const userId = decoded.userId
    const { couponId } = req.body

    if (!couponId) {
      return res.status(400).json({ error: 'Coupon ID required' })
    }

    // Get user stats
    const user = await getUserById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const orders = await getOrdersByUserId(userId)
    const completedOrders = orders.filter(o => o.status === 'delivered')
    
    const userStats = {
      loyaltyPoints: user.loyaltyPoints || 0,
      totalOrders: completedOrders.length,
      totalSpent: completedOrders.reduce((sum, o) => sum + o.total, 0),
      tier: user.loyaltyTier || 'bronze',
      isNewUser: completedOrders.length === 0
    }

    // Claim coupon
    const result = await claimCoupon(userId, couponId, userStats)

    if (!result.success) {
      return res.status(400).json({ error: result.message })
    }

    return res.status(200).json({
      message: result.message,
      userCoupon: result.userCoupon
    })
  } catch (error: any) {
    console.error('Claim coupon error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
