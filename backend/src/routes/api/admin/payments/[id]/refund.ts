import type { NextApiRequest, NextApiResponse } from 'next';
import { updateOrder } from '@/services/ordersDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const orderId = (id as string).replace('pay_', '');

    // Update order payment status to failed (as refunded)
    const updated = await updateOrder(orderId, {
      paymentStatus: 'failed',
      status: 'cancelled',
      paymentFailureReason: 'Refunded by admin'
    });

    if (!updated) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // TODO: Process actual refund with payment gateway
    // For now, just update the status

    res.status(200).json({ 
      message: 'Payment refunded successfully',
      payment: updated 
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
