/**
 * Request Notifications Service
 * Send emails for customer requests
 */

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

const getTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    email_change: 'đổi email',
    phone_change: 'đổi số điện thoại',
    return_exchange: 'hoàn trả/đổi hàng'
  };
  return typeMap[type] || type;
};

const formatReturnExchangeDetails = (data: any): string => {
  if (!data.orderId) return '';
  
  let html = `
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> ${data.orderNumber || data.orderId}</p>
      <p style="margin: 5px 0;"><strong>Loại yêu cầu:</strong> ${data.action === 'return' ? 'Hoàn trả' : 'Đổi hàng'}</p>
    </div>
  `;
  
  if (data.items && data.items.length > 0) {
    html += `<h3 style="color: #374151; font-size: 16px; margin: 15px 0 10px;">Sản phẩm yêu cầu ${data.action === 'return' ? 'trả' : 'đổi'}:</h3><ul style="margin: 0; padding-left: 20px;">`;
    
    data.items.forEach((item: any) => {
      html += `<li style="margin: 5px 0;">${item.productName} - ${item.quantity} sản phẩm<br><small style="color: #6b7280;">Lý do: ${getReturnReason(item.reason)}</small></li>`;
    });
    
    html += `</ul>`;
  }
  
  return html;
};

const getReturnReason = (reason: string): string => {
  const map: Record<string, string> = {
    size_wrong: 'Size không vừa',
    defective: 'Sản phẩm lỗi',
    not_as_described: 'Không đúng mô tả',
    other: 'Lý do khác'
  };
  return map[reason] || reason;
};

/**
 * Send email to customer when request is created
 */
