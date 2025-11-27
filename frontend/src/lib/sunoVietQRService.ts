// Suno VietQR Service
// Docs: https://suno.vn/docs/vietqr

interface SunoWebhookConfig {
  url: string;
  accountNumber: string;
  apiKey?: string;
}

export class SunoVietQRService {
  private webhookUrl: string;
  private accountNumber: string;
  private apiKey: string;

  constructor(config: SunoWebhookConfig) {
    this.webhookUrl = config.url;
    this.accountNumber = config.accountNumber;
    this.apiKey = config.apiKey || process.env.SUNO_API_KEY || '';
  }

  /**
   * Đăng ký webhook với Suno
   */
  async registerWebhook() {
    try {
      // Suno API endpoint (giả định, cần check docs thực tế)
      const response = await fetch('https://api.suno.vn/v1/webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          url: this.webhookUrl,
          accountNumber: this.accountNumber,
          events: ['transaction.created']
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra trạng thái webhook
   */
  async checkWebhookStatus() {
    try {
      const response = await fetch('https://api.suno.vn/v1/webhooks', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking webhook:', error);
      throw error;
    }
  }

  /**
   * Xác thực webhook signature (nếu Suno cung cấp)
   */
  verifyWebhookSignature(payload: unknown, signature: string, secret: string): boolean {
    import crypto from "crypto";
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Parse transaction content để lấy order ID
   */
  static parseOrderId(content: string): string | null {
    // Format: "FASHIONSTORE ORDER123" hoặc "ORDER123" hoặc "FS123456"
    const patterns = [
      /ORDER[A-Z0-9]+/i,
      /FS[0-9]+/i,
      /DH[0-9]+/i, // Đơn hàng
      /#([A-Z0-9]+)/i // #ORDER123
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].toUpperCase();
      }
    }

    return null;
  }

  /**
   * Format content cho VietQR
   */
  static formatTransactionContent(orderId: string, customerName?: string): string {
    // Format: "FASHIONSTORE ORDER123"
    // Giới hạn 35 ký tự cho VietQR
    const content = `FASHIONSTORE ${orderId}`;
    return content.substring(0, 35).toUpperCase();
  }
}

export default SunoVietQRService;
