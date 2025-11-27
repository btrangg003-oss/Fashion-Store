// Email Marketing Service
import nodemailer from 'nodemailer';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Chào mừng khách hàng mới',
    subject: 'Chào mừng {{name}} đến với {{storeName}}!',
    body: `
      <h1>Xin chào {{name}}!</h1>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại {{storeName}}.</p>
      <p>Sử dụng mã giảm giá <strong>{{discountCode}}</strong> cho đơn hàng đầu tiên!</p>
    `,
    variables: ['name', 'storeName', 'discountCode']
  },
  {
    id: 'abandoned_cart',
    name: 'Giỏ hàng bỏ quên',
    subject: 'Bạn quên sản phẩm trong giỏ hàng rồi!',
    body: `
      <h1>Xin chào {{name}}!</h1>
      <p>Bạn còn {{itemCount}} sản phẩm trong giỏ hàng.</p>
      <p>Hoàn tất đơn hàng ngay để không bỏ lỡ!</p>
    `,
    variables: ['name', 'itemCount']
  },
  {
    id: 'promotion',
    name: 'Khuyến mãi đặc biệt',
    subject: '🎉 Giảm giá {{discount}}% - Chỉ hôm nay!',
    body: `
      <h1>Ưu đãi đặc biệt dành cho {{name}}!</h1>
      <p>Giảm ngay {{discount}}% cho tất cả sản phẩm.</p>
      <p>Mã: <strong>{{code}}</strong></p>
    `,
    variables: ['name', 'discount', 'code']
  }
];

export const sendBulkEmail = async (
  recipients: string[],
  template: EmailTemplate,
  variables: Record<string, string>
) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const results = [];
  
  for (const email of recipients) {
    try {
      let subject = template.subject;
      let body = template.body;
      
      // Replace variables
      Object.keys(variables).forEach(key => {
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
      });
      
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: body
      });
      
      results.push({ email, status: 'sent' });
    } catch (error) {
      results.push({ email, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  
  return results;
};

export const scheduleEmail = async (
  recipients: string[],
  template: EmailTemplate,
  variables: Record<string, string>,
  scheduledAt: Date
) => {
  // Store in database for cron job to process
  return {
    id: `email_${Date.now()}`,
    recipients,
    template,
    variables,
    scheduledAt,
    status: 'scheduled'
  };
};
