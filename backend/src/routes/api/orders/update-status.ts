import { NextApiRequest, NextApiResponse } from 'next'
import { updateOrderStatus, getOrderById } from '../services/ordersDatabase'
import { verifyToken } from '../services/auth'
import { Order } from '../models/orders'
import { findUserById } from '../services/database'
import { queueOrderStatusEmail } from '../services/emailQueue'

interface UpdateStatusRequest {
  orderId: string
  status: Order['status']
  paymentStatus?: Order['paymentStatus']
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT'])
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

    const { orderId, status, paymentStatus }: UpdateStatusRequest = req.body

    // Validate required fields
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and status are required'
      })
    }

    // Prepare additional data based on status
    const additionalData: Partial<Order> = {}
    
    if (status === 'delivered') {
      additionalData.deliveredAt = new Date().toISOString()
      additionalData.paymentStatus = 'paid' // Mark as paid when delivered
    }
    
    if (status === 'cancelled') {
      additionalData.cancelledAt = new Date().toISOString()
    }
    
    if (paymentStatus) {
      additionalData.paymentStatus = paymentStatus
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(orderId, payload.userId, status, additionalData)

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or access denied'
      })
    }

    console.log(`Order ${orderId} status updated to ${status} for user ${payload.userId}`)

    // Queue status update email to user
    try {
      const user = await findUserById(payload.userId)
      if (user && updatedOrder) {
        await queueOrderStatusEmail({
          email: user.email,
          firstName: user.firstName,
          orderNumber: updatedOrder.orderNumber,
          status
        })
      }
    } catch (e) {
      console.error('Failed to queue order status email:', e)
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order: updatedOrder
      }
    })

  } catch (error) {
    console.error('Update order status error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}