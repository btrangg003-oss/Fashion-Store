import ExcelJS from 'exceljs';

interface Product {
  id: string;
  sku: string;
  name: string;
  collection?: string;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: string;
  createdAt: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
}

export async function exportProductsToExcel(products: Product[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sản phẩm');

  // Set up columns
  worksheet.columns = [
    { header: 'Mã SP', key: 'sku', width: 20 },
    { header: 'Tên sản phẩm', key: 'name', width: 35 },
    { header: 'Bộ sưu tập', key: 'collection', width: 20 },
    { header: 'Danh mục', key: 'category', width: 15 },
    { header: 'Giá bán', key: 'price', width: 15 },
    { header: 'Giá sale', key: 'salePrice', width: 15 },
    { header: 'Giảm giá', key: 'discount', width: 12 },
    { header: 'Tồn kho', key: 'stock', width: 12 },
    { header: 'Trạng thái', key: 'status', width: 12 },
    { header: 'Sizes', key: 'sizes', width: 20 },
    { header: 'Màu sắc', key: 'colors', width: 20 },
    { header: 'Ngày tạo', key: 'createdAt', width: 20 }
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
    fgColor: { argb: '3B82F6' }
  };
  headerRow.alignment = { 
    vertical: 'middle', 
    horizontal: 'center' 
  };
  headerRow.height = 35;

  // Add data rows
  products.forEach((product, index) => {
    const discount = product.salePrice 
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0;

    const row = worksheet.addRow({
      sku: product.sku,
      name: product.name,
      collection: product.collection || 'N/A',
      category: product.category,
      price: product.price,
      salePrice: product.salePrice || product.price,
      discount: discount > 0 ? `${discount}%` : '-',
      stock: product.stock,
      status: product.status === 'active' ? 'Hoạt động' : 'Nháp',
      sizes: product.sizes?.join(', ') || 'N/A',
      colors: product.colors?.join(', ') || 'N/A',
      createdAt: new Date(product.createdAt).toLocaleDateString('vi-VN', {
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

    // Format currency columns
    row.getCell('price').numFmt = '#,##0 "₫"';
    row.getCell('salePrice').numFmt = '#,##0 "₫"';
    
    // Center align some columns
    row.getCell('sku').alignment = { horizontal: 'center' };
    row.getCell('stock').alignment = { horizontal: 'center' };
    row.getCell('discount').alignment = { horizontal: 'center' };
    row.getCell('status').alignment = { horizontal: 'center' };

    // Status color coding
    const statusCell = row.getCell('status');
    if (product.status === 'active') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D1FAE5' }
      };
      statusCell.font = { color: { argb: '065F46' }, bold: true };
    } else {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FEE2E2' }
      };
      statusCell.font = { color: { argb: '991B1B' }, bold: true };
    }

    // Stock warning (low stock)
    const stockCell = row.getCell('stock');
    if (product.stock < 10) {
      stockCell.font = { color: { argb: 'DC2626' }, bold: true };
    }
  });

  // Add auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: 'L1'
  };

  // Freeze first row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Add summary row at the bottom
  const summaryRow = worksheet.addRow({
    sku: 'TỔNG CỘNG',
    name: '',
    collection: '',
    category: '',
    price: '',
    salePrice: '',
    discount: '',
    stock: products.reduce((sum, p) => sum + p.stock, 0),
    status: `${products.length} sản phẩm`,
    sizes: '',
    colors: '',
    createdAt: ''
  });

  summaryRow.font = { bold: true, size: 12 };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'E5E7EB' }
  };

  // Add borders to all cells
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'D1D5DB' } },
        left: { style: 'thin', color: { argb: 'D1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
        right: { style: 'thin', color: { argb: 'D1D5DB' } }
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
