import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllOrders } from '@/lib/ordersDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const orders = await getAllOrders();

    // Convert orders to payments
    const payments = orders.map(order => ({
      id: `pay_${order.id}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      method: order.paymentMethod || 'cod',
      status: order.paymentStatus === 'paid' ? 'completed' : 
              order.paymentStatus === 'failed' ? 'failed' : 'pending',
      transactionId: order.transactionId,
      customerName: order.shippingAddress?.fullName || 'N/A',
      customerEmail: 'N/A', // Email not in order, would need to fetch from user
      createdAt: order.createdAt,
      completedAt: order.paidAt
    }));

    // Calculate stats
    const stats = {
      total: payments.length,
      completed: payments.filter((p: any) => p.status === 'completed').length,
      pending: payments.filter((p: any) => p.status === 'pending').length,
      failed: payments.filter((p: any) => p.status === 'failed').length,
      refunded: payments.filter((p: any) => p.status === 'refunded').length,
      totalAmount: payments.reduce((sum: number, p: any) => sum + p.amount, 0),
      completedAmount: payments
        .filter((p: any) => p.status === 'completed')
        .reduce((sum: number, p: any) => sum + p.amount, 0),
      pendingAmount: payments
        .filter((p: any) => p.status === 'pending')
        .reduce((sum: number, p: any) => sum + p.amount, 0),
      failedAmount: payments
        .filter((p: any) => p.status === 'failed')
        .reduce((sum: number, p: any) => sum + p.amount, 0)
    };

    res.status(200).json({ payments, stats });
  } catch (error) {
    console.error('Payments API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
