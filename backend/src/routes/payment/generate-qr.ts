import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate QR code URL based on payment method
    let qrCode = '';
    
    if (paymentMethod === 'momo') {
      // MoMo QR format
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=momo://app?action=payment&orderId=${orderId}&amount=${amount}`;
    } else if (paymentMethod === 'vnpay') {
      // VNPay QR format
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=vnpay://app?action=payment&orderId=${orderId}&amount=${amount}`;
    } else {
      // Generic QR code
      qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${orderId}`;
    }

    return res.status(200).json({
      success: true,
      qrCode,
      orderId,
      amount,
      paymentMethod
    });

  } catch (error) {
    console.error('Generate QR error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
