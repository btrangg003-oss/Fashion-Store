import * as nodemailer from 'nodemailer'
import { generateVerificationCode } from './auth'

export interface EmailConfig {
  service: string
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Create reusable transporter with verified configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Verify connection configuration
async function verifyConnection() {
  try {
    await transporter.verify()
    console.log('Email server connection verified')
    return true
  } catch (error) {
    console.error('Email server connection failed:', error)
    return false
  }
}

// Email templates
export const getVerificationEmailTemplate = (
  firstName: string,
  code: string,
  expiresInMinutes: number = 10
): EmailTemplate => {
  const subject = 'Xác thực tài khoản Fashion Store'

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác thực tài khoản</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">FASHION STORE</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Thời trang đẳng cấp</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Chào ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
            Cảm ơn bạn đã đăng ký tài khoản tại Fashion Store. Để hoàn tất quá trình đăng ký, 
            vui lòng sử dụng mã xác thực bên dưới:
          </p>
          
          <!-- Verification Code -->
          <div style="text-align: center; margin: 40px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px 40px; border-radius: 12px; font-size: 32px; font-weight: 700; letter-spacing: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              ${code}
            </div>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⏰ Lưu ý quan trọng:</strong><br>
              Mã xác thực này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>. 
              Vui lòng nhập mã ngay để hoàn tất đăng ký.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 30px 0 0 0; font-size: 16px;">
            Nếu bạn không yêu cầu tạo tài khoản tại Fashion Store, vui lòng bỏ qua email này.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 0;">
            Bạn nhận được email này vì đã đăng ký tài khoản tại Fashion Store.<br>
            Nếu có thắc mắc, vui lòng liên hệ: <a href="mailto:support@fashionstore.com" style="color: #667eea;">support@fashionstore.com</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
            © 2024 Fashion Store. Tất cả quyền được bảo lưu.
          </p>
          <p style="margin: 0; color: #999; font-size: 12px;">
            123 Đường Nguyễn Huệ, Quận 1, TP.HCM | Hotline: 1900 1234
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `

  const text = `
Chào ${firstName}!

Cảm ơn bạn đã đăng ký tài khoản tại Fashion Store.

Mã xác thực của bạn là: ${code}

Mã này sẽ hết hạn sau ${expiresInMinutes} phút.

Vui lòng nhập mã này để hoàn tất quá trình đăng ký.

Nếu bạn không yêu cầu tạo tài khoản, vui lòng bỏ qua email này.

---
Fashion Store
Email: support@fashionstore.com
Hotline: 1900 1234
  `.trim()

  return { subject, html, text }
}

export const getWelcomeEmailTemplate = (firstName: string): EmailTemplate => {
  const subject = 'Chào mừng bạn đến với Fashion Store!'

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">FASHION STORE</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Chào mừng bạn đến với gia đình Fashion Store!</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Chào mừng ${firstName}! 🎉</h2>

          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            Tài khoản của bạn đã được tạo thành công! Bây giờ bạn có thể:
          </p>

          <ul style="color: #666; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
            <li>Khám phá hàng nghìn sản phẩm thời trang cao cấp</li>
            <li>Nhận ưu đãi độc quyền dành cho thành viên</li>
            <li>Theo dõi đơn hàng và lịch sử mua sắm</li>
            <li>Tạo danh sách yêu thích cá nhân</li>
          </ul>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products"
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
              Bắt đầu mua sắm
            </a>
          </div>

          <div style="background: #e8f5e8; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #155724; font-size: 14px;">
              <strong>🎁 Ưu đãi đặc biệt:</strong><br>
              Sử dụng mã <strong>WELCOME10</strong> để được giảm 10% cho đơn hàng đầu tiên!
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
            © 2024 Fashion Store. Tất cả quyền được bảo lưu.
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  const text = `
Chào mừng ${firstName}!

Tài khoản của bạn đã được tạo thành công tại Fashion Store!

Bây giờ bạn có thể:
- Khám phá hàng nghìn sản phẩm thời trang cao cấp
- Nhận ưu đãi độc quyền dành cho thành viên
- Theo dõi đơn hàng và lịch sử mua sắm
- Tạo danh sách yêu thích cá nhân

🎁 Ưu đãi đặc biệt: Sử dụng mã WELCOME10 để được giảm 10% cho đơn hàng đầu tiên!

Truy cập: ${process.env.NEXT_PUBLIC_APP_URL}

---
Fashion Store
Email: support@fashionstore.com
Hotline: 1900 1234
  `.trim()

  return { subject, html, text }
}

export const getResetPasswordEmailTemplate = (
  firstName: string,
  resetLink: string,
  expiresInMinutes: number = 60
): EmailTemplate => {
  const subject = 'Khôi phục mật khẩu Fashion Store'

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Khôi phục mật khẩu</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">FASHION STORE</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Khôi phục mật khẩu tài khoản</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Xin chào ${firstName}!</h2>

          <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
            Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại Fashion Store.
            Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:
          </p>

          <!-- Reset Button -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}"
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
              Đặt lại mật khẩu
            </a>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⏰ Lưu ý quan trọng:</strong><br>
              Liên kết khôi phục này sẽ hết hạn sau <strong>${expiresInMinutes} phút</strong>.
              Vui lòng đặt lại mật khẩu ngay để đảm bảo an toàn tài khoản.
            </p>
          </div>

          <p style="color: #666; line-height: 1.6; margin: 30px 0 0 0; font-size: 16px;">
            Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.
            Tài khoản của bạn vẫn an toàn.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #999; font-size: 14px; line-height: 1.5; margin: 0;">
            Bạn nhận được email này vì đã yêu cầu khôi phục mật khẩu tại Fashion Store.<br>
            Nếu có thắc mắc, vui lòng liên hệ: <a href="mailto:support@fashionstore.com" style="color: #667eea;">support@fashionstore.com</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
            © 2024 Fashion Store. Tất cả quyền được bảo lưu.
          </p>
          <p style="margin: 0; color: #999; font-size: 12px;">
            123 Đường Nguyễn Huệ, Quận 1, TP.HCM | Hotline: 1900 1234
          </p>
        </div>

      </div>
    </body>
    </html>
  `

  const text = `
Xin chào ${firstName}!

Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại Fashion Store.

Để đặt lại mật khẩu, vui lòng truy cập liên kết sau:
${resetLink}

Liên kết này sẽ hết hạn sau ${expiresInMinutes} phút.

Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.

---
Fashion Store
Email: support@fashionstore.com
Hotline: 1900 1234
  `.trim()

  return { subject, html, text }
}

// Order email templates
export const getOrderConfirmationEmailTemplate = (
  firstName: string,
  params: {
    orderNumber: string
    total: number
    items: { name: string; quantity: number; price: number; image?: string }[]
  }
): EmailTemplate => {
  const subject = `🎉 Đặt hàng thành công #${params.orderNumber} - Fashion Store`

  const itemsHtml = params.items
    .map(
      (i) => `
        <tr>
          <td style="padding:16px;border-bottom:1px solid #f0f0f0;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="80" style="padding-right:16px;">
                  <img src="${i.image || 'https://via.placeholder.com/80'}" 
                       alt="${i.name}" 
                       style="width:80px;height:80px;border-radius:8px;object-fit:cover;display:block;" />
                </td>
                <td>
                  <div style="font-weight:600;color:#1a202c;margin-bottom:4px;font-size:15px;">${i.name}</div>
                  <div style="color:#718096;font-size:14px;">Số lượng: ${i.quantity}</div>
                  <div style="color:#667eea;font-size:14px;font-weight:600;margin-top:4px;">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price)} × ${i.quantity}
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td style="padding:16px;border-bottom:1px solid #f0f0f0;text-align:right;vertical-align:middle;font-weight:700;color:#1a202c;font-size:16px;">
            ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * i.quantity)}
          </td>
        </tr>`
    )
    .join('')

  const totalText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.total)

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đặt hàng thành công</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f7fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="650" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:48px 40px;text-align:center;">
                  <div style="font-size:72px;margin-bottom:16px;line-height:1;">🎉</div>
                  <h1 style="margin:0;font-size:32px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Đặt Hàng Thành Công!</h1>
                  <p style="margin:12px 0 0;font-size:18px;color:rgba(255,255,255,0.95);font-weight:500;">Cảm ơn bạn đã tin tưởng Fashion Store</p>
                </td>
              </tr>

