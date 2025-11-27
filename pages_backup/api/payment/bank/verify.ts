import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { getAllOrders, updateOrder } from '../../../../lib/ordersDatabase'
import { paymentService } from '../../../../lib/paymentService'

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
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { orderId, transactionId, amount, verificationNote } = req.body;

    if (!orderId || !transactionId) {
      return res.status(400).json({ error: 'Order ID and transaction ID are required' });
    }

    // Find order by order number or ID
    const orders = await getAllOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify payment amount matches
    if (amount && amount !== order.total) {
      return res.status(400).json({ error: 'Payment amount does not match order total' });
    }

    // In production, verify with bank API
    const isVerified = await paymentService.verifyPayment('bank_transfer', {
      orderId,
      amount: order.total,
      transactionId
    });

    if (!isVerified) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Update order as paid
    await updateOrder(order.id, {
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      transactionId,
      status: 'confirmed', // Auto-confirm paid orders
      verificationNote: verificationNote || `Verified by admin ${decoded.email}`,
      updatedAt: new Date().toISOString()
    });

    console.log(`Bank transfer verified for order ${orderId} by admin ${decoded.email}`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId,
        transactionId,
        amount: order.total,
        verifiedBy: decoded.email,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Bank payment verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}