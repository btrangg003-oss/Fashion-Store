import type { NextApiRequest, NextApiResponse } from 'next';
import { readDatabase } from '@/services/database';
import { createPasswordReset } from '@/services/passwordResetService';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const database = await readDatabase();
    const user = database.users.find((u: any) => u.email === email);

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const token = createPasswordReset(email);
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
      
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng';

      // Send reset email
      await transporter.sendMail({
        from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '🔐 Đặt lại mật khẩu - Fashion Store',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Đặt lại mật khẩu</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Fashion Store</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Xin chào <strong style="color: #667eea;">${userName}</strong>,
                </p>
                
                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                  Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới:
                </p>
                
                <!-- Reset Button -->
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${resetUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    Đặt lại mật khẩu
                  </a>
                </div>
                
                <!-- Info Box -->
                <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                  <div style="color: #92400e; font-size: 14px; line-height: 1.6;">
                    <strong style="font-size: 15px;">⏱️ Lưu ý quan trọng:</strong><br>
                    • Link này có hiệu lực trong <strong>1 giờ</strong><br>
                    • Chỉ sử dụng được <strong>1 lần</strong><br>
                    • Không chia sẻ link này với bất kỳ ai
                  </div>
                </div>
                
                <!-- Alternative Link -->
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 25px 0;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 13px;">
                    Nếu nút không hoạt động, copy link sau vào trình duyệt:
                  </p>
                  <p style="margin: 0; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #3b82f6; font-size: 12px; text-decoration: none;">
                      ${resetUrl}
                    </a>
                  </p>
                </div>
                
                <!-- Security Notice -->
                <div style="background: #fee2e2; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ef4444;">
                  <div style="color: #991b1b; font-size: 14px; line-height: 1.6;">
                    <strong style="font-size: 15px;">🛡️ Không phải bạn?</strong><br>
                    Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.
                  </div>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                  Nếu cần hỗ trợ, liên hệ với chúng tôi:<br>
                  📧 Email: <a href="mailto:support@fashionstore.com" style="color: #3b82f6; text-decoration: none;">support@fashionstore.com</a><br>
                  📱 Hotline: <strong>1900-xxxx</strong>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                  © 2024 Fashion Store. Mọi quyền được bảo lưu.<br>
                  Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                </p>
                <div style="margin-top: 15px;">
                  <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 10px;">Chính sách</a>
                  <span style="color: #d1d5db;">|</span>
                  <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 10px;">Bảo mật</a>
                  <span style="color: #d1d5db;">|</span>
                  <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 10px;">Liên hệ</a>
                </div>
              </div>
              
            </div>
          </body>
          </html>
        `
      });
    }

    // Always return success
    return res.status(200).json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
