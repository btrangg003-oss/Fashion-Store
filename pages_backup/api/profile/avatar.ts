import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import { updateUser, getUserById } from '../../../lib/userOperations'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    // Get current user
    const user = await getUserById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Delete old avatar file if exists
    if (user.avatar) {
      const avatarPath = path.join(process.cwd(), 'public', user.avatar)
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath)
      }
    }

    // Update user
    await updateUser(decoded.userId, {
      avatar: '',
      updatedAt: new Date().toISOString()
    })

    res.status(200).json({ message: 'Avatar deleted successfully' })
  } catch (error) {
    console.error('Delete avatar error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
