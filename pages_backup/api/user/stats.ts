import { NextApiRequest, NextApiResponse } from 'next'
import { getUserStats } from '../../../lib/ordersDatabase'
import { verifyToken } from '../../../lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // Get token from cookie or header
    const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided'
      })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token'
      })
    }

    // Get user stats
    const stats = await getUserStats(payload.userId)

    return res.status(200).json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get user stats error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}