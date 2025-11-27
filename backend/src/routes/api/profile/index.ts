import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { getUserById } from '../services/userOperations'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    const user = await getUserById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Remove sensitive data
    const { password, verificationCode, ...safeUser } = user

    res.status(200).json({ user: safeUser })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
