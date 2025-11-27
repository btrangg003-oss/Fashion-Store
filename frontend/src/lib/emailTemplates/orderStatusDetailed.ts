// Detailed order status email template with full order information
export interface OrderStatusDetailedParams {
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

export const getOrderStatusEmailDetailedTemplate = (
  firstName: string,
  params: OrderStatusDetailedParams
) => {
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
      message: 'Đơn hàng đã được xác nhận và đang được chuẩn bị',
      nextSteps: 'Chúng tôi đang đóng gói sản phẩm cho bạn'
    },
    processing: { 
      label: 'Đang chuẩn bị', 
      color: '#8b5cf6', 
      icon: '📦',
      message: 'Đơn hàng đang được đóng gói cẩn thận',
      nextSteps: 'Sản phẩm sẽ sớm được giao cho đơn vị vận chuyển'
    },
    shipping: { 
      label: 'Đang giao hàng', 
      color: '#06b6d4', 
      icon: '🚚',
      message: 'Đơn hàng đang trên đường giao đến bạn',
      nextSteps: 'Dự kiến giao hàng trong 2-3 ngày làm việc'
    },
    delivered: { 
      label: 'Đã giao thành công', 
      color: '#10b981', 
      icon: '🎉',
      message: 'Đơn hàng đã được giao thành công đến địa chỉ của bạn',
      nextSteps: 'Cảm ơn bạn đã tin tưởng và mua sắm tại Fashion Store!'
    },
    cancelled: { 
      label: 'Đã hủy', 
      color: '#ef4444', 
      icon: '❌',
      message: 'Đơn hàng đã được hủy theo yêu cầu',
      nextSteps: 'Nếu có thắc mắc, vui lòng liên hệ hotline 1900-xxxx'
    }
  };

  const statusInfo = statusMap[params.status] || statusMap.pending;
  const subject = `${statusInfo.icon} Cập nhật đơn hàng #${params.orderNumber} - ${statusInfo.label}`;

  // Payment method labels
  const paymentLabels: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng/Ghi nợ',
    momo: 'Ví MoMo'
  };

  // Format items HTML
  const itemsHtml = params.items.map(item => `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #f0f0f0;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="80" style="padding-right:16px;vertical-align:top;">
              <img src="${item.image || 'https://via.placeholder.com/80'}" 
                   alt="${item.name}" 
                   style="width:80px;height:80px;border-radius:8px;object-fit:cover;display:block;" />
            </td>
            <td style="vertical-align:top;">
              <div style="font-weight:600;color:#1a202c;margin-bottom:6px;font-size:15px;">${item.name}</div>
              <div style="color:#718096;font-size:14px;margin-bottom:4px;">Số lượng: ${item.quantity}</div>
              <div style="color:#4a5568;font-size:14px;font-weight:600;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</div>
            </td>
            <td style="text-align:right;vertical-align:top;padding-left:16px;">
              <div style="font-weight:700;color:#1a202c;font-size:16px;">
                ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f7fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;padding:40px 20px;">
        <tr><td align="center">
          <table width="650" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr><td style="background:linear-gradient(135deg,${statusInfo.color} 0%,${statusInfo.color}dd 100%);padding:48px 40px;text-align:center;">
              <div style="font-size:72px;margin-bottom:16px;line-height:1;">${statusInfo.icon}</div>
              <h1 style="margin:0;font-size:32px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Cập Nhật Đơn Hàng</h1>
              <p style="margin:12px 0 0;font-size:18px;color:rgba(255,255,255,0.95);font-weight:500;">${statusInfo.label}</p>
            </td></tr>

            <!-- Order Number Badge -->
            <tr><td style="padding:0 40px;">
              <div style="background:${statusInfo.color}15;border:2px solid ${statusInfo.color};border-radius:12px;padding:24px;margin-top:-30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                <div style="font-size:13px;color:#718096;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Mã đơn hàng</div>
                <div style="font-size:28px;font-weight:700;color:${statusInfo.color};letter-spacing:-0.5px;">#${params.orderNumber}</div>
              </div>
            </td></tr>

            <!-- Greeting & Status Message -->
            <tr><td style="padding:40px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#1a202c;font-weight:600;">Xin chào ${firstName},</h2>
              <p style="margin:0 0 20px;color:#4a5568;font-size:16px;line-height:1.8;">${statusInfo.message}</p>
              
              ${params.trackingNumber ? `
              <div style="background:#f7fafc;border-radius:10px;padding:20px;margin-bottom:20px;border-left:4px solid ${statusInfo.color};">
                <div style="font-size:13px;color:#718096;margin-bottom:6px;font-weight:600;">📦 MÃ VẬN ĐƠN</div>
                <div style="font-size:20px;font-weight:700;color:#1a202c;letter-spacing:0.5px;">${params.trackingNumber}</div>
              </div>
              ` : ''}
              
              ${params.note ? `
              <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:18px;margin-bottom:20px;">
                <div style="font-size:13px;color:#92400e;margin-bottom:6px;font-weight:600;">💬 GHI CHÚ</div>
                <div style="color:#78350f;font-size:15px;line-height:1.6;">${params.note}</div>
              </div>
              ` : ''}
            </td></tr>

            <!-- Order Items -->
            <tr><td style="padding:0 40px 24px;">
              <h3 style="margin:0 0 16px;font-size:18px;color:#1a202c;font-weight:600;">📦 Chi tiết đơn hàng</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                ${itemsHtml}
                
                <!-- Total -->
                <tr>
                  <td style="padding:24px;background:#f7fafc;border-top:2px solid #e2e8f0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:18px;font-weight:700;color:#1a202c;">Tổng cộng</td>
                        <td style="text-align:right;font-size:24px;font-weight:700;color:${statusInfo.color};">
                          ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.total)}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- Shipping & Payment Info -->
            <tr><td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="vertical-align:top;padding-right:12px;">
                    <div style="background:#f7fafc;border-radius:12px;padding:20px;height:100%;">
                      <h4 style="margin:0 0 12px;font-size:14px;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📍 Địa chỉ giao hàng</h4>
                      <p style="margin:0;color:#1a202c;font-size:15px;line-height:1.7;font-weight:500;">${params.shippingAddress?.fullName || ''}</p>
                      <p style="margin:8px 0 0;color:#4a5568;font-size:14px;line-height:1.6;">
                        ${params.shippingAddress?.phone || ''}<br>
                        ${params.shippingAddress?.address || ''}<br>
                        ${params.shippingAddress?.ward || ''}, ${params.shippingAddress?.district || ''}<br>
                        ${params.shippingAddress?.city || ''}
                      </p>
                    </div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top;padding-left:12px;">
                    <div style="background:#f7fafc;border-radius:12px;padding:20px;height:100%;">
                      <h4 style="margin:0 0 12px;font-size:14px;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">💳 Thanh toán</h4>
                      <p style="margin:0;color:#1a202c;font-size:15px;font-weight:500;">${paymentLabels[params.paymentMethod] || params.paymentMethod}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- Next Steps -->
            <tr><td style="padding:0 40px 32px;">
              <div style="background:linear-gradient(135deg,${statusInfo.color}15 0%,${statusInfo.color}08 100%);border-radius:12px;padding:24px;border:1px solid ${statusInfo.color}30;">
                <h3 style="margin:0 0 12px;font-size:16px;color:#1a202c;font-weight:600;">📍 Tiếp theo</h3>
                <p style="margin:0;color:#4a5568;line-height:1.7;font-size:15px;">${statusInfo.nextSteps}</p>
              </div>
            </td></tr>

            <!-- CTA Button -->
            <tr><td style="padding:0 40px 40px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders" 
                 style="display:inline-block;background:linear-gradient(135deg,${statusInfo.color} 0%,${statusInfo.color}dd 100%);color:#fff;text-decoration:none;padding:18px 48px;border-radius:50px;font-weight:600;font-size:16px;box-shadow:0 4px 12px ${statusInfo.color}40;">
                Theo dõi đơn hàng
              </a>
            </td></tr>

            <!-- Footer -->
            <tr><td style="padding:32px 40px;background:#f7fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 12px;color:#718096;font-size:14px;">
                Cần hỗ trợ? Liên hệ: <strong style="color:#1a202c;">1900-xxxx</strong> | 
                Email: <a href="mailto:support@fashionstore.com" style="color:${statusInfo.color};text-decoration:none;">support@fashionstore.com</a>
              </p>
              <p style="margin:0;color:#a0aec0;font-size:12px;">© 2025 Fashion Store. All rights reserved.</p>
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

${params.trackingNumber ? `📦 Mã vận đơn: ${params.trackingNumber}\n` : ''}${params.note ? `💬 Ghi chú: ${params.note}\n` : ''}
📦 CHI TIẾT ĐƠN HÀNG
${params.items.map(i => `- ${i.name} x${i.quantity}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * i.quantity)}`).join('\n')}

Tổng cộng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.total)}

📍 Địa chỉ giao hàng:
${params.shippingAddress?.fullName || ''}
${params.shippingAddress?.phone || ''}
${params.shippingAddress?.address || ''}, ${params.shippingAddress?.ward || ''}, ${params.shippingAddress?.district || ''}, ${params.shippingAddress?.city || ''}

💳 Thanh toán: ${paymentLabels[params.paymentMethod] || params.paymentMethod}

📍 Tiếp theo: ${statusInfo.nextSteps}

Theo dõi đơn hàng: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders

---
Fashion Store | Hotline: 1900-xxxx | support@fashionstore.com`;

  return { subject, html, text };
};
