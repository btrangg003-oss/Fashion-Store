import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Lấy config từ env
    const partnerCode = process.env.MOMO_PARTNER_CODE;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const endpoint = process.env.MOMO_ENDPOINT;

    // Kiểm tra config
    if (!partnerCode || !accessKey || !secretKey || !endpoint) {
      return res.status(500).json({
        success: false,
        error: 'MoMo configuration missing',
        config: {
          partnerCode: !!partnerCode,
          accessKey: !!accessKey,
          secretKey: !!secretKey,
          endpoint: !!endpoint
        }
      });
    }

    // Tạo test payment request
    const orderId = 'TEST_' + Date.now();
    const requestId = orderId;
    const amount = '10000'; // 10,000 VND
    const orderInfo = 'Test MoMo Payment';
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`;
    const ipnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/momo/callback`;
    const requestType = 'captureWallet';
    const extraData = '';

    // Tạo raw signature
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    // Tạo signature
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    // Request body
    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      signature,
      lang: 'vi'
    };

    console.log('🧪 Testing MoMo API...');
    console.log('Endpoint:', endpoint);
    console.log('Request:', JSON.stringify(requestBody, null, 2));

    // Call MoMo API
    const momoResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const momoData = await momoResponse.json();

    console.log('MoMo Response:', JSON.stringify(momoData, null, 2));

    // Kiểm tra response
    if (momoData.resultCode === 0) {
      return res.status(200).json({
        success: true,
        message: '✅ MoMo API hoạt động!',
        data: {
          payUrl: momoData.payUrl,
          deeplink: momoData.deeplink,
          qrCodeUrl: momoData.qrCodeUrl,
          orderId: orderId,
          amount: amount
        },
        fullResponse: momoData
      });
    } else {
      return res.status(400).json({
        success: false,
        message: '❌ MoMo API trả về lỗi',
        error: {
          resultCode: momoData.resultCode,
          message: momoData.message,
          localMessage: momoData.localMessage
        },
        fullResponse: momoData
      });
    }

  } catch (error: any) {
    console.error('Error testing MoMo:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
