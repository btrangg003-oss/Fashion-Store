import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { readOrdersDatabase, writeOrdersDatabase } from '../services/ordersDatabase'

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

    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid wishlist ID' })
    }

    const data = await readOrdersDatabase()

    // Find and verify ownership
    const item = data.wishlist.find(w => w.id === id)
    if (!item) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }

    if (item.userId !== decoded.userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' })
    }

    // Remove from wishlist
    data.wishlist = data.wishlist.filter(w => w.id !== id)
    await writeOrdersDatabase(data)

    return res.status(200).json({
      success: true,
      message: 'Đã xóa khỏi danh sách yêu thích'
    })
  } catch (error: any) {
    console.error('Remove wishlist error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
