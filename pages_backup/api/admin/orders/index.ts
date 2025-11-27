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
      },
      {
        name: 'Quần jean slim fit',
        quantity: 1,
        price: 599000
      }
    ],
    total: 1197000,
    status: 'pending',
    paymentMethod: 'COD',
    shippingMethod: 'Express'
  },
  {
    id: 'ORD002',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    customer: {
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0909876543',
      address: '456 Lê Lợi, Quận 5, TP.HCM'
    },
    items: [
      {
        name: 'Áo sơ mi trắng',
        quantity: 1,
        price: 450000
      }
    ],
    total: 450000,
    status: 'processing',
    paymentMethod: 'Banking',
    shippingMethod: 'Standard'
  }
];

async function getOrders(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status } = req.query;
    
    let filteredOrders = orders;
    if (status && status !== 'all') {
      filteredOrders = orders.filter(order => order.status === status);
    }
    
    res.status(200).json(filteredOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return await getOrders(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ error: 'Method ' + req.method + ' Not Allowed' });
  }
}