import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import { getAllOrders, updateOrder } from '../../../lib/ordersDatabase'
// import { sendOrderStatusEmail } from '../../../lib/emailService'

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
      const orders = await getAllOrders();
      
      // Fulfillment queue - orders that need processing
      const pendingOrders = orders.filter(o => o.status === 'pending');
      const processingOrders = orders.filter(o => o.status === 'processing');
      const shippingOrders = orders.filter(o => o.status === 'shipping');
      
      // Priority orders (high value or VIP customers)
      const priorityOrders = orders.filter(o => 
        (o.status === 'pending' || o.status === 'processing') && 
        (o.total > 2000000 || o.notes?.includes('VIP'))
      );

      // Overdue orders (pending > 24h, processing > 48h)
      const now = new Date();
      const overdueOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        
        return (o.status === 'pending' && hoursDiff > 24) ||
               (o.status === 'processing' && hoursDiff > 48);
      });

      return res.status(200).json({
        success: true,
        data: {
          queue: {
            pending: pendingOrders,
            processing: processingOrders,
            shipping: shippingOrders,
            priority: priorityOrders,
            overdue: overdueOrders
          },
          stats: {
            totalPending: pendingOrders.length,
            totalProcessing: processingOrders.length,
            totalShipping: shippingOrders.length,
            priorityCount: priorityOrders.length,
            overdueCount: overdueOrders.length
          }
        }
      });
    }

    if (req.method === 'PUT') {
      const { orderId, status, trackingNumber, notes } = req.body;
      
      if (!orderId || !status) {
        return res.status(400).json({ error: 'Order ID and status are required' });
      }

      const updateData: any = {
        status,
        updatedAt: new Date().toISOString()
      };

      if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
      }

      if (notes) {
        updateData.notes = notes;
      }

      if (status === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }

      const updatedOrder = await updateOrder(orderId, updateData);

      // Send email notification
      try {
        // Skip email for now - can be implemented later
        // await sendOrderStatusEmail(updatedOrder.shippingAddress?.email || '', status, updatedOrder);
      } catch (emailError) {
        console.error('Failed to send status email:', emailError);
      }

      return res.status(200).json({
        success: true,
        data: updatedOrder,
        message: 'Order status updated successfully'
      });
    }

    if (req.method === 'POST') {
      const { action, orderIds } = req.body;
      
      if (!action || !orderIds || !Array.isArray(orderIds)) {
        return res.status(400).json({ error: 'Action and order IDs are required' });
      }

      const results = [];
      
      for (const orderId of orderIds) {
        try {
          let updateData: any = { updatedAt: new Date().toISOString() };
          
          switch (action) {
            case 'confirm':
              updateData.status = 'confirmed';
              break;
            case 'process':
              updateData.status = 'processing';
              break;
            case 'ship':
              updateData.status = 'shipping';
              break;
            case 'deliver':
              updateData.status = 'delivered';
              updateData.deliveredAt = new Date().toISOString();
              break;
            default:
              throw new Error('Invalid action');
          }

          const updatedOrder = await updateOrder(orderId, updateData);
          results.push({ orderId, success: true, order: updatedOrder });

          // Send email notification
          try {
            // Skip email for now - can be implemented later
            // await sendOrderStatusEmail(updatedOrder.shippingAddress?.email || '', updateData.status, updatedOrder);
          } catch (emailError) {
            console.error(`Failed to send email for order ${orderId}:`, emailError);
          }
        } catch (error) {
          results.push({ 
            orderId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: results,
        message: `Bulk ${action} completed`
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Order fulfillment API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}