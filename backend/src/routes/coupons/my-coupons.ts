import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { getUserCoupons } from '../services/couponService'

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

    const coupons = await getUserCoupons(userId)

    return res.status(200).json({ coupons })
  } catch (error: any) {
    console.error('Get user coupons error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