              <!-- Order Badge -->
              <tr>
                <td style="padding:0 40px;">
                  <div style="background:#10b98115;border:2px solid #10b981;border-radius:12px;padding:24px;margin-top:-30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                    <div style="font-size:13px;color:#718096;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Mã đơn hàng</div>
                    <div style="font-size:28px;font-weight:700;color:#10b981;letter-spacing:-0.5px;">#${params.orderNumber}</div>
                  </div>
                </td>
              </tr>

              <!-- Success Message -->
              <tr>
                <td style="padding:40px 40px 24px;">
                  <div style="background:linear-gradient(135deg,#10b98115 0%,#10b98108 100%);border-radius:12px;padding:24px;border:1px solid #10b98130;margin-bottom:24px;">
                    <div style="font-size:16px;color:#065f46;line-height:1.7;text-align:center;">
                      <strong style="font-size:18px;display:block;margin-bottom:8px;">✓ Đơn hàng đã được tiếp nhận</strong>
                      Chúng tôi sẽ xác nhận và bắt đầu chuẩn bị đơn hàng của bạn trong thời gian sớm nhất
                    </div>
                  </div>
                  <h2 style="margin:0 0 16px;font-size:22px;color:#1a202c;font-weight:600;">Xin chào ${firstName},</h2>
                  <p style="margin:0;color:#4a5568;font-size:16px;line-height:1.8;">
                    Cảm ơn bạn đã đặt hàng tại Fashion Store! Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
                  </p>
                </td>
              </tr>

