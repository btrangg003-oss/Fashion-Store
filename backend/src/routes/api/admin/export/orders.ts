import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { getAllOrders } from '../../../../lib/ordersDatabase'
import { 
  exportOrdersToCSV, 
  generateExportFilename, 
  createDownloadResponse 
} from '../../../../lib/exportService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    if (req.method === 'GET') {
      const { format = 'csv', ids } = req.query;

      let orders;
      if (ids && typeof ids === 'string') {
        const orderIds = ids.split(',');
        const allOrders = await getAllOrders();
        orders = allOrders.filter(order => orderIds.includes(order.id));
      } else {
        orders = await getAllOrders();
      }

      if (orders.length === 0) {
        return res.status(404).json({ error: 'No orders found' });
      }

      const content = exportOrdersToCSV(orders);
      const filename = generateExportFilename('orders', 'csv');
      const downloadResponse = createDownloadResponse(content, filename, 'text/csv; charset=utf-8');
      
      Object.entries(downloadResponse.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      const BOM = '\uFEFF';
      return res.status(200).send(BOM + downloadResponse.content);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Export orders API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}