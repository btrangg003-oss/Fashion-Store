import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import { getAvailableCoupons } from '../../../lib/couponService'
import { getUserById } from '../../../lib/userOperations'
import { getOrdersByUserId } from '../../../lib/ordersDatabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    const userId = decoded.userId

    // Get user data
    const user = await getUserById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user orders to calculate stats
    const orders = await getOrdersByUserId(userId)
    const completedOrders = orders.filter(o => o.status === 'delivered')
    
    const userStats = {
      loyaltyPoints: user.loyaltyPoints || 0,
      totalOrders: completedOrders.length,
      totalSpent: completedOrders.reduce((sum, o) => sum + o.total, 0),
      tier: user.loyaltyTier || 'bronze',
      isNewUser: completedOrders.length === 0
    }

    // Get available coupons
    const { eligible, ineligible } = await getAvailableCoupons(userId, userStats)

    return res.status(200).json({
      eligible,
      ineligible,
      userStats
    })
  } catch (error: any) {
    console.error('Get available coupons error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
