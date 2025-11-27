/**
 * Excel Export Service
 * Xuất dữ liệu khách hàng ra file Excel với styling đẹp
 */

import ExcelJS from 'exceljs';

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tier?: string;
  status?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  lastOrderDate?: string;
}

export async function exportCustomersToExcel(customers: Customer[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Khách hàng', {
    properties: { tabColor: { argb: '3B82F6' } }
  });

  // Định nghĩa columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 30 },
    { header: 'Họ tên', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Số điện thoại', key: 'phone', width: 15 },
    { header: 'Hạng', key: 'tier', width: 15 },
    { header: 'Trạng thái', key: 'status', width: 15 },
    { header: 'Số đơn hàng', key: 'totalOrders', width: 15 },
    { header: 'Tổng chi tiêu', key: 'totalSpent', width: 20 },
    { header: 'Ngày tham gia', key: 'createdAt', width: 20 },
    { header: 'Đơn hàng cuối', key: 'lastOrderDate', width: 20 }
  ];

  // Style cho header
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '3B82F6' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;

  // Thêm data
  customers.forEach((customer, index) => {
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';
    
    const row = worksheet.addRow({
      id: customer.id,
      name: fullName,
      email: customer.email,
      phone: customer.phone || 'N/A',
      tier: getTierText(customer.tier),
      status: getStatusText(customer.status),
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      createdAt: formatDate(customer.createdAt),
      lastOrderDate: customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Chưa có'
    });

    // Alternating row colors
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F9FAFB' }
      };
    }

    // Tier color
    const tierCell = row.getCell('tier');
    tierCell.font = { bold: true };
    tierCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: getTierColor(customer.tier) }
    };

    // Status color
    const statusCell = row.getCell('status');
    statusCell.font = { bold: true };
    statusCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: getStatusColor(customer.status) }
    };

    // Format currency
    const spentCell = row.getCell('totalSpent');
    spentCell.numFmt = '#,##0 "đ"';
    spentCell.alignment = { horizontal: 'right' };

    // Center align
    row.getCell('totalOrders').alignment = { horizontal: 'center' };
  });

  // Auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: `J1`
  };

  // Freeze panes
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Border cho tất cả cells
  worksheet.eachRow((row: any, rowNumber: any) => {
    row.eachCell((cell: any) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E5E7EB' } },
        left: { style: 'thin', color: { argb: 'E5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
        right: { style: 'thin', color: { argb: 'E5E7EB' } }
      };
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function getTierText(tier?: string): string {
  switch (tier) {
    case 'new': return 'Mới';
    case 'regular': return 'Thân thiết';
    case 'vip': return 'VIP';
    default: return 'N/A';
  }
}

function getTierColor(tier?: string): string {
  switch (tier) {
    case 'new': return 'D1FAE5';
    case 'regular': return 'F3F4F6';
    case 'vip': return 'FEF3C7';
    default: return 'FFFFFF';
  }
}

function getStatusText(status?: string): string {
  switch (status) {
    case 'active': return 'Hoạt động';
    case 'blocked': return 'Đã chặn';
    case 'restricted': return 'Hạn chế';
    default: return 'N/A';
  }
}

function getStatusColor(status?: string): string {
  switch (status) {
    case 'active': return 'D1FAE5';
    case 'blocked': return 'FEE2E2';
    case 'restricted': return 'FED7AA';
    default: return 'FFFFFF';
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN');
}