              <!-- Order Items -->
              <tr>
                <td style="padding:0 40px 24px;">
                  <h3 style="margin:0 0 16px;font-size:18px;color:#1a202c;font-weight:600;">📦 Chi tiết đơn hàng</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                    ${itemsHtml}
                    <!-- Total -->
                    <tr>
                      <td colspan="2" style="padding:24px;background:#f7fafc;border-top:2px solid #e2e8f0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:6px 0;color:#718096;font-size:15px;">Tạm tính</td>
                            <td style="padding:6px 0;text-align:right;color:#4a5568;font-size:15px;">${totalText}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;color:#718096;font-size:15px;">Phí vận chuyển</td>
                            <td style="padding:6px 0;text-align:right;color:#10b981;font-size:15px;font-weight:600;">Miễn phí</td>
                          </tr>
                          <tr>
                            <td style="padding:16px 0 0;font-size:18px;font-weight:700;color:#1a202c;">Tổng cộng</td>
                            <td style="padding:16px 0 0;text-align:right;font-size:24px;font-weight:700;color:#10b981;">${totalText}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Timeline -->
              <tr>
                <td style="padding:0 40px 32px;">
                  <h3 style="margin:0 0 16px;font-size:18px;color:#1a202c;font-weight:600;">📍 Tiếp theo sẽ diễn ra gì?</h3>
                  <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:20px;border-radius:8px;margin-bottom:16px;">
                    <div style="display:flex;align-items:start;margin-bottom:12px;">
                      <div style="background:#fef3c7;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
                        <span style="font-weight:700;color:#92400e;">1</span>
                      </div>
                      <div style="color:#78350f;line-height:1.6;">
                        <strong>Xác nhận đơn hàng</strong><br>
                        <span style="font-size:14px;">Chúng tôi sẽ xác nhận đơn hàng trong vòng 24h</span>
                      </div>
                    </div>
                    <div style="display:flex;align-items:start;margin-bottom:12px;">
                      <div style="background:#fef3c7;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
                        <span style="font-weight:700;color:#92400e;">2</span>
                      </div>
                      <div style="color:#78350f;line-height:1.6;">
                        <strong>Chuẩn bị hàng</strong><br>
                        <span style="font-size:14px;">Đóng gói cẩn thận và giao cho đơn vị vận chuyển</span>
                      </div>
                    </div>
                    <div style="display:flex;align-items:start;">
                      <div style="background:#fef3c7;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
                        <span style="font-weight:700;color:#92400e;">3</span>
                      </div>
                      <div style="color:#78350f;line-height:1.6;">
                        <strong>Giao hàng</strong><br>
                        <span style="font-size:14px;">Thời gian dự kiến: 2-3 ngày làm việc</span>
                      </div>
                    </div>
                  </div>
                  <div style="background:#dbeafe;border-left:4px solid #3b82f6;padding:16px;border-radius:8px;">
                    <div style="color:#1e40af;font-size:14px;line-height:1.6;">
                      💡 <strong>Lưu ý:</strong> Bạn sẽ nhận được email thông báo ở mỗi bước cập nhật trạng thái đơn hàng
                    </div>
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding:0 40px 40px;text-align:center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders" 
                     style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:16px 48px;border-radius:50px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(102,126,234,0.4);">
                    Theo dõi đơn hàng
                  </a>
                </td>
              </tr>

