import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import {
  getReturnById,
  updateReturn,
  cancelReturn
} from '../../../lib/returnService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      return res.status(400).json({ message: 'Invalid return ID' })
    }

    // GET - Get return details
    if (req.method === 'GET') {
      const returnRequest = await getReturnById(id)

      if (!returnRequest) {
        return res.status(404).json({ message: 'Yêu cầu trả hàng không tồn tại' })
      }

      if (returnRequest.userId !== decoded.userId) {
        return res.status(403).json({ message: 'Không có quyền truy cập' })
      }

      return res.status(200).json({
        success: true,
        return: returnRequest
      })
    }

    // PUT - Update return (cancel)
    if (req.method === 'PUT') {
      const { action } = req.body

      if (action === 'cancel') {
        const updated = await cancelReturn(id, decoded.userId)

        return res.status(200).json({
          success: true,
          message: 'Hủy yêu cầu thành công',
          return: updated
        })
      }

      return res.status(400).json({ message: 'Invalid action' })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error: any) {
    console.error('Return API error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
