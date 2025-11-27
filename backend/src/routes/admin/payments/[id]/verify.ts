import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getOrderById, updateOrder } from '@/services/ordersDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.query;
    const { transactionId, amount, note } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get order
    const order = await getOrderById(id as string);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Verify amount if provided
    if (amount && amount !== order.total) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }

    // Update order as paid
    const updatedOrder = await updateOrder(id as string, {
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      transactionId: transactionId || `TXN${Date.now()}`,
      status: 'confirmed',
      verificationNote: note || `Verified by admin ${decoded.email}`,
      updatedAt: new Date().toISOString()
    });

    console.log(`Payment verified for order ${id} by admin ${decoded.email}`);

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: id,
        orderNumber: order.orderNumber,
        transactionId: transactionId || `TXN${Date.now()}`,
        amount: order.total,
        verifiedBy: decoded.email,
        verifiedAt: new Date().toISOString(),
        order: updatedOrder
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