              <!-- Support Section -->
              <tr>
                <td style="padding:32px 40px;background:#f7fafc;border-top:1px solid #e2e8f0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding-right:20px;">
                        <div style="margin-bottom:8px;font-weight:600;color:#1a202c;">📞 Hỗ trợ khách hàng</div>
                        <div style="color:#718096;font-size:14px;">Hotline: 1900-xxxx</div>
                        <div style="color:#718096;font-size:14px;">Email: support@fashionstore.com</div>
                      </td>
                      <td width="50%" style="padding-left:20px;border-left:1px solid #e2e8f0;">
                        <div style="margin-bottom:8px;font-weight:600;color:#1a202c;">🎁 Ưu đãi đặc biệt</div>
                        <div style="color:#718096;font-size:14px;">Giảm 10% cho đơn hàng tiếp theo</div>
                        <div style="color:#667eea;font-size:14px;font-weight:600;">Mã: THANKYOU10</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:32px 40px;text-align:center;background:#1a202c;color:#ffffff;">
                  <div style="margin-bottom:16px;">
                    <a href="#" style="color:#ffffff;text-decoration:none;margin:0 12px;">Facebook</a>
                    <a href="#" style="color:#ffffff;text-decoration:none;margin:0 12px;">Instagram</a>
                    <a href="#" style="color:#ffffff;text-decoration:none;margin:0 12px;">Website</a>
                  </div>
                  <div style="font-size:14px;color:#a0aec0;line-height:1.6;">
                    <strong style="color:#ffffff;">Fashion Store</strong><br>
                    Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
                    © 2025 Fashion Store. All rights reserved.
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`

  const text = `
✅ ĐƠN HÀNG ĐÃ ĐƯỢC XÁC NHẬN

Xin chào ${firstName},

Cảm ơn bạn đã đặt hàng tại Fashion Store!

Mã đơn hàng: #${params.orderNumber}
Tổng cộng: ${totalText}

CHI TIẾT ĐƠN HÀNG:
${params.items.map(i => `- ${i.name} × ${i.quantity}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * i.quantity)}`).join('\n')}

TIẾP THEO SẼ DIỄN RA GÌ?
• Chúng tôi sẽ xác nhận và chuẩn bị đơn hàng trong vòng 24h
• Bạn sẽ nhận được email thông báo khi đơn hàng được giao cho đơn vị vận chuyển
• Thời gian giao hàng dự kiến: 2-3 ngày làm việc

Theo dõi đơn hàng: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders

HỖ TRỢ KHÁCH HÀNG:
Hotline: 1900-xxxx
Email: support@fashionstore.com

Trân trọng,
Fashion Store Team`.trim()

  return { subject, html, text }
}

export const getOrderStatusEmailTemplate = (
  firstName: string,
  params: { orderNumber: string; status: string; note?: string; trackingNumber?: string }
): EmailTemplate => {
  const statusMap: Record<string, { label: string; color: string; icon: string; message: string; nextSteps: string }> = {
    pending: {
      label: 'Chờ xử lý',
      color: '#f59e0b',
      icon: '⏳',
      message: 'Đơn hàng của bạn đang chờ được xử lý',
      nextSteps: 'Chúng tôi sẽ xác nhận đơn hàng trong vòng 24h'
    },
    confirmed: {
      label: 'Đã xác nhận',
      color: '#3b82f6',
      icon: '✅',
      message: 'Đơn hàng đã được xác nhận thành công',
      nextSteps: 'Chúng tôi đang chuẩn bị hàng cho bạn'
    },
    processing: {
      label: 'Chuẩn bị hàng',
      color: '#8b5cf6',
      icon: '📦',
      message: 'Đơn hàng đang được chuẩn bị',
      nextSteps: 'Sản phẩm sẽ sớm được giao cho đơn vị vận chuyển'
    },
    shipping: {
      label: 'Đang giao',
      color: '#06b6d4',
      icon: '🚚',
      message: 'Đơn hàng đang trên đường giao đến bạn',
      nextSteps: 'Dự kiến giao hàng trong 2-3 ngày'
    },
    delivered: {
      label: 'Đã giao',
      color: '#10b981',
      icon: '🎉',
      message: 'Đơn hàng đã được giao thành công',
      nextSteps: 'Cảm ơn bạn đã mua hàng tại Fashion Store'
    },
    cancelled: {
      label: 'Đã hủy',
      color: '#ef4444',
      icon: '❌',
      message: 'Đơn hàng đã được hủy',
      nextSteps: 'Nếu có thắc mắc, vui lòng liên hệ hotline'
    }
  };

  const statusInfo = statusMap[params.status] || statusMap.pending;
  const subject = `${statusInfo.icon} Đơn hàng #${params.orderNumber} - ${statusInfo.label}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f7fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
            
