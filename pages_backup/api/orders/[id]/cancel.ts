import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { getOrderById, updateOrderStatus } from '../../../../lib/ordersDatabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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
    const { reason } = req.body

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid order ID' })
    }

    // Get order
    const order = await getOrderById(id)
    if (!order) {
      return res.status(404).json({ message: 'Đơn hàng không tồn tại' })
    }

    // Check if order belongs to user
    if (order.userId !== decoded.userId) {
      return res.status(403).json({ message: 'Không có quyền hủy đơn hàng này' })
    }

    // Check if order can be cancelled
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ 
        message: 'Chỉ có thể hủy đơn hàng đang chờ xử lý hoặc đang xử lý' 
      })
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(
      id,
      decoded.userId,
      'cancelled',
      {
        cancelledAt: new Date().toISOString(),
        cancelReason: reason || 'Khách hàng hủy đơn',
        cancelledBy: decoded.userId
      }
    )

    if (!updatedOrder) {
      return res.status(500).json({ message: 'Không thể hủy đơn hàng' })
    }

    // TODO: Send cancellation email
    // TODO: Refund if payment was made

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      order: updatedOrder
    })
  } catch (error: any) {
    console.error('Cancel order error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
