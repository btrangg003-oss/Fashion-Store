import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { getOrderById, updateOrder } from '../services/ordersDatabase'
import { paymentService } from '../services/paymentService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ error: 'Order ID and payment method are required' });
    }

    // Get order details
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify order belongs to user (unless admin)
    if (decoded.role !== 'admin' && order.userId !== decoded.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    let paymentResult;

    switch (paymentMethod) {
      case 'momo':
        paymentResult = await paymentService.createPayment('momo', {
          orderId: order.orderNumber,
          amount: order.total,
          orderInfo: `Thanh toan don hang ${order.orderNumber}`,
          customerName: order.shippingAddress?.fullName,
          customerPhone: order.shippingAddress?.phone
        });
        break;

      case 'bank_transfer':
        paymentResult = await paymentService.createPayment('bank_transfer', {
          orderId: order.orderNumber,
          amount: order.total,
          description: `Thanh toan don hang Fashion Store`
        });
        break;

      default:
        return res.status(400).json({ error: 'Unsupported payment method' });
    }

    if (!paymentResult.success) {
      return res.status(500).json({ 
        error: 'Payment creation failed',
        message: paymentResult.message 
      });
    }

    // Update order with payment info
    await updateOrder(orderId, {
      paymentMethod,
      paymentStatus: 'pending',
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.orderNumber,
        amount: order.total,
        paymentMethod,
        ...paymentResult
      }
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}