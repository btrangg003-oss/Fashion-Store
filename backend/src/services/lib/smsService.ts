// SMS Marketing Service
export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  maxLength: number;
}

export const SMS_TEMPLATES: SMSTemplate[] = [
  {
    id: 'order_confirm',
    name: 'Xác nhận đơn hàng',
    content: 'Don hang {{orderNumber}} da duoc xac nhan. Tong tien: {{total}}d. Cam on {{name}}!',
    variables: ['orderNumber', 'total', 'name'],
    maxLength: 160
  },
  {
    id: 'shipping',
    name: 'Thông báo giao hàng',
    content: 'Don hang {{orderNumber}} dang tren duong giao den ban. Ma van don: {{trackingCode}}',
    variables: ['orderNumber', 'trackingCode'],
    maxLength: 160
  },
  {
    id: 'promotion',
    name: 'Khuyến mãi',
    content: 'FLASH SALE! Giam {{discount}}% cho tat ca san pham. Ma: {{code}}. Het han: {{expiry}}',
    variables: ['discount', 'code', 'expiry'],
    maxLength: 160
  },
  {
    id: 'birthday',
    name: 'Sinh nhật',
    content: 'Chuc mung sinh nhat {{name}}! Tang ban ma giam gia {{code}} tri gia {{value}}d',
    variables: ['name', 'code', 'value'],
    maxLength: 160
  }
];

export const sendSMS = async (
  phone: string,
  template: SMSTemplate,
  variables: Record<string, string>
): Promise<{ success: boolean; message?: string }> => {
  try {
    let content = template.content;
    
    // Replace variables
    Object.keys(variables).forEach(key => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });
    
    // Check length
    if (content.length > template.maxLength) {
      return {
        success: false,
        message: `SMS quá dài (${content.length}/${template.maxLength} ký tự)`
      };
    }
    
    // TODO: Integrate with SMS provider (Twilio, Nexmo, etc.)
    console.log(`Sending SMS to ${phone}: ${content}`);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const sendBulkSMS = async (
  recipients: string[],
  template: SMSTemplate,
  variables: Record<string, string>
): Promise<{ sent: number; failed: number; results: any[] }> => {
  const results = [];
  let sent = 0;
  let failed = 0;
  
  for (const phone of recipients) {
    const result = await sendSMS(phone, template, variables);
    if (result.success) {
      sent++;
    } else {
      failed++;
    }
    results.push({ phone, ...result });
  }
  
  return { sent, failed, results };
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Vietnamese phone number format
  const regex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
  return regex.test(phone);
};
