import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiPlus, FiSearch, FiEye, FiEdit, FiTrash2, FiDownload, FiPrinter, FiFileText } from 'react-icons/fi';
import { useRouter } from 'next/router';

const OutboundListPage = () => {
  const router = useRouter();
  const [movements, setMovements] = useState<any[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadMovements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movements, searchTerm, statusFilter]);

  const loadMovements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/movements?type=outbound', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMovements(data.movements || []);
      }
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...movements];

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    setFilteredMovements(filtered);
  };

  const handleView = (id: string) => {
    router.push(`/admin/inventory/outbound/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/inventory/outbound/create?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/movements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Xóa phiếu thành công!');
        loadMovements();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handlePrintBarcode = (movement: any) => {
    // Generate professional shipping label for outbound
    const barcodeWindow = window.open('', '_blank');
    if (barcodeWindow) {
      const itemsList = movement.items?.map((item: any, idx: number) => 
        `${idx + 1}. ${item.name || item.productName} - SL: ${item.quantity}`
      ).join('<br>') || 'Không có sản phẩm';

      barcodeWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Phiếu Xuất Kho - ${movement.receiptNumber}</title>
          <meta charset="UTF-8">
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              background: #f5f5f5;
            }
            .label {
              width: 100mm;
              background: white;
              border: 3px solid #000;
              margin: 0 auto;
              position: relative;
            }
            .header {
              background: #ee4d2d;
              padding: 15px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .logo {
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            .express {
              background: white;
              color: #ee4d2d;
              padding: 2px 8px;
              font-weight: bold;
              font-size: 14px;
            }
            .priority-badge {
              position: absolute;
              top: 15px;
              right: 15px;
              background: #ff6b35;
              color: white;
              padding: 8px 12px;
              font-weight: bold;
              font-size: 12px;
              border-radius: 4px;
            }
            .barcode-section {
              padding: 15px;
              border-bottom: 2px dashed #ccc;
              text-align: center;
            }
            .barcode-label {
              font-size: 11px;
              color: #666;
              margin-bottom: 5px;
            }
            .barcode-number {
              font-size: 13px;
              font-weight: bold;
              margin-top: 5px;
              font-family: 'Courier New', monospace;
            }
            .order-section {
              padding: 15px;
              border-bottom: 2px dashed #ccc;
            }
            .section-title {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .section-content {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              padding: 15px;
              border-bottom: 2px dashed #ccc;
            }
            .info-box {
              border: 2px solid #000;
              padding: 10px;
            }
            .info-label {
              background: #ff6b35;
              color: white;
              padding: 5px;
              font-size: 11px;
              font-weight: bold;
              margin: -10px -10px 10px -10px;
            }
            .info-text {
              font-size: 11px;
              line-height: 1.4;
            }
            .product-section {
              padding: 15px;
              border-bottom: 2px dashed #ccc;
            }
            .product-code {
              font-size: 20px;
              font-weight: bold;
              text-align: center;
              padding: 10px;
              border: 2px solid #000;
              margin-bottom: 10px;
            }
            .product-list {
              font-size: 11px;
              line-height: 1.6;
            }
            .qr-section {
              padding: 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .qr-code {
              text-align: center;
            }
            .qr-label {
              font-size: 9px;
              color: #666;
              margin-top: 5px;
            }
            .weight-section {
              text-align: right;
            }
            .weight-label {
              font-size: 11px;
              color: #666;
            }
            .weight-value {
              font-size: 16px;
              font-weight: bold;
            }
            .date-section {
              padding: 15px;
              border-top: 2px dashed #ccc;
              text-align: center;
            }
            .date-label {
              font-size: 11px;
              color: #666;
            }
            .date-value {
              font-size: 14px;
              font-weight: bold;
              margin-top: 5px;
            }
            .price-section {
              padding: 15px;
              border-top: 2px dashed #ccc;
            }
            .price-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .total-price {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin-top: 10px;
            }
            .signature-section {
              padding: 15px;
              border-top: 2px dashed #ccc;
              font-size: 11px;
            }
            .signature-box {
              border: 1px solid #ccc;
              padding: 10px;
              margin-top: 10px;
              min-height: 60px;
            }
            .footer {
              background: #ee4d2d;
              color: white;
              padding: 10px;
              text-align: center;
              font-size: 11px;
              font-weight: bold;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 12px 24px;
              background: #ee4d2d;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .print-button:hover {
              background: #d63d1f;
            }
            @media print {
              body { padding: 0; background: white; }
              .print-button { display: none; }
              .label { border: 2px solid #000; }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">🖨️ In Phiếu</button>
          
          <div class="label">
            <!-- Header -->
            <div class="header">
              <div class="logo">🏪 Fashion Store</div>
              <div class="express">EXPRESS</div>
              <div class="priority-badge">Mã vận đơn là duy nhất</div>
            </div>

            <!-- Barcode Section -->
            <div class="barcode-section">
              <div class="barcode-label">Mã vận đơn:</div>
              <svg id="mainBarcode"></svg>
              <div class="barcode-number">${movement.receiptNumber}</div>
              <div class="barcode-label" style="margin-top: 10px;">Mã đơn hàng: ${movement.orderNumber || movement.receiptNumber}</div>
            </div>

            <!-- Sender & Receiver Info -->
            <div class="info-grid">
              <div class="info-box">
                <div class="info-label">Thông tin Người Bán</div>
                <div class="info-text">
                  <strong>Từ:</strong><br>
                  Fashion Store VNSP<br>
                  ${movement.warehouseName || 'Kho Trung Tâm'}<br>
                  Hà Nội, Việt Nam<br>
                  SĐT: 0123456789
                </div>
              </div>
              <div class="info-box">
                <div class="info-label">Thông tin Người mua</div>
                <div class="info-text">
                  <strong>Đến:</strong> (Chi giao giờ hành chính)<br>
                  ${movement.customerName || 'Khách hàng'}<br>
                  ${movement.customerAddress || 'Địa chỉ giao hàng'}<br>
                  SĐT: ${movement.customerPhone || '-'}
                </div>
              </div>
            </div>

            <!-- Product Code -->
            <div class="product-section">
              <div class="product-code">${movement.receiptNumber.split('-')[0]}</div>
              <div class="section-title">Nội dung hàng (Tổng SL sản phẩm: ${movement.totalItems || movement.items?.length || 0})</div>
              <div class="product-list">${itemsList}</div>
            </div>

            <!-- QR Code & Weight -->
            <div class="qr-section">
              <div class="qr-code">
                <canvas id="qrcode" width="80" height="80"></canvas>
                <div class="qr-label">Mã chứa các thông tin về<br>đơn hàng bao gồm mã sản phẩm</div>
              </div>
              <div class="weight-section">
                <div class="weight-label">Khối lượng sau khi đóng gói:</div>
                <div class="weight-value">${(movement.totalItems || 1) * 0.5}kg</div>
              </div>
            </div>

            <!-- Date -->
            <div class="date-section">
              <div class="date-label">Ngày đặt hàng:</div>
              <div class="date-value">${new Date(movement.receiptDate).toLocaleDateString('vi-VN')} ${new Date(movement.receiptDate).toLocaleTimeString('vi-VN')}</div>
            </div>

            <!-- Price -->
            <div class="price-section">
              <div class="price-row">
                <span>Tiền thu Người nhận:</span>
                <span style="font-weight: bold;">Khối lượng tối đa: ${(movement.totalItems || 1) * 0.5}kg</span>
              </div>
              <div class="total-price">${(movement.finalTotal || 0).toLocaleString()} VNĐ</div>
              <div class="signature-section">
                <strong>Chữ ký người nhận:</strong><br>
                <span style="font-size: 10px;">Xác nhận hàng nguyên vẹn, không móp/méo, bể/vỡ</span>
                <div class="signature-box"></div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              Chi dẫn giao hàng: Không đồng kiểm; Chuyển hoàn sau 3 lần phát; Lưu kho tối đa 5 ngày
            </div>
          </div>

          <script>
            // Generate main barcode
            JsBarcode("#mainBarcode", "${movement.receiptNumber}", {
              format: "CODE128",
              width: 2,
              height: 60,
              displayValue: false,
              margin: 5
            });

            // Generate QR code
            const qrData = JSON.stringify({
              type: 'outbound',
              receiptNumber: '${movement.receiptNumber}',
              date: '${movement.receiptDate}',
              customer: '${movement.customerName || ''}',
              total: ${movement.finalTotal || 0},
              items: ${movement.totalItems || 0}
            });
            
            QRCode.toCanvas(document.getElementById('qrcode'), qrData, {
              width: 80,
              margin: 1
            });
          </script>
        </body>
        </html>
      `);
      barcodeWindow.document.close();
    }
  };

  const handlePrintQR = (movement: any) => {
    const qrData = JSON.stringify({
      type: 'outbound',
      receiptNumber: movement.receiptNumber,
      date: movement.receiptDate,
      customer: movement.customerName,
      total: movement.finalTotal
    });
    
    const qrWindow = window.open('', '_blank');
    if (qrWindow) {
      qrWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>In QR Code - ${movement.receiptNumber}</title>
          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            .qr-container { margin: 20px auto; padding: 20px; border: 2px solid #000; display: inline-block; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h2>Phiếu Xuất Kho</h2>
          <div class="qr-container">
            <canvas id="qrcode"></canvas>
            <p style="margin-top: 10px; font-weight: bold;">${movement.receiptNumber}</p>
          </div>
          <p>Ngày: ${new Date(movement.receiptDate).toLocaleDateString('vi-VN')}</p>
          <p>Khách hàng: ${movement.customerName || '-'}</p>
          <button onclick="window.print()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
            In QR Code
          </button>
          <script>
            QRCode.toCanvas(document.getElementById('qrcode'), ${JSON.stringify(qrData)}, {
              width: 200,
              margin: 2
            });
          </script>
        </body>
        </html>
      `);
      qrWindow.document.close();
    }
  };

  const handlePrintReceipt = (movement: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Phiếu Xuất Kho - ${movement.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
            .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PHIẾU XUẤT KHO</h1>
            <p>Mã phiếu: <strong>${movement.receiptNumber}</strong></p>
          </div>
          <div class="info">
            <p><strong>Ngày xuất:</strong> ${new Date(movement.receiptDate).toLocaleDateString('vi-VN')}</p>
            <p><strong>Lý do:</strong> ${movement.reason || movement.subType || '-'}</p>
            <p><strong>Kho xuất:</strong> ${movement.warehouseName || 'Kho chính'}</p>
            <p><strong>Khách hàng:</strong> ${movement.customerName || '-'}</p>
            <p><strong>Người xuất:</strong> ${movement.createdBy || 'Admin'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${movement.items?.map((item: any, index: number) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.productName}</td>
                  <td>${item.sku}</td>
                  <td>${item.quantity}</td>
                  <td>${(item.price || 0).toLocaleString()}₫</td>
                  <td>${((item.quantity * item.price) || 0).toLocaleString()}₫</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Tổng cộng: ${(movement.finalTotal || 0).toLocaleString()}₫</p>
          </div>
          <button onclick="window.print()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
            In Phiếu
          </button>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownloadReceipt = (movement: any) => {
    const headers = ['STT', 'Sản phẩm', 'SKU', 'Số lượng', 'Đơn giá', 'Thành tiền'];
    const rows = movement.items?.map((item: any, index: number) => [
      index + 1,
      item.productName,
      item.sku,
      item.quantity,
      item.price || 0,
      (item.quantity * item.price) || 0
    ]) || [];

    let csvContent = `Phiếu Xuất Kho\n`;
    csvContent += `Mã phiếu:,${movement.receiptNumber}\n`;
    csvContent += `Ngày xuất:,${new Date(movement.receiptDate).toLocaleDateString('vi-VN')}\n`;
    csvContent += `Lý do:,${movement.reason || movement.subType || '-'}\n`;
    csvContent += `Kho xuất:,${movement.warehouseName || 'Kho chính'}\n`;
    csvContent += `Khách hàng:,${movement.customerName || '-'}\n\n`;
    csvContent += headers.join(',') + '\n';
    rows.forEach((row: any[]) => {
      csvContent += row.join(',') + '\n';
    });
    csvContent += `\nTổng cộng:,${movement.finalTotal || 0}\n`;

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Phieu_Xuat_${movement.receiptNumber}_${Date.now()}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      draft: { label: 'Nháp', color: '#6b7280', bg: '#f3f4f6' },
      pending: { label: 'Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
      approved: { label: 'Đã duyệt', color: '#059669', bg: '#d1fae5' },
      completed: { label: 'Hoàn thành', color: '#2563eb', bg: '#dbeafe' }
    };
    return badges[status] || badges.draft;
  };

  const stats = {
    total: filteredMovements.length,
    draft: filteredMovements.filter(m => m.status === 'draft').length,
    pending: filteredMovements.filter(m => m.status === 'pending').length,
    approved: filteredMovements.filter(m => m.status === 'approved').length,
    totalValue: filteredMovements.reduce((sum, m) => sum + (m.finalTotal || 0), 0)
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>⬆️ Danh Sách Phiếu Xuất Kho</Title>
          <HeaderActions>
            <ExportButton onClick={() => alert('Xuất Excel')}>
              <FiDownload /> Xuất Excel
            </ExportButton>
            <CreateButton onClick={() => router.push('/admin/inventory/outbound/create')}>
              <FiPlus /> Tạo phiếu xuất
            </CreateButton>
          </HeaderActions>
        </Header>

        {/* Statistics */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Tổng phiếu</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Nháp</StatLabel>
            <StatValue color="#6b7280">{stats.draft}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Chờ duyệt</StatLabel>
            <StatValue color="#d97706">{stats.pending}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Đã duyệt</StatLabel>
            <StatValue color="#059669">{stats.approved}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Tổng giá trị</StatLabel>
            <StatValue color="#3b82f6">{stats.totalValue.toLocaleString()}₫</StatValue>
          </StatCard>
        </StatsGrid>

        {/* Filters */}
        <FiltersCard>
          <SearchBox>
            <FiSearch />
            <SearchInput
              type="text"
              placeholder="Tìm theo mã phiếu, khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          <FilterSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="completed">Hoàn thành</option>
          </FilterSelect>
        </FiltersCard>

        {/* Table */}
        <TableCard>
          {loading ? (
            <LoadingState>Đang tải...</LoadingState>
          ) : filteredMovements.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📦</EmptyIcon>
              <EmptyText>Chưa có phiếu xuất kho nào</EmptyText>
              <CreateButton onClick={() => router.push('/admin/inventory/outbound/create')}>
                <FiPlus /> Tạo phiếu đầu tiên
              </CreateButton>
            </EmptyState>
          ) : (
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>STT</Th>
                    <Th>Mã phiếu</Th>
                    <Th>Ngày xuất</Th>
                    <Th>Lý do</Th>
                    <Th>Kho xuất</Th>
                    <Th>Khách hàng</Th>
                    <Th style={{ minWidth: '250px' }}>Sản phẩm</Th>
                    <Th>SKU</Th>
                    <Th>Số lượng</Th>
                    <Th>Đơn vị</Th>
                    <Th>Giá vốn</Th>
                    <Th>Tổng giá</Th>
                    <Th>Trạng thái</Th>
                    <Th>Người xuất</Th>
                    <Th>Hành động</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((movement, index) => {
                    const statusBadge = getStatusBadge(movement.status);
                    
                    return movement.items?.map((item: any, itemIndex: number) => (
                      <tr key={`${movement.id}-${itemIndex}`}>
                        {itemIndex === 0 && (
                          <>
                            <Td rowSpan={movement.items.length}>{index + 1}</Td>
                            <Td rowSpan={movement.items.length}>
                              <ReceiptNumber>{movement.receiptNumber}</ReceiptNumber>
                            </Td>
                            <Td rowSpan={movement.items.length}>
                              {new Date(movement.receiptDate).toLocaleDateString('vi-VN')}
                            </Td>
                            <Td rowSpan={movement.items.length}>
                              <Reason>{movement.reason || movement.subType || '-'}</Reason>
                            </Td>
                            <Td rowSpan={movement.items.length}>{movement.warehouseName || 'Kho chính'}</Td>
                            <Td rowSpan={movement.items.length}>{movement.customerName || '-'}</Td>
                          </>
                        )}
                        <Td>
                          <ProductCell>
                            {item.image && (
                              <ProductImage src={item.image} alt={item.name || item.productName} />
                            )}
                            <ProductInfo>
                              <ProductName>{item.name || item.productName}</ProductName>
                              <ProductSKUText>SKU: {item.sku}</ProductSKUText>
                            </ProductInfo>
                          </ProductCell>
                        </Td>
                        <Td><SKU>{item.sku}</SKU></Td>
                        <Td><Quantity>{item.quantity}</Quantity></Td>
                        <Td>{item.unit || 'Cái'}</Td>
                        <Td><Price>{(item.price || 0).toLocaleString()}₫</Price></Td>
                        {itemIndex === 0 && (
                          <>
                            <Td rowSpan={movement.items.length}>
                              <TotalPrice>{(movement.finalTotal || 0).toLocaleString()}₫</TotalPrice>
                            </Td>
                            <Td rowSpan={movement.items.length}>
                              <StatusBadge color={statusBadge.color} bg={statusBadge.bg}>
                                {statusBadge.label}
                              </StatusBadge>
                            </Td>
                            <Td rowSpan={movement.items.length}>{movement.createdBy || 'Admin'}</Td>
                            <Td rowSpan={movement.items.length}>
                              <Actions>
                                <ActionButton onClick={() => handleView(movement.id)} title="Xem chi tiết">
                                  <FiEye />
                                </ActionButton>
                                {movement.status === 'draft' && (
                                  <ActionButton onClick={() => handleEdit(movement.id)} title="Chỉnh sửa">
                                    <FiEdit />
                                  </ActionButton>
                                )}
                                <ActionButton onClick={() => handlePrintReceipt(movement)} title="In phiếu">
                                  <FiPrinter />
                                </ActionButton>
                                <ActionButton onClick={() => handleDownloadReceipt(movement)} title="Tải file">
                                  <FiDownload />
                                </ActionButton>
                                <ActionButton onClick={() => handlePrintBarcode(movement)} title="In Barcode">
                                  <FiFileText />
                                </ActionButton>
                                {movement.status === 'draft' && (
                                  <ActionButton onClick={() => handleDelete(movement.id)} title="Xóa" danger>
                                    <FiTrash2 />
                                  </ActionButton>
                                )}
                              </Actions>
                            </Td>
                          </>
                        )}
                      </tr>
                    ));
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          )}
        </TableCard>
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  svg {
    font-size: 18px;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #059669;
  border: 2px solid #059669;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #059669;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }

  svg {
    font-size: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || '#1f2937'};
`;

const FiltersCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  border: 1px solid #e5e7eb;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 300px;
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    font-size: 18px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1800px;
`;

const Th = styled.th`
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-right: none;
  }
`;

const Td = styled.td`
  padding: 14px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #374151;
  vertical-align: middle;
`;

const ReceiptNumber = styled.span`
  font-weight: 600;
  color: #3b82f6;
  font-family: 'Courier New', monospace;
`;

const Reason = styled.span`
  display: inline-block;
  padding: 4px 10px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const SKU = styled.span`
  font-family: 'Courier New', monospace;
  color: #6b7280;
  font-size: 13px;
`;

const Quantity = styled.span`
  font-weight: 600;
  color: #059669;
  font-size: 15px;
`;

const Price = styled.span`
  font-weight: 600;
  color: #dc2626;
`;

const TotalPrice = styled.span`
  font-weight: 700;
  color: #3b82f6;
  font-size: 16px;
`;

const StatusBadge = styled.span<{ color: string; bg: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.color};
  background: ${props => props.bg};
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionButton = styled.button<{ danger?: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: ${props => props.danger ? '#fee2e2' : '#f3f4f6'};
  color: ${props => props.danger ? '#dc2626' : '#6b7280'};
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${props => props.danger ? '#fecaca' : '#e5e7eb'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const LoadingState = styled.div`
  padding: 60px;
  text-align: center;
  color: #6b7280;
  font-size: 16px;
`;

const EmptyState = styled.div`
  padding: 60px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 24px;
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProductSKUText = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
`;

export default OutboundListPage;