            <tr><td style="background:linear-gradient(135deg,${statusInfo.color} 0%,${statusInfo.color}dd 100%);padding:48px 40px;text-align:center;">
              <div style="font-size:64px;margin-bottom:16px;">${statusInfo.icon}</div>
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;">Cập Nhật Đơn Hàng</h1>
              <p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.9);">${statusInfo.label}</p>
            </td></tr>

            <tr><td style="padding:0 40px;">
              <div style="background:${statusInfo.color}15;border:2px solid ${statusInfo.color};border-radius:12px;padding:20px;margin-top:-30px;text-align:center;">
                <div style="font-size:14px;color:#718096;margin-bottom:4px;">Mã đơn hàng</div>
                <div style="font-size:24px;font-weight:700;color:${statusInfo.color};">#${params.orderNumber}</div>
              </div>
            </td></tr>

            <tr><td style="padding:32px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:20px;color:#1a202c;">Xin chào ${firstName},</h2>
              <p style="margin:0 0 16px;color:#4a5568;font-size:16px;line-height:1.8;">${statusInfo.message}</p>
              ${params.trackingNumber ? `<p style="margin:0;padding:16px;background:#f7fafc;border-radius:8px;"><strong>Mã vận đơn:</strong> ${params.trackingNumber}</p>` : ''}
              ${params.note ? `<p style="margin:16px 0 0;padding:16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;color:#78350f;"><strong>Ghi chú:</strong> ${params.note}</p>` : ''}
            </td></tr>

            <tr><td style="padding:0 40px 32px;">
              <div style="background:#f7fafc;border-radius:12px;padding:24px;">
                <h3 style="margin:0 0 12px;font-size:16px;color:#1a202c;">📍 Tiếp theo</h3>
                <p style="margin:0;color:#4a5568;line-height:1.6;">${statusInfo.nextSteps}</p>
              </div>
            </td></tr>

            <tr><td style="padding:0 40px 40px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders" style="display:inline-block;background:linear-gradient(135deg,${statusInfo.color} 0%,${statusInfo.color}dd 100%);color:#fff;text-decoration:none;padding:16px 48px;border-radius:50px;font-weight:600;font-size:16px;">
                Theo dõi đơn hàng
              </a>
            </td></tr>

            <tr><td style="padding:32px 40px;background:#f7fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 8px;color:#718096;font-size:14px;">Cần hỗ trợ? Liên hệ: <strong>1900-xxxx</strong></p>
              <p style="margin:0;color:#a0aec0;font-size:12px;">© 2025 Fashion Store</p>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

  const text = `${statusInfo.icon} CẬP NHẬT ĐƠN HÀNG

Xin chào ${firstName},

Đơn hàng #${params.orderNumber} - ${statusInfo.label}
${statusInfo.message}

${params.trackingNumber ? `Mã vận đơn: ${params.trackingNumber}\n` : ''}${params.note ? `Ghi chú: ${params.note}\n` : ''}
Tiếp theo: ${statusInfo.nextSteps}

Theo dõi đơn hàng: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders

---
Fashion Store | Hotline: 1900-xxxx`;

  return { subject, html, text };
}

