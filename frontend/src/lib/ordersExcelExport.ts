import ExcelJS from 'exceljs';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  createdAt: string;
  items: any[];
  shippingAddress?: any;
  discount?: number;
}

export async function exportOrdersToExcel(orders: Order[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Worksheet 1: Orders Summary
  const worksheet = workbook.addWorksheet('Đơn hàng');

  // Set up columns
  worksheet.columns = [
    { header: 'Mã đơn', key: 'orderNumber', width: 15 },
    { header: 'Khách hàng', key: 'customerName', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'SĐT', key: 'phone', width: 15 },
    { header: 'Tổng tiền', key: 'total', width: 15 },
    { header: 'Giảm giá', key: 'discount', width: 15 },
    { header: 'Thực thu', key: 'finalTotal', width: 15 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Thanh toán', key: 'paymentStatus', width: 15 },
    { header: 'PT Thanh toán', key: 'paymentMethod', width: 15 },
    { header: 'Vận chuyển', key: 'shippingMethod', width: 15 },
    { header: 'Số SP', key: 'itemCount', width: 10 },
    { header: 'Ngày đặt', key: 'createdAt', width: 20 }
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { 
    bold: true, 
    color: { argb: 'FFFFFF' }, 
    size: 12,
    name: 'Arial'
  };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '10B981' }
  };
  headerRow.alignment = { 
    vertical: 'middle', 
    horizontal: 'center' 
  };
  headerRow.height = 35;

  // Add data rows
  orders.forEach((order, index) => {
    const finalTotal = order.total - (order.discount || 0);
    
    const row = worksheet.addRow({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      total: order.total,
      discount: order.discount || 0,
      finalTotal: finalTotal,
      status: getStatusText(order.status),
      paymentStatus: order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
      paymentMethod: getPaymentMethodText(order.paymentMethod),
      shippingMethod: getShippingMethodText(order.shippingMethod),
      itemCount: order.items?.length || 0,
      createdAt: new Date(order.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    });

    // Alternating row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };
    }

    // Format currency
    row.getCell('total').numFmt = '#,##0 "₫"';
    row.getCell('discount').numFmt = '#,##0 "₫"';
    row.getCell('finalTotal').numFmt = '#,##0 "₫"';
    
    // Center align
    row.getCell('orderNumber').alignment = { horizontal: 'center' };
    row.getCell('itemCount').alignment = { horizontal: 'center' };

    // Status color coding
    const statusCell = row.getCell('status');
    const statusColor = getStatusColor(order.status);
    statusCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: statusColor }
    };
    statusCell.font = { bold: true };
    statusCell.alignment = { horizontal: 'center' };

    // Payment status color
    const paymentCell = row.getCell('paymentStatus');
    if (order.paymentStatus === 'paid') {
      paymentCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D1FAE5' }
      };
      paymentCell.font = { color: { argb: '065F46' }, bold: true };
    } else {
      paymentCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FEF3C7' }
      };
      paymentCell.font = { color: { argb: '92400E' }, bold: true };
    }
    paymentCell.alignment = { horizontal: 'center' };
  });

  // Add auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'M1'
  };

  // Freeze first row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Add summary row
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalDiscount = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
  const totalFinal = totalRevenue - totalDiscount;
  const totalItems = orders.reduce((sum, order) => sum + (order.items?.length || 0), 0);
  
  const summaryRow = worksheet.addRow({
    orderNumber: 'TỔNG CỘNG',
    customerName: '',
    email: '',
    phone: '',
    total: totalRevenue,
    discount: totalDiscount,
    finalTotal: totalFinal,
    status: `${orders.length} đơn`,
    paymentStatus: '',
    paymentMethod: '',
    shippingMethod: '',
    itemCount: totalItems,
    createdAt: ''
  });

  summaryRow.font = { bold: true, size: 12 };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'E5E7EB' }
  };
  summaryRow.getCell('total').numFmt = '#,##0 "₫"';
  summaryRow.getCell('discount').numFmt = '#,##0 "₫"';
  summaryRow.getCell('finalTotal').numFmt = '#,##0 "₫"';

  // Add borders to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D1D5DB' } },
        left: { style: 'thin', color: { argb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
        right: { style: 'thin', color: { argb: 'D1D5DB' } }
      };
    });
  });

  // Worksheet 2: Order Details
  const detailSheet = workbook.addWorksheet('Chi tiết đơn hàng');
  
  detailSheet.columns = [
    { header: 'Mã đơn', key: 'orderNumber', width: 15 },
    { header: 'Sản phẩm', key: 'productName', width: 30 },
    { header: 'SKU', key: 'sku', width: 15 },
    { header: 'Size', key: 'size', width: 10 },
    { header: 'Màu', key: 'color', width: 15 },
    { header: 'Số lượng', key: 'quantity', width: 10 },
    { header: 'Đơn giá', key: 'price', width: 15 },
    { header: 'Thành tiền', key: 'subtotal', width: 15 }
  ];

  // Style detail header
  const detailHeader = detailSheet.getRow(1);
  detailHeader.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
  detailHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '3B82F6' }
  };
  detailHeader.alignment = { vertical: 'middle', horizontal: 'center' };
  detailHeader.height = 35;

  // Add detail rows
  orders.forEach((order) => {
    order.items?.forEach((item: any) => {
      const row = detailSheet.addRow({
        orderNumber: order.orderNumber,
        productName: item.name,
        sku: item.sku || 'N/A',
        size: item.size || 'N/A',
        color: item.color || 'N/A',
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      });

      row.getCell('price').numFmt = '#,##0 "₫"';
      row.getCell('subtotal').numFmt = '#,##0 "₫"';
      row.getCell('quantity').alignment = { horizontal: 'center' };
    });
  });

  detailSheet.autoFilter = { from: 'A1', to: 'H1' };
  detailSheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    returned: 'Đã trả hàng'
  };
  return map[status] || status;
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'FEF3C7',
    confirmed: 'DBEAFE',
    processing: 'E0F2FE',
    shipping: 'BFDBFE',
    delivered: 'D1FAE5',
    cancelled: 'FEE2E2',
    returned: 'FED7AA'
  };
  return map[status] || 'FFFFFF';
}

function getPaymentMethodText(method: string): string {
  const map: Record<string, string> = {
    cod: 'COD',
    bank_transfer: 'Chuyển khoản',
    credit_card: 'Thẻ tín dụng',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay'
  };
  return map[method] || method;
}

function getShippingMethodText(method: string): string {
  const map: Record<string, string> = {
    standard: 'Tiêu chuẩn',
    express: 'Nhanh',
    same_day: 'Trong ngày'
  };
  return map[method] || method;
}
