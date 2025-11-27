import { NextApiRequest, NextApiResponse } from 'next'
import { getOrderByOrderNumber, updateOrder } from '../../../../lib/ordersDatabase'
import { paymentService } from '../../../../lib/paymentService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const callbackData = req.body;
    
    console.log('MoMo callback received:', callbackData);

    // Verify callback signature
    const isValid = paymentService.verifyPayment('momo', callbackData);
    
    if (!isValid) {
      console.error('Invalid MoMo callback signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const { orderId, resultCode, message, transId, amount } = callbackData;

    // Find order by order number
    const order = await getOrderByOrderNumber(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order based on payment result
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (resultCode === 0) {
      // Payment successful
      updateData.paymentStatus = 'paid';
      updateData.paidAt = new Date().toISOString();
      updateData.transactionId = transId;
      updateData.status = 'confirmed'; // Auto-confirm paid orders
      
      console.log(`MoMo payment successful for order ${orderId}`);
    } else {
      // Payment failed
      updateData.paymentStatus = 'failed';
      updateData.paymentFailureReason = message;
      
      console.log(`MoMo payment failed for order ${orderId}: ${message}`);
    }

    await updateOrder(order.id, updateData);

    // Send success response to MoMo
    return res.status(200).json({
      partnerCode: callbackData.partnerCode,
      orderId: orderId,
      requestId: callbackData.requestId,
      amount: amount,
      orderInfo: callbackData.orderInfo,
      orderType: callbackData.orderType,
      transId: transId,
      resultCode: 0, // Always return success to MoMo
      message: 'Callback processed successfully',
      payType: callbackData.payType,
      responseTime: Date.now(),
      extraData: callbackData.extraData,
      signature: callbackData.signature
    });

  } catch (error) {
    console.error('MoMo callback processing error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}