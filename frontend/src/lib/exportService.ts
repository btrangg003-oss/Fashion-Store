// Export Service - Xuất dữ liệu ra Excel/CSV
import { Order } from '@/types/orders';

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất');
    return;
  }

  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export const exportOrdersToCSV = (orders: Order[]) => {
  const data = orders.map(order => ({
    'Mã đơn': order.orderNumber || order.id,
    'Khách hàng': (order as any).customerName || order.shippingAddress?.fullName,
    'Email': (order as any).customerEmail || '',
    'Số điện thoại': (order as any).customerPhone || order.shippingAddress?.phone,
    'Tổng tiền': order.total,
    'Trạng thái': order.status,
    'Thanh toán': (order as any).paymentMethod || '',
    'Ngày tạo': new Date(order.createdAt).toLocaleString('vi-VN')
  }));

  exportToCSV(data, 'orders');
};

export const exportProductsToCSV = (products: any[]) => {
  const data = products.map(product => ({
    'Mã SP': product.id,
    'Tên': product.name,
    'Giá': product.price,
    'Tồn kho': product.stock,
    'Danh mục': product.category,
    'Trạng thái': product.status
  }));

  exportToCSV(data, 'products');
};

export const exportCustomersToCSV = (customers: any[]) => {
  const data = customers.map(customer => ({
    'ID': customer.id,
    'Tên': customer.name,
    'Email': customer.email,
    'Số điện thoại': customer.phone,
    'Tổng đơn': customer.totalOrders,
    'Tổng chi tiêu': customer.totalSpent,
    'Ngày đăng ký': new Date(customer.createdAt).toLocaleString('vi-VN')
  }));

  exportToCSV(data, 'customers');
};

// Print Invoice
export const printInvoice = (order: Order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hóa đơn #${order.orderNumber || order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .total { font-size: 18px; font-weight: bold; text-align: right; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HÓA ĐƠN BÁN HÀNG</h1>
        <p>Mã đơn: ${order.orderNumber || order.id}</p>
        <p>Ngày: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
      </div>
      
      <div class="info">
        <h3>Thông tin khách hàng:</h3>
        <p>Tên: ${(order as any).customerName || order.shippingAddress?.fullName}</p>
        <p>SĐT: ${(order as any).customerPhone || order.shippingAddress?.phone}</p>
        <p>Địa chỉ: ${order.shippingAddress?.address}, ${order.shippingAddress?.ward}, ${order.shippingAddress?.district}, ${order.shippingAddress?.city}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${order.items?.map((item: any, index: number) => `
            <tr>
              <td>${index + 1}</td>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>${item.price.toLocaleString('vi-VN')}đ</td>
              <td>${(item.price * item.quantity).toLocaleString('vi-VN')}đ</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total">
        <p>Tạm tính: ${(order as any).subtotal?.toLocaleString('vi-VN')}đ</p>
        <p>Phí vận chuyển: ${(order.shipping || (order as any).shippingFee || 0).toLocaleString('vi-VN')}đ</p>
        <p>Tổng cộng: ${order.total.toLocaleString('vi-VN')}đ</p>
      </div>

      <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer;">
        In hóa đơn
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};

export default {
  exportToCSV,
  exportOrdersToCSV,
  exportProductsToCSV,
  exportCustomersToCSV,
  printInvoice
};
