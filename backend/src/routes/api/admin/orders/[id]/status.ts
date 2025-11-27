import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../../lib/auth'
import {
  processOrderStatusChange,
  getAvailableTransitions,
  OrderStatus
} from '../../../../../lib/orderWorkflow'

type UserRole = 'admin' | 'staff' | 'system';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Authentication check - support both 'token' and 'auth-token' cookie names
    const token = req.cookies.token || req.cookies['auth-token'];
    
    console.log('� A uth Debug:', {
      hasToken: !!token,
      tokenLength: token?.length,
      availableCookies: Object.keys(req.cookies),
      cookieValues: Object.keys(req.cookies).reduce((acc, key) => {
        acc[key] = req.cookies[key]?.substring(0, 20) + '...';
        return acc;
      }, {} as Record<string, string>)
    });
    
    if (!token) {
      console.error('❌ No token found in cookies');
      return res.status(401).json({ 
        error: 'Unauthorized - No token provided',
        debug: {
          availableCookies: Object.keys(req.cookies),
          message: 'Please login again'
        }
      })
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      console.error('❌ Token verification failed');
      return res.status(401).json({ error: 'Unauthorized - Invalid token' })
    }

    console.log('✅ Token verified:', { userId: decoded.id, role: decoded.role, email: decoded.email });

    if (decoded.role !== 'admin' && decoded.role !== 'staff') {
      console.error('❌ Insufficient permissions:', decoded.role);
      return res.status(403).json({ error: 'Forbidden - Admin or staff access required' })
    }

    // Type-safe decoded user
    const user: {
      id: string;
      role: UserRole;
      email: string;
    } = {
      id: decoded.id || decoded.userId,
      role: decoded.role as UserRole,
      email: decoded.email
    };

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    if (req.method === 'GET') {
      // Get available status transitions for this order
      const { currentStatus } = req.query;

      if (!currentStatus) {
        return res.status(400).json({ error: 'Current status is required' });
      }

      const availableTransitions = getAvailableTransitions(
        currentStatus as OrderStatus,
        user.role
      );

      return res.status(200).json({
        success: true,
        data: availableTransitions
      });
    }

    if (req.method === 'PUT') {
      const { status, note, notes, trackingNumber } = req.body;
      const statusNote = note || notes; // Support both 'note' and 'notes'

      if (!status) {
        return res.status(400).json({ error: 'New status is required' });
      }

      console.log('📝 Updating order status:', { id, status, note: statusNote });

      const result = await processOrderStatusChange(
        id,
        status as OrderStatus,
        '', // Admin doesn't need userId for order lookup
        user.role,
        statusNote,
        trackingNumber
      );

      if (!result.success) {
        return res.status(400).json({
          error: result.message
        });
      }

      // Send email notification to customer
      // ✅ Ưu tiên customerEmail (từ form checkout) trước userEmail (tài khoản)
      const customerEmail = result.order?.customerEmail || 
                           result.order?.userEmail || 
                           result.order?.shippingAddress?.email;
      
      if (result.order && customerEmail) {
        try {
          const { queueOrderStatusEmailDetailed } = await import('../../../../../lib/emailQueue');
          
          // ✅ Gửi email chi tiết với thông tin đầy đủ
          const orderData = result.order as any
          await queueOrderStatusEmailDetailed({
            email: customerEmail,
            firstName: orderData.shippingAddress?.fullName?.split(' ')[0] || 'Khách hàng',
            orderNumber: orderData.orderNumber,
            status: status as string,
            note: statusNote,
            trackingNumber: trackingNumber,
            // Thêm thông tin chi tiết đầy đủ
            total: orderData.total,
            subtotal: orderData.subtotal || orderData.total,
            discount: orderData.discount || 0,
            shipping: orderData.shipping || 0,
            items: orderData.items || [],
            shippingAddress: orderData.shippingAddress,
            shippingMethod: orderData.shippingMethod || 'Giao hàng tiêu chuẩn',
            paymentMethod: orderData.paymentMethod
          });
          console.log(`✅ Detailed status update email queued for ${customerEmail}`);
        } catch (emailError) {
          console.error('❌ Failed to queue status email:', emailError);
          // Don't fail the request if email fails
        }
      } else {
        console.warn('⚠️  No customer email found for order:', id);
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.order
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Order status API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}