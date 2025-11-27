import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { validateCouponForOrder } from '../services/couponService'

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
    const { code, orderTotal, productIds } = req.body

    if (!code || !orderTotal || !productIds) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = await validateCouponForOrder(code, userId, orderTotal, productIds)

    if (!result.valid) {
      return res.status(400).json({ error: result.message })
    }

    return res.status(200).json({
      valid: true,
      discount: result.discount,
      userCouponId: result.userCouponId
    })
  } catch (error: any) {
    console.error('Validate coupon error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