export async function sendRequestCreatedEmail(
  customerEmail: string,
  customerName: string,
  requestType: string,
  requestId: string,
  requestData?: any
): Promise<void> {
  const typeText = getTypeText(requestType);
  const typeIcon = requestType === 'return_exchange' ? '↩️' : requestType === 'email_change' ? '📧' : '📱';

  try {
    await transporter.sendMail({
      from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Yêu cầu của bạn đã được gửi - ${typeText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${typeIcon} Fashion Store</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #10b981; margin: 0 0 20px;">✅ Yêu cầu đã được gửi thành công!</h2>
            <p style="color: #374151; line-height: 1.6;">Xin chào <strong>${customerName}</strong>,</p>
            <p style="color: #374151; line-height: 1.6;">Yêu cầu <strong>${typeText}</strong> của bạn đã được gửi thành công.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 5px 0; color: #374151;"><strong>Mã yêu cầu:</strong> <span style="color: #3b82f6; font-family: monospace;">#${requestId}</span></p>
              <p style="margin: 5px 0; color: #374151;"><strong>Loại:</strong> ${typeText}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Trạng thái:</strong> <span style="color: #f59e0b;">Chờ xử lý</span></p>
            </div>
            
            ${requestType === 'return_exchange' && requestData ? formatReturnExchangeDetails(requestData) : ''}
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>⏱️ Thời gian xử lý:</strong> Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.
              </p>
            </div>
            
            ${requestType === 'return_exchange' ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fde68a;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>📦 Lưu ý:</strong> Vui lòng giữ nguyên sản phẩm và bao bì. Chúng tôi sẽ liên hệ để sắp xếp việc lấy hàng.
              </p>
            </div>
            ` : ''}
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Cảm ơn bạn đã tin tưởng Fashion Store!</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © 2024 Fashion Store. Mọi quyền được bảo lưu.<br>
              Nếu có thắc mắc, vui lòng liên hệ: <a href="mailto:support@fashionstore.com" style="color: #3b82f6;">support@fashionstore.com</a>
            </p>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending customer email:', error);
  }
}

/**
 * Send email to admin when new request is created
 */
export async function sendAdminNotificationEmail(
  requestType: string,
  customerName: string,
  customerEmail: string,
  requestId: string,
  pendingCounts: { email: number; phone: number; return: number }
): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmail) return;

  const typeText = getTypeText(requestType);
  const typeIcon = {
    email_change: '📧',
    phone_change: '📱',
    return_exchange: '↩️'
  }[requestType] || '📝';

  try {
    await transporter.sendMail({
      from: `"Fashion Store System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `[ADMIN] Yêu cầu mới từ khách hàng - ${typeText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">${typeIcon} Yêu cầu mới cần xử lý</h2>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 5px 0;"><strong>Khách hàng:</strong> ${customerName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
            <p style="margin: 5px 0;"><strong>Loại:</strong> ${typeText}</p>
            <p style="margin: 5px 0;"><strong>Mã:</strong> #${requestId}</p>
          </div>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/requests" 
               style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Xem chi tiết
            </a>
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <h3 style="color: #374151;">Tổng yêu cầu đang chờ:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;">📧 Đổi email: <strong>${pendingCounts.email}</strong></li>
            <li style="padding: 5px 0;">📱 Đổi SĐT: <strong>${pendingCounts.phone}</strong></li>
            <li style="padding: 5px 0;">↩️ Hoàn trả hàng: <strong>${pendingCounts.return}</strong></li>
          </ul>
        </div>
      `
    });
  } catch (error) {
    console.error('Error sending admin email:', error);
  }
}

/**
 * Send email to customer when request is approved
 */
export async function sendRequestApprovedEmail(
  customerEmail: string,
  customerName: string,
  requestType: string,
  requestId: string,
  requestData?: any
): Promise<void> {
  const typeText = getTypeText(requestType);
  const typeIcon = requestType === 'return_exchange' ? '↩️' : requestType === 'email_change' ? '📧' : '📱';

  // Build products HTML for return/exchange
  let productsHTML = '';
  if (requestType === 'return_exchange' && requestData?.items) {
    productsHTML = `
      <div style="margin: 25px 0;">
        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">Sản phẩm được duyệt:</h3>
        <div style="background: #f9fafb; border-radius: 12px; padding: 15px; border: 1px solid #e5e7eb;">
    `;
    
    requestData.items.forEach((item: any) => {
      const itemTotal = (item.price * item.quantity).toLocaleString('vi-VN');
      productsHTML += `
        <div style="display: flex; gap: 15px; padding: 15px; background: white; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e5e7eb;">
          <img src="${item.image}" alt="${item.productName}" 
               style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;"
               onerror="this.src='https://via.placeholder.com/80'">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 5px;">${item.productName}</div>
            <div style="color: #6b7280; font-size: 13px; margin-bottom: 5px;">
              ${item.size ? `Size: ${item.size}` : ''}
              ${item.color ? ` • Màu: ${item.color}` : ''}
              • Số lượng: ${item.quantity}
            </div>
            <div style="color: #10b981; font-weight: 700; font-size: 16px;">${itemTotal}₫</div>
          </div>
        </div>
      `;
    });
    
    if (requestData.refundAmount) {
      productsHTML += `
        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
          <div style="color: #065f46; font-size: 14px; margin-bottom: 5px;">Tổng tiền hoàn lại</div>
          <div style="color: #047857; font-size: 28px; font-weight: 800;">${requestData.refundAmount.toLocaleString('vi-VN')}₫</div>
        </div>
      `;
    }
    
    productsHTML += `</div></div>`;
  }

  // Build next steps based on request type
  let nextStepsHTML = '';
  if (requestType === 'return_exchange') {
    nextStepsHTML = `
      <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">📋 Các bước tiếp theo:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li style="margin-bottom: 10px; line-height: 1.6;">Đóng gói sản phẩm cẩn thận, giữ nguyên tem mác và bao bì</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Chúng tôi sẽ liên hệ trong vòng 24h để sắp xếp lấy hàng</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Sau khi nhận và kiểm tra hàng, chúng tôi sẽ hoàn tiền trong 3-5 ngày làm việc</li>
        </ol>
      </div>
    `;
  } else if (requestType === 'email_change') {
    nextStepsHTML = `
      <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">📋 Các bước tiếp theo:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li style="margin-bottom: 10px; line-height: 1.6;">Email của bạn đã được cập nhật thành công</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Vui lòng đăng nhập lại bằng email mới</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Kiểm tra hộp thư để nhận thông báo từ hệ thống</li>
        </ol>
      </div>
    `;
  } else if (requestType === 'phone_change') {
    nextStepsHTML = `
      <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">📋 Các bước tiếp theo:</h3>
        <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li style="margin-bottom: 10px; line-height: 1.6;">Số điện thoại của bạn đã được cập nhật thành công</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Bạn sẽ nhận thông báo qua số điện thoại mới</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Cập nhật thông tin trong profile nếu cần</li>
        </ol>
      </div>
    `;
  }

  try {
    await transporter.sendMail({
      from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ Yêu cầu của bạn đã được chấp nhận - ${typeText}`,
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
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Yêu cầu đã được chấp nhận!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Fashion Store</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Xin chào <strong style="color: #10b981;">${customerName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                Chúng tôi vui mừng thông báo rằng yêu cầu <strong>${typeText}</strong> của bạn đã được xem xét và <strong style="color: #10b981;">chấp nhận</strong>.
              </p>
              
              <!-- Request Info Box -->
              <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px solid #6ee7b7;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="font-size: 32px; margin-right: 15px;">${typeIcon}</div>
                  <div>
                    <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 3px;">MÃ YÊU CẦU</div>
                    <div style="color: #047857; font-size: 20px; font-weight: 800; font-family: monospace;">#${requestId}</div>
                  </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.7); padding: 12px; border-radius: 8px;">
                  <div style="color: #065f46; font-size: 13px; margin-bottom: 5px;">Trạng thái</div>
                  <div style="color: #047857; font-size: 16px; font-weight: 700;">✅ Đã chấp nhận</div>
                </div>
              </div>
              
              ${productsHTML}
              
              ${nextStepsHTML}
              
              <!-- Support Box -->
              <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <div style="color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong style="font-size: 15px;">💬 Cần hỗ trợ?</strong><br>
                  Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi:<br>
                  📧 Email: <a href="mailto:support@fashionstore.com" style="color: #d97706; text-decoration: none; font-weight: 600;">support@fashionstore.com</a><br>
                  📱 Hotline: <strong>1900-xxxx</strong> (8:00 - 22:00 hàng ngày)
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Cảm ơn bạn đã tin tưởng và lựa chọn Fashion Store. Chúng tôi luôn nỗ lực để mang đến trải nghiệm mua sắm tốt nhất!
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  Xem tài khoản của tôi
                </a>
              </div>
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
                <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 10px;">Điều khoản</a>
                <span style="color: #d1d5db;">|</span>
                <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 10px;">Liên hệ</a>
              </div>
            </div>
            
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error('Error sending approval email:', error);
  }
}

/**
 * Send email to customer when request is rejected
 */
export async function sendRequestRejectedEmail(
  customerEmail: string,
  customerName: string,
  requestType: string,
  requestId: string,
  reason: string,
  requestData?: any
): Promise<void> {
  const typeText = getTypeText(requestType);
  const typeIcon = requestType === 'return_exchange' ? '↩️' : requestType === 'email_change' ? '📧' : '📱';

  // Build products HTML for return/exchange
  let productsHTML = '';
  if (requestType === 'return_exchange' && requestData?.items) {
    productsHTML = `
      <div style="margin: 25px 0;">
        <h3 style="color: #374151; font-size: 18px; margin: 0 0 15px 0; font-weight: 600;">Sản phẩm trong yêu cầu:</h3>
        <div style="background: #f9fafb; border-radius: 12px; padding: 15px; border: 1px solid #e5e7eb;">
    `;
    
    requestData.items.forEach((item: any) => {
      const itemTotal = (item.price * item.quantity).toLocaleString('vi-VN');
      productsHTML += `
        <div style="display: flex; gap: 15px; padding: 15px; background: white; border-radius: 8px; margin-bottom: 12px; border: 1px solid #e5e7eb; opacity: 0.7;">
          <img src="${item.image}" alt="${item.productName}" 
               style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; filter: grayscale(50%);"
               onerror="this.src='https://via.placeholder.com/80'">
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #6b7280; font-size: 15px; margin-bottom: 5px;">${item.productName}</div>
            <div style="color: #9ca3af; font-size: 13px; margin-bottom: 5px;">
              ${item.size ? `Size: ${item.size}` : ''}
              ${item.color ? ` • Màu: ${item.color}` : ''}
              • Số lượng: ${item.quantity}
            </div>
            <div style="color: #9ca3af; font-weight: 600; font-size: 16px;">${itemTotal}₫</div>
          </div>
        </div>
      `;
    });
    
    productsHTML += `</div></div>`;
  }

  // Alternative solutions
  let alternativesHTML = '';
  if (requestType === 'return_exchange') {
    alternativesHTML = `
      <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">💡 Giải pháp thay thế:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li style="margin-bottom: 10px; line-height: 1.6;">Kiểm tra lại điều kiện đổi trả trong chính sách của chúng tôi</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Liên hệ bộ phận chăm sóc khách hàng để được tư vấn cụ thể</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Xem xét các sản phẩm tương tự hoặc ưu đãi đặc biệt</li>
        </ul>
      </div>
    `;
  } else {
    alternativesHTML = `
      <div style="background: #eff6ff; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">💡 Bước tiếp theo:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
          <li style="margin-bottom: 10px; line-height: 1.6;">Kiểm tra lại thông tin bạn đã cung cấp</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Liên hệ với chúng tôi để được hỗ trợ chi tiết</li>
          <li style="margin-bottom: 10px; line-height: 1.6;">Bạn có thể tạo yêu cầu mới với thông tin chính xác hơn</li>
        </ul>
      </div>
    `;
  }

  try {
    await transporter.sendMail({
      from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Thông báo về yêu cầu của bạn - ${typeText}`,
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
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Thông báo về yêu cầu</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Fashion Store</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Xin chào <strong style="color: #f59e0b;">${customerName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
                Cảm ơn bạn đã gửi yêu cầu <strong>${typeText}</strong>. Sau khi xem xét kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng yêu cầu của bạn <strong style="color: #dc2626;">không thể được chấp nhận</strong> vào lúc này.
              </p>
              
              <!-- Request Info Box -->
              <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border: 2px solid #fca5a5;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <div style="font-size: 32px; margin-right: 15px;">${typeIcon}</div>
                  <div>
                    <div style="color: #991b1b; font-size: 14px; font-weight: 600; margin-bottom: 3px;">MÃ YÊU CẦU</div>
                    <div style="color: #dc2626; font-size: 20px; font-weight: 800; font-family: monospace;">#${requestId}</div>
                  </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.7); padding: 12px; border-radius: 8px;">
                  <div style="color: #991b1b; font-size: 13px; margin-bottom: 5px;">Trạng thái</div>
                  <div style="color: #dc2626; font-size: 16px; font-weight: 700;">❌ Không được chấp nhận</div>
                </div>
              </div>
              
              <!-- Reason Box -->
              <div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">📝 Lý do:</h3>
                <p style="color: #78350f; font-size: 15px; line-height: 1.6; margin: 0;">
                  ${reason || 'Yêu cầu không đáp ứng điều kiện theo chính sách của chúng tôi.'}
                </p>
              </div>
              
              ${productsHTML}
              
              ${alternativesHTML}
              
              <!-- Support Box -->
              <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                <div style="color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <strong style="font-size: 15px;">💬 Cần giải đáp thêm?</strong><br>
                  Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn:<br>
                  📧 Email: <a href="mailto:support@fashionstore.com" style="color: #2563eb; text-decoration: none; font-weight: 600;">support@fashionstore.com</a><br>
                  📱 Hotline: <strong>1900-xxxx</strong> (8:00 - 22:00 hàng ngày)<br>
                  💬 Live Chat: Truy cập website và chat trực tiếp với chúng tôi
                </div>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Chúng tôi xin lỗi vì sự bất tiện này và hy vọng có thể phục vụ bạn tốt hơn trong tương lai. Cảm ơn bạn đã thông cảm!
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  Xem tài khoản của tôi
                </a>
              </div>
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
                <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 10px;">Điều khoản</a>
                <span style="color: #d1d5db;">|</span>
                <a href="#" style="color: #9ca3af; text-decoration: none; font-size: 12px; margin: 0 10px;">Liên hệ</a>
              </div>
            </div>
            
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error('Error sending rejection email:', error);
  }
}
