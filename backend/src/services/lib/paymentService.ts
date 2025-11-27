import crypto from 'crypto';

// MoMo Payment Configuration
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/momo/callback',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3000/api/payment/momo/ipn'
};

// VietQR Bank Configuration
const VIETQR_CONFIG = {
  clientId: process.env.VIETQR_CLIENT_ID || 'your_client_id',
  apiKey: process.env.VIETQR_API_KEY || 'your_api_key',
  endpoint: 'https://api.vietqr.io/v2/generate',
  bankId: process.env.BANK_ID || '970436', // Vietcombank
  accountNo: process.env.BANK_ACCOUNT || '1057925369',
  accountName: process.env.BANK_ACCOUNT_NAME || 'FASHION STORE'
};

// MoMo Payment Interface
export interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface MoMoPaymentResponse {
  success: boolean;
  payUrl?: string;
  qrCodeUrl?: string;
  deeplink?: string;
  message?: string;
  transactionId?: string;
}

// Bank Transfer Interface
export interface BankTransferRequest {
  orderId: string;
  amount: number;
  description: string;
}

export interface BankTransferResponse {
  success: boolean;
  qrCode?: string;
  bankInfo?: {
    bankName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    description: string;
  };
  message?: string;
}

// MoMo Payment Service
export class MoMoPaymentService {
  private generateSignature(rawData: string): string {
    return crypto
      .createHmac('sha256', MOMO_CONFIG.secretKey)
      .update(rawData)
      .digest('hex');
  }

  async createPayment(request: MoMoPaymentRequest): Promise<MoMoPaymentResponse> {
    try {
      const {
        partnerCode,
        accessKey,
        endpoint,
        redirectUrl,
        ipnUrl
      } = MOMO_CONFIG;

      const requestId = `${request.orderId}_${Date.now()}`;
      const extraData = '';
      const orderGroupId = '';
      const autoCapture = true;
      const lang = 'vi';

      // Create raw signature string
      const rawSignature = `accessKey=${accessKey}&amount=${request.amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${request.orderId}&orderInfo=${request.orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=payWithMethod`;
      
      const signature = this.generateSignature(rawSignature);

      const requestBody = {
        partnerCode,
        partnerName: 'Fashion Store',
        storeId: 'FashionStore',
        requestId,
        amount: request.amount,
        orderId: request.orderId,
        orderInfo: request.orderInfo,
        redirectUrl,
        ipnUrl,
        lang,
        requestType: 'payWithMethod',
        autoCapture,
        extraData,
        orderGroupId,
        signature
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.resultCode === 0) {
        return {
          success: true,
          payUrl: result.payUrl,
          qrCodeUrl: result.qrCodeUrl,
          deeplink: result.deeplink,
          transactionId: requestId
        };
      } else {
        return {
          success: false,
          message: result.message || 'MoMo payment creation failed'
        };
      }
    } catch (error) {
      console.error('MoMo payment error:', error);
      return {
        success: false,
        message: 'Failed to create MoMo payment'
      };
    }
  }

  verifyCallback(callbackData: any): boolean {
    try {
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature
      } = callbackData;

      const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      
      const expectedSignature = this.generateSignature(rawSignature);
      
      return signature === expectedSignature && resultCode === 0;
    } catch (error) {
      console.error('MoMo callback verification error:', error);
      return false;
    }
  }
}

// Bank Transfer Service
export class BankTransferService {
  async generateQRCode(request: BankTransferRequest): Promise<BankTransferResponse> {
    try {
      const {
        endpoint,
        bankId,
        accountNo,
        accountName
      } = VIETQR_CONFIG;

      const qrData = {
        accountNo,
        accountName,
        acqId: bankId,
        amount: request.amount,
        addInfo: `${request.description} - Ma don hang: ${request.orderId}`,
        format: 'text',
        template: 'compact'
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-client-id': VIETQR_CONFIG.clientId,
          'x-api-key': VIETQR_CONFIG.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(qrData)
      });

      const result = await response.json();

      if (result.code === '00') {
        return {
          success: true,
          qrCode: result.data.qrDataURL,
          bankInfo: {
            bankName: 'Vietcombank',
            accountNo,
            accountName,
            amount: request.amount,
            description: `${request.description} - Ma don hang: ${request.orderId}`
          }
        };
      } else {
        // Fallback: Generate manual bank info without QR
        return {
          success: true,
          bankInfo: {
            bankName: 'Vietcombank',
            accountNo,
            accountName,
            amount: request.amount,
            description: `${request.description} - Ma don hang: ${request.orderId}`
          },
          message: 'QR code generation failed, showing manual bank info'
        };
      }
    } catch (error) {
      console.error('Bank transfer QR generation error:', error);
      
      // Fallback: Return manual bank info
      return {
        success: true,
        bankInfo: {
          bankName: 'Vietcombank',
          accountNo: VIETQR_CONFIG.accountNo,
          accountName: VIETQR_CONFIG.accountName,
          amount: request.amount,
          description: `${request.description} - Ma don hang: ${request.orderId}`
        },
        message: 'Using manual bank transfer info'
      };
    }
  }

  async verifyBankTransfer(orderId: string, amount: number, transactionId: string): Promise<boolean> {
    try {
      // In production, integrate with bank API to verify transaction
      // For now, return true for demo purposes
      
      // Example integration with bank webhook/API:
      // const bankResponse = await fetch(`${BANK_API_ENDPOINT}/verify`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${BANK_API_TOKEN}` },
      //   body: JSON.stringify({ orderId, amount, transactionId })
      // });
      
      // const result = await bankResponse.json();
      // return result.success && result.amount === amount;
      
      console.log(`Verifying bank transfer: Order ${orderId}, Amount ${amount}, Transaction ${transactionId}`);
      return true; // Demo mode
    } catch (error) {
      console.error('Bank transfer verification error:', error);
      return false;
    }
  }
}

// Payment Factory
export class PaymentService {
  private momoService = new MoMoPaymentService();
  private bankService = new BankTransferService();

  async createPayment(method: 'momo' | 'bank_transfer', request: any) {
    switch (method) {
      case 'momo':
        return this.momoService.createPayment(request);
      case 'bank_transfer':
        return this.bankService.generateQRCode(request);
      default:
        throw new Error('Unsupported payment method');
    }
  }

  async verifyPayment(method: 'momo' | 'bank_transfer', data: any) {
    switch (method) {
      case 'momo':
        return this.momoService.verifyCallback(data);
      case 'bank_transfer':
        return this.bankService.verifyBankTransfer(data.orderId, data.amount, data.transactionId);
      default:
        return false;
    }
  }
}

export const paymentService = new PaymentService();