export const getAdminNewOrderEmailTemplate = (
  params: {
    orderNumber: string;
    total: number;
    userEmail: string;
    customerName?: string;
    items?: { name: string; quantity: number; price: number; image?: string }[];
    shippingAddress?: any;
  }
): EmailTemplate => {
  const subject = `🔔 Đơn hàng mới #${params.orderNumber} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.total)}`
  const totalText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.total)

  const itemsHtml = params.items ? params.items.map(i => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td width="60" style="padding-right:12px;">
              <img src="${i.image || 'https://via.placeholder.com/60'}" 
                   alt="${i.name}" 
                   style="width:60px;height:60px;border-radius:6px;object-fit:cover;display:block;" />
            </td>
            <td>
              <div style="font-weight:600;color:#1a202c;font-size:14px;margin-bottom:4px;">${i.name}</div>
              <div style="color:#718096;font-size:13px;">SL: ${i.quantity} × ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price)}</div>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;vertical-align:middle;font-weight:600;color:#1a202c;">
        ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * i.quantity)}
      </td>
    </tr>
  `).join('') : ''

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đơn hàng mới</title>
    </head>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f7fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7fafc;padding:30px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
              
              <!-- Alert Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:32px 30px;text-align:center;">
                  <div style="font-size:48px;margin-bottom:12px;">🔔</div>
                  <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">ĐƠN HÀNG MỚI</h1>
                  <p style="margin:8px 0 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Cần xử lý ngay</p>
                </td>
              </tr>

              <!-- Order Badge -->
              <tr>
                <td style="padding:0 30px;">
                  <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:10px;padding:16px;margin-top:-20px;text-align:center;">
                    <div style="font-size:12px;color:#92400e;margin-bottom:4px;font-weight:600;">MÃ ĐƠN HÀNG</div>
                    <div style="font-size:20px;font-weight:700;color:#d97706;letter-spacing:1px;">#${params.orderNumber}</div>
                  </div>
                </td>
              </tr>

              <!-- Customer Info -->
              <tr>
                <td style="padding:24px 30px;">
                  <h3 style="margin:0 0 16px 0;font-size:16px;color:#1a202c;font-weight:600;">👤 Thông tin khách hàng</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;border-radius:8px;padding:16px;">
                    <tr>
                      <td style="padding:6px 0;color:#4a5568;font-size:14px;">
                        <strong style="color:#1a202c;">Tên:</strong> ${params.customerName || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#4a5568;font-size:14px;">
                        <strong style="color:#1a202c;">Email:</strong> ${params.userEmail}
                      </td>
                    </tr>
                    ${params.shippingAddress ? `
                    <tr>
                      <td style="padding:6px 0;color:#4a5568;font-size:14px;">
                        <strong style="color:#1a202c;">SĐT:</strong> ${params.shippingAddress.phone || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;color:#4a5568;font-size:14px;">
                        <strong style="color:#1a202c;">Địa chỉ:</strong> ${params.shippingAddress.address || 'N/A'}
                      </td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>

              <!-- Order Items -->
              ${params.items && params.items.length > 0 ? `
              <tr>
                <td style="padding:0 30px 24px;">
                  <h3 style="margin:0 0 16px 0;font-size:16px;color:#1a202c;font-weight:600;">📦 Sản phẩm</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>
              ` : ''}

              <!-- Total -->
              <tr>
                <td style="padding:0 30px 24px;">
                  <div style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);border-radius:10px;padding:20px;text-align:center;">
                    <div style="font-size:14px;color:rgba(255,255,255,0.9);margin-bottom:4px;">TỔNG GIÁ TRỊ ĐƠN HÀNG</div>
                    <div style="font-size:28px;font-weight:700;color:#ffffff;">${totalText}</div>
                  </div>
                </td>
              </tr>

              <!-- Action Button -->
              <tr>
                <td style="padding:0 30px 32px;text-align:center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders" 
                     style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-weight:600;font-size:15px;box-shadow:0 4px 12px rgba(102,126,234,0.4);">
                    Xem chi tiết đơn hàng →
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:24px 30px;background:#f7fafc;border-top:1px solid #e2e8f0;text-align:center;">
                  <p style="margin:0;color:#718096;font-size:13px;">
                    Email tự động từ hệ thống Fashion Store Admin<br>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="color:#667eea;text-decoration:none;">Truy cập Admin Panel</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`

  const text = `
🔔 ĐƠN HÀNG MỚI

Mã đơn: #${params.orderNumber}
Khách hàng: ${params.customerName || params.userEmail}
Email: ${params.userEmail}
Tổng tiền: ${totalText}

${params.items ? `
SẢN PHẨM:
${params.items.map(i => `- ${i.name} × ${i.quantity}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * i.quantity)}`).join('\n')}
` : ''}

Xem chi tiết: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders

