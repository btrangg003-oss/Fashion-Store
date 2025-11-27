import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../../lib/authMiddleware';

// Mock data - replace with database in production
const orders = [
  {
    id: 'ORD001',
    date: new Date().toISOString(),
    customer: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM'
    },
    items: [
      {
        name: 'Áo thun basic',
        quantity: 2,
        price: 299000
      }
    ],
    total: 598000,
    status: 'pending',
    paymentMethod: 'COD',
    shippingMethod: 'Express'
  }
];

async function updateOrder(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { status } = req.body;

    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    const currentStatus = orders[orderIndex].status;
    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status transition',
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Update order status
    orders[orderIndex] = {
      ...orders[orderIndex],
      status
    };

    // In production, you would also:
    // 1. Log the status change
    // 2. Send notifications to customer
    // 3. Update inventory if needed
    // 4. Handle any other business logic

    res.status(200).json(orders[orderIndex]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      return await updateOrder(req, res);
    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).json({ error: 'Method ' + req.method + ' Not Allowed' });
  }
}