// Utility functions for printing invoices

export const printInvoice = (order: unknown) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    alert('Vui lòng cho phép popup để in hóa đơn');
    return;
  }

  const invoiceHTML = generateInvoiceHTML(order);

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

export const generateInvoiceHTML = (order: unknown): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getPaymentMethodText = (method: string) => {
    const map: unknown = {
      cod: 'Thanh toán khi nhận hàng',
      banking: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo',
      atm: 'Thẻ ATM',
      credit: 'Thẻ tín dụng'
    };
    return map[method] || method;
  };

  const getStatusText = (status: string) => {
    const map: unknown = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    };
    return map[status] || status;
  };

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hóa đơn ${order.orderNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
          line-height: 1.4;
          color: #000;
          background: white;
          padding: 15mm;
        }
        
        .invoice-container {
          max-width: 80mm;
          margin: 0 auto;
        }
        
        @media print {
          body {
            padding: 5mm;
            font-size: 12px;
          }
          
          .invoice-container {
            max-width: 100%;
          }
          
          .logo {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
          
          .invoice-title {
            font-size: 16px;
          }
          
          .company-name {
            font-size: 16px;
          }
          
          .products-table th,
          .products-table td {
            padding: 5px;
            font-size: 11px;
          }
          
          .thank-you {
            font-size: 14px;
          }
          
          .print-info {
            font-size: 10px;
          }
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .company-info {
          flex: 1;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: #667eea;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .company-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        
        .company-phone {
          font-size: 14px;
          margin-bottom: 5px;
        }
        
        .invoice-id {
          text-align: right;
          font-size: 14px;
          font-weight: bold;
        }
        
        .invoice-title {
          text-align: center;
          font-size: 20px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 2px;
        }
        
        .customer-info {
          margin-bottom: 20px;
        }
        
        .customer-info div {
          margin-bottom: 5px;
        }
        
        .customer-name {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
          padding: 8px 0;
          border-bottom: 1px solid #ccc;
          text-transform: uppercase;
        }
        
        .customer-info {
          margin-bottom: 20px;
        }
        
        .customer-info div {
          margin-bottom: 3px;
        }
        
        .products-section {
          margin-bottom: 30px;
        }
        
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        .products-table th,
        .products-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
        }
        
        .products-table th {
          font-weight: bold;
          background: #f0f0f0;
          font-size: 13px;
        }
        
        .products-table td:nth-child(2) {
          text-align: left;
        }
        
        .products-table td:nth-child(3),
        .products-table td:nth-child(4),
        .products-table td:nth-child(5) {
          text-align: right;
        }
        
        .summary-section {
          margin-bottom: 15px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          padding: 3px 0;
        }
        
        .total-row {
          font-weight: bold;
          font-size: 16px;
          text-transform: uppercase;
          border-top: 1px solid #000;
          padding-top: 8px;
          margin-top: 8px;
        }
        
        .thank-you {
          text-align: center;
          font-weight: bold;
          text-transform: uppercase;
          margin: 20px 0;
          font-size: 16px;
        }
        
        .notes-section {
          margin-bottom: 30px;
        }
        
        .notes-content {
          padding: 15px;
          border: 1px solid #ccc;
          background: #f5f5f5;
          border-radius: 4px;
        }
        
        .notes-section {
          margin-bottom: 20px;
          padding: 10px;
          border: 1px dashed #ccc;
        }
        
        .print-info {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        
        .print-info div {
          margin-bottom: 3px;
        }
        
        .print-info {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          font-size: 12px;
          color: #000;
          text-align: center;
        }
        
        .print-info div {
          margin-bottom: 5px;
        }
        
        @media print {
          body {
            padding: 15mm;
            font-size: 12px;
          }
          
          .invoice-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
          }
          
          .logo-text {
            font-size: 20px;
          }
          
          .company-details {
            font-size: 11px;
          }
          
          .invoice-title h1 {
            font-size: 20px;
          }
          
          .invoice-number {
            font-size: 14px;
          }
          
          .invoice-date {
            font-size: 12px;
          }
          
          .section-title {
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .customer-section,
          .products-section,
          .summary-section,
          .notes-section {
            margin-bottom: 20px;
          }
          
          .customer-grid {
            gap: 20px;
          }
          
          .info-row {
            margin-bottom: 6px;
          }
          
          .info-label {
            min-width: 100px;
          }
          
          .products-table th,
          .products-table td {
            padding: 6px;
            font-size: 11px;
          }
          
          .summary-table td {
            padding: 6px 10px;
          }
          
          .total-row td {
            font-size: 14px;
          }
          
          .notes-content {
            padding: 10px;
          }
          
          .invoice-footer {
            margin-top: 30px;
            margin-bottom: 20px;
          }
          
          .footer-title {
            margin-bottom: 40px;
          }
          
          .footer-signature {
            font-size: 11px;
          }
          
          .print-info {
            font-size: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
          <div class="company-info">
            <div class="logo">FS</div>
            <div class="company-name">Fashion Store</div>
            <div class="company-phone">SĐT: (028) 1234 5678</div>
          </div>
          <div class="invoice-id">
            <div>ID Hóa đơn: ${order.orderNumber}</div>
          </div>
        </div>
        
        <div class="invoice-title">HÓA ĐƠN BÁN HÀNG</div>
        
        <div class="customer-info">
          <div class="customer-name">Tên khách hàng: ${order.shippingAddress?.fullName || order.customerName || 'N/A'}</div>
          <div>Ngày mua: ${formatDate(order.createdAt)}</div>
          <div>SĐT khách hàng: ${order.shippingAddress?.phone || order.customerPhone || 'N/A'}</div>
          <div>Điểm tích lũy: 0 điểm</div>
          <div>Hạng thành viên: Thành viên mới</div>
        </div>

        <!-- Products Table -->
        <table class="products-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>SL</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${order.items?.map((item: unknown, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` - ${item.color}` : ''}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>

        <!-- Summary -->
        <div class="summary-section">
          <div class="summary-row">
            <span>Tổng tiền:</span>
            <span>${formatPrice(order.subtotal || 0)} VNĐ</span>
          </div>
          <div class="summary-row">
            <span>Phí vận chuyển:</span>
            <span>${formatPrice(order.shipping || order.shippingFee || 0)} VNĐ</span>
          </div>
          <div class="summary-row">
            <span>Giảm giá:</span>
            <span>${formatPrice((order.subtotal || 0) + (order.shipping || order.shippingFee || 0) - (order.total || 0))} VNĐ</span>
          </div>
          <div class="summary-row total-row">
            <span>Tổng cộng:</span>
            <span>${formatPrice(order.total || 0)} VNĐ</span>
          </div>
        </div>

        ${order.notes ? `
        <div class="notes-section">
          <div><strong>Ghi chú:</strong></div>
          <div>${order.notes}</div>
        </div>
        ` : ''}

        <div class="thank-you">
          Fashion Store cảm ơn quý khách
        </div>

        <!-- Print Info -->
        <div class="print-info">
          <div>Hóa đơn in lúc: ${new Date().toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}</div>
          <div>Nhân viên in: Admin</div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadInvoicePDF = async (order: unknown) => {
  // This would require a PDF generation library like jsPDF or Puppeteer
  // For now, we'll use the print functionality
  printInvoice(order);
};

export const emailInvoice = async (order: unknown, email: string) => {
  try {
    const response = await fetch('/api/admin/email-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId: order.id,
        email: email,
        invoiceHTML: generateInvoiceHTML(order)
      }),
    });

    if (response.ok) {
      alert('Hóa đơn đã được gửi qua email thành công!');
    } else {
      throw new Error('Không thể gửi email');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    alert('Có lỗi xảy ra khi gửi email');
  }
};