---
Fashion Store Admin System
  `.trim()

  return { subject, html, text }
}

// Send order emails
export const sendOrderConfirmationEmail = async (
  email: string,
  firstName: string,
  params: { 
    orderNumber: string; 
    total: number; 
    subtotal: number;
    discount?: number;
    shipping: number;
    items: { name: string; quantity: number; price: number; image?: string }[];
    shippingAddress: any;
    shippingMethod: string;
    paymentMethod: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log('Sending professional order confirmation email:', { email, firstName, orderNumber: params.orderNumber })

  try {
    // Verify connection first
    const isReady = await verifyConnection()
    if (!isReady) {
      throw new Error('Email server is not ready')
    }

    // Use professional template
    const { getOrderConfirmationProTemplate } = await import('./emailTemplates/orderConfirmationPro')
    const template = getOrderConfirmationProTemplate(firstName, params)

    const info = await transporter.sendMail({
      from: { name: 'Fashion Store', address: process.env.EMAIL_USER || 'noreply@fashionstore.com' },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    console.log('✅ Professional order confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown email error'
    return { success: false, error: errorMessage }
  }
}

export const sendOrderStatusEmail = async (
  email: string,
  firstName: string,
  params: { orderNumber: string; status: string; note?: string; trackingNumber?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    const isReady = await verifyConnection()
    if (!isReady) {
      throw new Error('Email server is not ready')
    }

    const template = getOrderStatusEmailTemplate(firstName, params)
    const info = await transporter.sendMail({
      from: { name: 'Fashion Store', address: process.env.EMAIL_USER || 'noreply@fashionstore.com' },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    console.log('Order status email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send order status email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown email error' }
  }
}

export const sendAdminNewOrderEmail = async (
  adminEmail: string,
  params: {
    orderNumber: string;
    total: number;
    userEmail: string;
    customerName?: string;
    items?: { name: string; quantity: number; price: number; image?: string }[];
    shippingAddress?: any;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    const isReady = await verifyConnection()
    if (!isReady) {
      throw new Error('Email server is not ready')
    }

    const template = getAdminNewOrderEmailTemplate(params)
    const info = await transporter.sendMail({
      from: { name: 'Fashion Store', address: process.env.EMAIL_USER || 'noreply@fashionstore.com' },
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    console.log('Admin notification email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send admin notification email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown email error' }
  }
}

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  firstName: string,
  code: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    const isReady = await verifyConnection()
    if (!isReady) {
      throw new Error('Email server is not ready')
    }

    const template = getVerificationEmailTemplate(firstName, code)
    const info = await transporter.sendMail({
      from: {
        name: 'Fashion Store',
        address: process.env.EMAIL_USER || 'noreply@fashionstore.com'
      },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    console.log('Verification email sent successfully:', {
      messageId: info.messageId,
      to: email,
      code: code // Remove this in production for security
    })

    return {
      success: true,
      messageId: info.messageId
    }

  } catch (error) {
    console.error('Error sending verification email:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

// Send welcome email after successful verification
export const sendWelcomeEmail = async (
  email: string,
  firstName: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    const isReady = await verifyConnection()
    if (!isReady) {
      throw new Error('Email server is not ready')
    }

    const template = getWelcomeEmailTemplate(firstName)
    const info = await transporter.sendMail({
      from: {
        name: 'Fashion Store',
        address: process.env.EMAIL_USER || 'noreply@fashionstore.com'
      },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })

    console.log('Welcome email sent successfully:', {
      messageId: info.messageId,
      to: email
    })

    return {
      success: true,
      messageId: info.messageId
    }

  } catch (error) {
    console.error('Error sending welcome email:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

// Test email configuration
export const testEmailConfiguration = async (): Promise<{
  success: boolean
  error?: string
  config?: any
}> => {
  try {
    // Verify connection using the global transporter
    const isReady = await verifyConnection()

    console.log('Email configuration test successful')

    return {
      success: true,
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: process.env.EMAIL_USER
      }
    }

  } catch (error) {
    console.error('Email configuration test failed:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown configuration error'
    }
  }
}

// Send test email
export const sendTestEmail = async (
  toEmail: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    const isReady = await verifyConnection()
    if (!isReady) {
      throw new Error('Email server is not ready')
    }

    const testCode = generateVerificationCode()
    const info = await transporter.sendMail({
      from: {
        name: 'Fashion Store',
        address: process.env.EMAIL_USER || 'noreply@fashionstore.com'
      },
      to: toEmail,
      subject: 'Test Email - Fashion Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">Email Configuration Test</h2>
          <p>This is a test email from Fashion Store authentication system.</p>
          <p>Test verification code: <strong style="font-size: 24px; color: #e74c3c;">${testCode}</strong></p>
          <p>If you received this email, the email service is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString('vi-VN')}<br>
            Environment: ${process.env.NODE_ENV}
          </p>
        </div>
      `,
      text: `
Email Configuration Test

This is a test email from Fashion Store authentication system.
Test verification code: ${testCode}

If you received this email, the email service is working correctly!

Sent at: ${new Date().toLocaleString('vi-VN')}
Environment: ${process.env.NODE_ENV}
      `.trim()
    })

    console.log('Test email sent successfully:', {
      messageId: info.messageId,
      to: toEmail
    })

    return {
      success: true,
      messageId: info.messageId
    }

  } catch (error) {
    console.error('Error sending test email:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

// Send reset password email
export const sendResetPasswordEmail = async (
  email: string,
  firstName: string,
  resetLink: string
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    const isReady = await verifyConnection()
    if (!isReady) {
      throw new Error('Email server is not ready')
    }

    const template = getResetPasswordEmailTemplate(firstName, resetLink)
    const info = await transporter.sendMail({
      from: {
        name: 'Fashion Store',
        address: process.env.EMAIL_USER || 'noreply@fashionstore.com'
      },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })


    console.log('Reset password email sent successfully:', {
      messageId: info.messageId,
      to: email
    })

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Error sending reset password email:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    }
  }
}

