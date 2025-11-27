import type { NextApiRequest, NextApiResponse } from 'next';
import SunoVietQRService from '@/lib/sunoVietQRService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/vietqr/webhook`;
    const accountNumber = process.env.BANK_ACCOUNT || '1057925369';
    const apiKey = process.env.SUNO_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'SUNO_API_KEY not configured',
        message: 'Vui lòng thêm SUNO_API_KEY vào file .env.local',
        instructions: [
          '1. Đăng ký tài khoản tại https://suno.vn',
          '2. Lấy API key từ dashboard',
          '3. Thêm vào .env.local: SUNO_API_KEY=your_key_here',
          '4. Restart dev server'
        ]
      });
    }

    const sunoService = new SunoVietQRService({
      url: webhookUrl,
      accountNumber,
      apiKey
    });

    // Đăng ký webhook
    const result = await sunoService.registerWebhook();

    return res.status(200).json({
      success: true,
      message: 'Webhook registered successfully',
      webhookUrl,
      accountNumber,
      result
    });

  } catch (error: any) {
    console.error('Error setting up webhook:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Lỗi khi đăng ký webhook. Kiểm tra API key và thử lại.'
    });
  }
}
