import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Kiểm tra tất cả env variables
    const config = {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: process.env.MOMO_ENDPOINT,
    };

    // Kiểm tra từng key
    const status = {
      partnerCode: {
        exists: !!config.partnerCode,
        value: config.partnerCode ? `${config.partnerCode.substring(0, 4)}...` : 'MISSING',
        length: config.partnerCode?.length || 0
      },
      accessKey: {
        exists: !!config.accessKey,
        value: config.accessKey ? `${config.accessKey.substring(0, 4)}...` : 'MISSING',
        length: config.accessKey?.length || 0
      },
      secretKey: {
        exists: !!config.secretKey,
        value: config.secretKey ? `${config.secretKey.substring(0, 4)}...` : 'MISSING',
        length: config.secretKey?.length || 0
      },
      endpoint: {
        exists: !!config.endpoint,
        value: config.endpoint || 'MISSING'
      }
    };

    // Kiểm tra tất cả có đủ không
    const allConfigured = config.partnerCode && config.accessKey && config.secretKey && config.endpoint;

    return res.status(200).json({
      success: allConfigured,
      message: allConfigured 
        ? '✅ Tất cả MoMo config đã có' 
        : '❌ Thiếu một số MoMo config',
      status,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('MOMO')),
      nodeEnv: process.env.NODE_ENV
    });

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
