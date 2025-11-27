// Professional Order Confirmation Email Template
export interface OrderConfirmationProParams {
  orderNumber: string;
  total: number;
  subtotal: number;
  discount?: number;
  shipping: number;
  items: { name: string; quantity: number; price: number; image?: string }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    ward: string;
    district: string;
    city: string;
  };
  shippingMethod: string;
  paymentMethod: string;
}

export const getOrderConfirmationProTemplate = (
  firstName: string,
  params: OrderConfirmationProParams
) => {
  const subject = `🎉 Đặt hàng thành công #${params.orderNumber} - Fashion Store`;

  // Payment method labels
  const paymentLabels: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng/Ghi nợ',
    momo: 'Ví MoMo',
    visa: 'Thẻ Visa/Mastercard'
  };

  // Shipping method labels
  const shippingLabels: Record<string, string> = {
    standard: 'Giao hàng tiêu chuẩn (2-3 ngày)',
    express: 'Giao hàng nhanh (1-2 ngày)',
    same_day: 'Giao hàng trong ngày'
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
          <table width="700" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:48px 40px;text-align:center;">
              <div style="font-size:72px;margin-bottom:16px;line-height:1;">🎉</div>
              <h1 style="margin:0;font-size:32px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Đặt Hàng Thành Công!</h1>
              <p style="margin:12px 0 0;font-size:18px;color:rgba(255,255,255,0.95);font-weight:500;">Cảm ơn bạn đã tin tưởng và lựa chọn Fashion Store</p>
            </td></tr>

            <!-- Order Badge -->
            <tr><td style="padding:0 40px;">
              <div style="background:#10b98115;border:2px solid #10b981;border-radius:12px;padding:24px;margin-top:-30px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                <div style="font-size:13px;color:#718096;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Mã đơn hàng</div>
                <div style="font-size:28px;font-weight:700;color:#10b981;letter-spacing:-0.5px;">#${params.orderNumber}</div>
              </div>
            </td></tr>

            <!-- Welcome Message -->
            <tr><td style="padding:40px 40px 24px;">
              <h2 style="margin:0 0 16px;font-size:22px;color:#1a202c;font-weight:600;">Kính gửi ${firstName},</h2>
              <p style="margin:0 0 12px;color:#4a5568;font-size:16px;line-height:1.8;">
                Chúng tôi xin chân thành cảm ơn quý khách đã tin tưởng và lựa chọn mua sắm tại <strong>Fashion Store</strong>. 
                Đơn hàng của quý khách đã được tiếp nhận và ghi nhận thành công trong hệ thống của chúng tôi.
              </p>
              <p style="margin:0;color:#4a5568;font-size:16px;line-height:1.8;">
                Đội ngũ của chúng tôi sẽ tiến hành xác nhận và chuẩn bị đơn hàng một cách cẩn thận nhất. 
                Quý khách sẽ nhận được email thông báo cập nhật trạng thái đơn hàng ở từng bước xử lý.
              </p>
            </td></tr>

            <!-- Order Items -->
            <tr><td style="padding:0 40px 24px;">
              <h3 style="margin:0 0 16px;font-size:18px;color:#1a202c;font-weight:600;">📦 Chi tiết đơn hàng</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                ${itemsHtml}
              </table>
            </td></tr>

            <!-- Order Summary -->
            <tr><td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:8px 0;color:#718096;font-size:15px;">Tạm tính</td>
                  <td style="padding:8px 0;text-align:right;color:#4a5568;font-size:15px;font-weight:600;">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.subtotal)}
                  </td>
                </tr>
                ${params.discount ? `
                <tr>
                  <td style="padding:8px 0;color:#718096;font-size:15px;">Khuyến mại</td>
                  <td style="padding:8px 0;text-align:right;color:#ef4444;font-size:15px;font-weight:600;">
                    -${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.discount)}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding:8px 0;color:#718096;font-size:15px;">Phí vận chuyển</td>
                  <td style="padding:8px 0;text-align:right;color:${params.shipping === 0 ? '#10b981' : '#4a5568'};font-size:15px;font-weight:600;">
                    ${params.shipping === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.shipping)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:16px 0 0;border-top:2px solid #e2e8f0;"></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:18px;font-weight:700;color:#1a202c;">Tổng cộng</td>
                  <td style="padding:8px 0;text-align:right;font-size:24px;font-weight:700;color:#10b981;">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.total)}
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- Addresses Section -->
            <tr><td style="padding:0 40px 24px;">
              <h3 style="margin:0 0 16px;font-size:18px;color:#1a202c;font-weight:600;">📍 Thông tin giao hàng</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="vertical-align:top;padding-right:12px;">
                    <div style="background:#f7fafc;border-radius:12px;padding:20px;height:100%;border:1px solid #e2e8f0;">
                      <h4 style="margin:0 0 12px;font-size:14px;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📤 Địa chỉ gửi hàng</h4>
                      <p style="margin:0;color:#1a202c;font-size:15px;line-height:1.7;font-weight:600;">Fashion Store</p>
                      <p style="margin:8px 0 0;color:#4a5568;font-size:14px;line-height:1.6;">
                        Hotline: 1900-xxxx<br>
                        Email: support@fashionstore.com<br>
                        123 Đường ABC, Quận XYZ<br>
                        TP. Hồ Chí Minh, Việt Nam
                      </p>
                    </div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top;padding-left:12px;">
                    <div style="background:#f7fafc;border-radius:12px;padding:20px;height:100%;border:1px solid #e2e8f0;">
                      <h4 style="margin:0 0 12px;font-size:14px;color:#718096;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">📥 Địa chỉ nhận hàng</h4>
                      <p style="margin:0;color:#1a202c;font-size:15px;line-height:1.7;font-weight:600;">${params.shippingAddress.fullName}</p>
                      <p style="margin:8px 0 0;color:#4a5568;font-size:14px;line-height:1.6;">
                        ${params.shippingAddress.phone}<br>
                        ${params.shippingAddress.email ? params.shippingAddress.email + '<br>' : ''}
                        ${params.shippingAddress.address}<br>
                        ${params.shippingAddress.ward}, ${params.shippingAddress.district}<br>
                        ${params.shippingAddress.city}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- Shipping & Payment Info -->
            <tr><td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="vertical-align:top;padding-right:12px;">
                    <div style="background:#dbeafe;border-radius:12px;padding:20px;border-left:4px solid #3b82f6;">
                      <h4 style="margin:0 0 8px;font-size:14px;color:#1e40af;font-weight:600;">🚚 Hình thức giao hàng</h4>
                      <p style="margin:0;color:#1e3a8a;font-size:15px;font-weight:500;">
                        ${shippingLabels[params.shippingMethod] || params.shippingMethod}
                      </p>
                    </div>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top;padding-left:12px;">
                    <div style="background:#fef3c7;border-radius:12px;padding:20px;border-left:4px solid #f59e0b;">
                      <h4 style="margin:0 0 8px;font-size:14px;color:#92400e;font-weight:600;">💳 Phương thức thanh toán</h4>
                      <p style="margin:0;color:#78350f;font-size:15px;font-weight:500;">
                        ${paymentLabels[params.paymentMethod] || params.paymentMethod}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- Timeline -->
            <tr><td style="padding:0 40px 32px;">
              <h3 style="margin:0 0 16px;font-size:18px;color:#1a202c;font-weight:600;">📍 Quy trình xử lý đơn hàng</h3>
              <div style="background:#f7fafc;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
                <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px dashed #e2e8f0;">
                  <div style="display:flex;align-items:start;">
                    <div style="background:#10b981;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
                      <span style="font-weight:700;color:#fff;font-size:14px;">✓</span>
                    </div>
                    <div>
                      <strong style="color:#1a202c;font-size:15px;">Đã tiếp nhận đơn hàng</strong><br>
                      <span style="color:#718096;font-size:14px;">Đơn hàng của quý khách đã được ghi nhận trong hệ thống</span>
                    </div>
                  </div>
                </div>
                <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px dashed #e2e8f0;">
                  <div style="display:flex;align-items:start;">
                    <div style="background:#3b82f6;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
                      <span style="font-weight:700;color:#fff;font-size:14px;">2</span>
                    </div>
                    <div>
                      <strong style="color:#1a202c;font-size:15px;">Xác nhận đơn hàng</strong><br>
                      <span style="color:#718096;font-size:14px;">Chúng tôi sẽ xác nhận đơn hàng trong vòng 24 giờ làm việc</span>
                    </div>
                  </div>
                </div>
                <div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px dashed #e2e8f0;">
                  <div style="display:flex;align-items:start;">
                    <div style="background:#8b5cf6;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
                      <span style="font-weight:700;color:#fff;font-size:14px;">3</span>
                    </div>
                    <div>
                      <strong style="color:#1a202c;font-size:15px;">Chuẩn bị hàng</strong><br>
                      <span style="color:#718096;font-size:14px;">Đóng gói cẩn thận và kiểm tra chất lượng sản phẩm</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div style="display:flex;align-items:start;">
                    <div style="background:#06b6d4;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-right:12px;flex-shrink:0;">
                      <span style="font-weight:700;color:#fff;font-size:14px;">4</span>
                    </div>
                    <div>
                      <strong style="color:#1a202c;font-size:15px;">Giao hàng</strong><br>
                      <span style="color:#718096;font-size:14px;">Thời gian dự kiến: 2-3 ngày làm việc</span>
                    </div>
                  </div>
                </div>
              </div>
            </td></tr>

            <!-- Important Notes -->
            <tr><td style="padding:0 40px 32px;">
              <div style="background:#dbeafe;border-left:4px solid #3b82f6;padding:20px;border-radius:8px;">
                <h4 style="margin:0 0 12px;font-size:16px;color:#1e40af;font-weight:600;">💡 Lưu ý quan trọng</h4>
                <ul style="margin:0;padding-left:20px;color:#1e3a8a;line-height:1.8;">
                  <li>Quý khách vui lòng kiểm tra kỹ sản phẩm trước khi thanh toán (với đơn COD)</li>
                  <li>Nếu có bất kỳ vấn đề gì, vui lòng liên hệ ngay hotline: <strong>1900-xxxx</strong></li>
                  <li>Quý khách sẽ nhận được email thông báo ở mỗi bước cập nhật đơn hàng</li>
                  <li>Đơn hàng có thể được đổi/trả trong vòng 7 ngày nếu còn nguyên tem mác</li>
                </ul>
              </div>
            </td></tr>

            <!-- CTA Button -->
            <tr><td style="padding:0 40px 40px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders" 
                 style="display:inline-block;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#fff;text-decoration:none;padding:18px 48px;border-radius:50px;font-weight:600;font-size:16px;box-shadow:0 4px 12px rgba(16,185,129,0.4);">
                Theo dõi đơn hàng
              </a>
            </td></tr>

            <!-- Support Section -->
            <tr><td style="padding:32px 40px;background:#f7fafc;border-top:1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding-right:20px;">
                    <div style="margin-bottom:8px;font-weight:600;color:#1a202c;font-size:15px;">📞 Hỗ trợ khách hàng</div>
                    <div style="color:#718096;font-size:14px;line-height:1.6;">
                      Hotline: <strong style="color:#1a202c;">1900-xxxx</strong><br>
                      Email: <a href="mailto:support@fashionstore.com" style="color:#10b981;text-decoration:none;">support@fashionstore.com</a><br>
                      Thời gian: 8:00 - 22:00 (Tất cả các ngày)
                    </div>
                  </td>
                  <td width="50%" style="padding-left:20px;border-left:1px solid #e2e8f0;">
                    <div style="margin-bottom:8px;font-weight:600;color:#1a202c;font-size:15px;">🎁 Ưu đãi đặc biệt</div>
                    <div style="color:#718096;font-size:14px;line-height:1.6;">
                      Giảm <strong style="color:#ef4444;">10%</strong> cho đơn hàng tiếp theo<br>
                      Mã: <strong style="color:#10b981;">THANKYOU10</strong><br>
                      <span style="font-size:12px;color:#9ca3af;">Áp dụng cho đơn từ 500.000đ</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td></tr>

            <!-- Footer -->
            <tr><td style="padding:32px 40px;text-align:center;background:#1a202c;color:#fff;">
              <div style="margin-bottom:16px;">
                <a href="#" style="color:#fff;text-decoration:none;margin:0 12px;font-size:14px;">Facebook</a>
                <a href="#" style="color:#fff;text-decoration:none;margin:0 12px;font-size:14px;">Instagram</a>
                <a href="#" style="color:#fff;text-decoration:none;margin:0 12px;font-size:14px;">Website</a>
              </div>
              <div style="font-size:14px;color:#a0aec0;line-height:1.6;">
                <strong style="color:#fff;font-size:16px;">FASHION STORE</strong><br>
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh<br>
                © 2025 Fashion Store. All rights reserved.
              </div>
            </td></tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>`;

  const text = `
🎉 ĐẶT HÀNG THÀNH CÔNG

Kính gửi ${firstName},

Chúng tôi xin chân thành cảm ơn quý khách đã tin tưởng và lựa chọn mua sắm tại Fashion Store.

MÃ ĐƠN HÀNG: #${params.orderNumber}

CHI TIẾT ĐƠN HÀNG:
${params.items.map(i => `- ${i.name} × ${i.quantity}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(i.price * i.quantity)}`).join('\n')}

TÓM TẮT ĐƠN HÀNG:
Tạm tính: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.subtotal)}
${params.discount ? `Khuyến mại: -${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.discount)}\n` : ''}Phí vận chuyển: ${params.shipping === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.shipping)}
Tổng cộng: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.total)}

ĐỊA CHỈ NHẬN HÀNG:
${params.shippingAddress.fullName}
${params.shippingAddress.phone}
${params.shippingAddress.address}, ${params.shippingAddress.ward}, ${params.shippingAddress.district}, ${params.shippingAddress.city}

HÌNH THỨC GIAO HÀNG: ${shippingLabels[params.shippingMethod] || params.shippingMethod}
PHƯƠNG THỨC THANH TOÁN: ${paymentLabels[params.paymentMethod] || params.paymentMethod}

QUY TRÌNH XỬ LÝ:
✓ Đã tiếp nhận đơn hàng
→ Xác nhận đơn hàng (24h)
→ Chuẩn bị hàng
→ Giao hàng (2-3 ngày)

Theo dõi đơn hàng: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?tab=orders

HỖ TRỢ KHÁCH HÀNG:
Hotline: 1900-xxxx
Email: support@fashionstore.com

Trân trọng,
Fashion Store Team`.trim();

  return { subject, html, text };
};
