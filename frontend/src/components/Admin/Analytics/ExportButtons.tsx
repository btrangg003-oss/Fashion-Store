import React, { useState } from 'react';
import styled from 'styled-components';
import { FiDownload, FiFileText } from 'react-icons/fi';
import type { AnalyticsData, TimeRange } from '@/models/analytics';

interface ExportButtonsProps {
  data: AnalyticsData | null;
  timeRange: TimeRange;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ data, timeRange }) => {
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const handleExportPDF = async () => {
    if (!data) return;
    
    setExporting('pdf');
    
    try {
      // Dynamic import to reduce bundle size
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(102, 126, 234);
      pdf.text('Báo Cáo Phân Tích', pageWidth / 2, 20, { align: 'center' });

      // Add time range
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      const timeRangeText = getTimeRangeText(timeRange);
      pdf.text(timeRangeText, pageWidth / 2, 30, { align: 'center' });

      // Add export date
      pdf.setFontSize(10);
      const exportDate = `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}`;
      pdf.text(exportDate, pageWidth / 2, 36, { align: 'center' });

      // Add summary data
      let yPos = 50;
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Tổng Quan', 20, yPos);

      yPos += 10;
      pdf.setFontSize(11);
      pdf.setTextColor(75, 85, 99);
      
      const summaryData = [
        `Tổng doanh thu: ${data.revenue.total.toLocaleString('vi-VN')} ₫`,
        `Tăng trưởng: ${data.revenue.growth}%`,
        `Tổng đơn hàng: ${data.orders.total}`,
        `Tỷ lệ retention: ${data.retention.rate}%`,
        `Tổng sản phẩm: ${data.products.total}`
      ];

      summaryData.forEach(text => {
        pdf.text(text, 20, yPos);
        yPos += 7;
      });

      // Capture charts (if available in DOM)
      // Note: This is a simplified version. In production, you'd capture actual chart images
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Biểu Đồ Chi Tiết', 20, yPos);
      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text('(Xem chi tiết trên dashboard)', 20, yPos);

      // Save PDF
      pdf.save(`analytics-report-${Date.now()}.pdf`);
      
      alert('✅ Đã xuất báo cáo PDF thành công!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('❌ Có lỗi xảy ra khi xuất PDF. Vui lòng thử lại.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    if (!data) return;
    
    setExporting('excel');
    
    try {
      // Dynamic import
      const XLSX = await import('xlsx');

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        ['Báo Cáo Phân Tích'],
        ['Khoảng thời gian:', getTimeRangeText(timeRange)],
        ['Ngày xuất:', new Date().toLocaleDateString('vi-VN')],
        [],
        ['Tổng Quan'],
        ['Tổng doanh thu', data.revenue.total],
        ['Tăng trưởng (%)', data.revenue.growth],
        ['Tổng đơn hàng', data.orders.total],
        ['Tỷ lệ retention (%)', data.retention.rate],
        ['Tổng sản phẩm', data.products.total]
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Tổng Quan');

      // Revenue sheet
      const revenueData = [
        ['Kỳ', 'Doanh thu', 'Mục tiêu', 'Tăng trưởng (%)'],
        ...data.revenue.byPeriod.map(item => [
          item.period,
          item.revenue,
          item.target,
          item.growth
        ])
      ];
      const revenueWs = XLSX.utils.aoa_to_sheet(revenueData);
      XLSX.utils.book_append_sheet(wb, revenueWs, 'Doanh Thu');

      // Retention sheet
      const retentionData = [
        ['Tháng', 'Tỷ lệ Retention (%)', 'Marketing ROI (%)', 'Khách mới', 'Khách quay lại', 'Chi phí Marketing'],
        ...data.retention.byMonth.map(item => [
          item.month,
          item.retentionRate,
          item.marketingROI,
          item.newCustomers,
          item.returningCustomers,
          item.marketingSpend
        ])
      ];
      const retentionWs = XLSX.utils.aoa_to_sheet(retentionData);
      XLSX.utils.book_append_sheet(wb, retentionWs, 'Retention & Marketing');

      // Demographics sheet
      const demographicsData = [
        ['Phân Bố Độ Tuổi'],
        ['Nhóm tuổi', 'Số lượng', 'Phần trăm (%)'],
        ...data.demographics.age.map(item => [
          item.ageGroup,
          item.count,
          item.percentage
        ]),
        [],
        ['Phân Bố Giới Tính'],
        ['Giới tính', 'Số lượng', 'Phần trăm (%)'],
        ...data.demographics.gender.map(item => [
          item.genderLabel,
          item.count,
          item.percentage
        ])
      ];
      const demographicsWs = XLSX.utils.aoa_to_sheet(demographicsData);
      XLSX.utils.book_append_sheet(wb, demographicsWs, 'Khách Hàng');

      // Products sheet
      const productsData = [
        ['Danh mục', 'Số lượng', 'Phần trăm (%)', 'Sản phẩm mẫu'],
        ...data.products.categories.map(item => [
          item.categoryLabel,
          item.count,
          item.percentage,
          item.products.join(', ')
        ])
      ];
      const productsWs = XLSX.utils.aoa_to_sheet(productsData);
      XLSX.utils.book_append_sheet(wb, productsWs, 'Sản Phẩm');

      // Orders sheet
      const ordersData = [
        ['Tuần', 'Chờ xử lý', 'Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy', 'Tổng'],
        ...data.orders.byWeek.map(item => [
          item.week,
          item.pending,
          item.processing,
          item.shipping,
          item.delivered,
          item.cancelled,
          item.total
        ])
      ];
      const ordersWs = XLSX.utils.aoa_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(wb, ordersWs, 'Đơn Hàng');

      // Write file
      XLSX.writeFile(wb, `analytics-report-${Date.now()}.xlsx`);
      
      alert('✅ Đã xuất báo cáo Excel thành công!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      alert('❌ Có lỗi xảy ra khi xuất Excel. Vui lòng thử lại.');
    } finally {
      setExporting(null);
    }
  };

  const getTimeRangeText = (range: TimeRange): string => {
    const labels: Record<string, string> = {
      week: 'Tuần này',
      month: 'Tháng này',
      quarter: 'Quý này',
      year: 'Năm này',
      custom: 'Tùy chỉnh'
    };
    return labels[range.type] || 'Tháng này';
  };

  return (
    <Container>
      <ExportButton
        onClick={handleExportPDF}
        disabled={!data || exporting === 'pdf'}
      >
        <FiFileText />
        {exporting === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
      </ExportButton>
      
      <ExportButton
        onClick={handleExportExcel}
        disabled={!data || exporting === 'excel'}
        $primary
      >
        <FiDownload />
        {exporting === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
      </ExportButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ExportButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: ${props => props.$primary ? 'none' : '1px solid #e5e7eb'};
  border-radius: 8px;
  background: ${props => props.$primary ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.$primary ? 'white' : '#374151'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    font-size: 16px;
  }

  &:hover:not(:disabled) {
    ${props => props.$primary ? `
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    ` : `
      background: #f9fafb;
      border-color: #d1d5db;
    `}
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ExportButtons;