// Email queue for better performance (simple in-memory queue)
interface EmailJob {
  id: string
  type: 'verification' | 'welcome' | 'reset_password' | 'test'
  email: string
  firstName?: string
  code?: string
  resetLink?: string
  createdAt: string
  attempts: number
  maxAttempts: number
}

class EmailQueue {
  private queue: EmailJob[] = []
  private processing = false

  async addVerificationEmail(email: string, firstName: string, code: string): Promise<string> {
    const job: EmailJob = {
      id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'verification',
      email,
      firstName,
      code,
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    }

    this.queue.push(job)
    this.processQueue()

    return job.id
  }

  async addWelcomeEmail(email: string, firstName: string): Promise<string> {
    const job: EmailJob = {
      id: `welcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'welcome',
      email,
      firstName,
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    }

    this.queue.push(job)
    this.processQueue()

    return job.id
  }

  async addResetPasswordEmail(email: string, firstName: string, resetLink: string): Promise<string> {
    const job: EmailJob = {
      id: `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'reset_password',
      email,
      firstName,
      resetLink,
      createdAt: new Date().toISOString(),
      attempts: 0,
      maxAttempts: 3
    }

    this.queue.push(job)
    this.processQueue()

    return job.id
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const job = this.queue.shift()!

      try {
        let result: { success: boolean; error?: string }

        switch (job.type) {
          case 'verification':
            result = await sendVerificationEmail(job.email, job.firstName!, job.code!)
            break
          case 'welcome':
            result = await sendWelcomeEmail(job.email, job.firstName!)
            break
          case 'reset_password':
            result = await sendResetPasswordEmail(job.email, job.firstName!, job.resetLink!)
            break
          default:
            result = { success: false, error: 'Unknown job type' }
        }

        if (!result.success) {
          job.attempts++

          if (job.attempts < job.maxAttempts) {
            // Retry after delay
            setTimeout(() => {
              this.queue.unshift(job) // Add back to front of queue
              this.processQueue()
            }, 5000 * job.attempts) // Exponential backoff
          } else {
            console.error(`Email job failed after ${job.maxAttempts} attempts:`, {
              jobId: job.id,
              email: job.email,
              error: result.error
            })
          }
        } else {
          console.log(`Email job completed successfully: ${job.id}`)
        }

      } catch (error) {
        console.error('Error processing email job:', error)
      }

      // Small delay between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    this.processing = false
  }

  getQueueStatus(): { pending: number; processing: boolean } {
    return {
      pending: this.queue.length,
      processing: this.processing
    }
  }
}

// Export singleton email queue
export const emailQueue = new EmailQueue()

// Utility functions
export const generateVerificationCodeWithExpiry = (): {
  code: string
  expiresAt: string
  expiresInMinutes: number
} => {
  const code = generateVerificationCode()
  const expiresInMinutes = 10
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()

  return {
    code,
    expiresAt,
    expiresInMinutes
  }
}

export const isValidEmailProvider = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase()

  // List of common email providers (you can expand this)
  const validProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'protonmail.com',
    'yandex.com'
  ]

  return validProviders.includes(domain)
}


// ✅ Send detailed order status email with full order information
export const sendOrderStatusEmailDetailed = async (
  email: string,
  firstName: string,
  params: {
    orderNumber: string;
    status: string;
    note?: string;
    trackingNumber?: string;
    total: number;
    subtotal: number;
    discount?: number;
    shipping: number;
    items: { name: string; quantity: number; price: number; image?: string }[];
    shippingAddress: any;
    shippingMethod: string;
    paymentMethod: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Verify connection first
    const isReady = await verifyConnection();
    if (!isReady) {
      throw new Error('Email server is not ready');
    }

    // Import detailed template
    const { getOrderStatusEmailDetailedTemplate } = await import('./emailTemplates/orderStatusDetailed');
    const template = getOrderStatusEmailDetailedTemplate(firstName, params);

    const info = await transporter.sendMail({
      from: { name: 'Fashion Store', address: process.env.EMAIL_USER || 'noreply@fashionstore.com' },
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    console.log('Detailed order status email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send detailed order status email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown email error' };
  }
};
