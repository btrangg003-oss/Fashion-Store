import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { FiDownload, FiCalendar, FiFilter, FiTrendingUp, FiPieChart } from 'react-icons/fi';

interface Report {
  id: string;
  name: string;
  type: string;
  description: string;
  lastGenerated?: string;
}

export default function ReportsPage() {
  const [reports] = useState<Report[]>([
    {
      id: 'sales-summary',
      name: 'Báo cáo tổng hợp doanh số',
      type: 'sales',
      description: 'Tổng quan doanh thu, đơn hàng và khách hàng theo thời gian'
    },
    {
      id: 'product-performance',
      name: 'Hiệu suất sản phẩm',
      type: 'products',
      description: 'Phân tích sản phẩm bán chạy, tồn kho và lợi nhuận'
    },
    {
      id: 'customer-insights',
      name: 'Phân tích khách hàng',
      type: 'customers',
      description: 'Hành vi mua hàng, phân khúc và giá trị vòng đời'
    },
    {
      id: 'inventory-status',
      name: 'Tình trạng kho hàng',
      type: 'inventory',
      description: 'Tồn kho, hàng sắp hết và dự báo nhu cầu'
    },
    {
      id: 'financial-report',
      name: 'Báo cáo tài chính',
      type: 'finance',
      description: 'Doanh thu, chi phí, lợi nhuận và dòng tiền'
    },
    {
      id: 'marketing-roi',
      name: 'ROI Marketing',
      type: 'marketing',
      description: 'Hiệu quả chiến dịch và tỷ suất hoàn vốn'
    }
  ]);

  const [dateRange, setDateRange] = useState('month');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = async (reportId: string) => {
    setGenerating(reportId);
    try {
      const res = await fetch(`/api/admin/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, dateRange, format })
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-${dateRange}.${format}`;
      a.click();
    } catch (error) {
      console.error('Report generation error:', error);
    } finally {
      setGenerating(null);
    }
  };

  const handleSchedule = async (reportId: string) => {
    try {
      await fetch(`/api/admin/reports/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, frequency: 'weekly' })
      });
      alert('Đã lên lịch báo cáo tự động');
    } catch (error) {
      console.error('Schedule error:', error);
    }
  };

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>Báo Cáo & Phân Tích</Title>
          <Controls>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
              <option value="custom">Tùy chỉnh</option>
            </Select>
            <Select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </Select>
          </Controls>
        </Header>

        <ReportsGrid>
          {reports.map((report, index) => (
            <ReportCard
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ReportIcon type={report.type}>
                {report.type === 'sales' && <FiTrendingUp />}
                {report.type === 'products' && <FiPieChart />}
                {report.type === 'customers' && <FiPieChart />}
                {report.type === 'inventory' && <FiPieChart />}
                {report.type === 'finance' && <FiTrendingUp />}
                {report.type === 'marketing' && <FiPieChart />}
              </ReportIcon>
              <ReportContent>
                <ReportName>{report.name}</ReportName>
                <ReportDescription>{report.description}</ReportDescription>
                {report.lastGenerated && (
                  <LastGenerated>
                    Tạo lần cuối: {new Date(report.lastGenerated).toLocaleDateString('vi-VN')}
                  </LastGenerated>
                )}
              </ReportContent>
              <ReportActions>
                <ActionButton
                  onClick={() => handleGenerate(report.id)}
                  disabled={generating === report.id}
                >
                  <FiDownload />
                  {generating === report.id ? 'Đang tạo...' : 'Tạo báo cáo'}
                </ActionButton>
                <SecondaryButton onClick={() => handleSchedule(report.id)}>
                  <FiCalendar />
                  Lên lịch
                </SecondaryButton>
              </ReportActions>
            </ReportCard>
          ))}
        </ReportsGrid>

        <QuickStats>
          <StatTitle>Thống kê nhanh</StatTitle>
          <StatsGrid>
            <StatCard>
              <StatLabel>Tổng báo cáo đã tạo</StatLabel>
              <StatValue>247</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Báo cáo tự động</StatLabel>
              <StatValue>12</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Lần xuất gần nhất</StatLabel>
              <StatValue>Hôm nay</StatValue>
            </StatCard>
          </StatsGrid>
        </QuickStats>
      </Container>
    </ResponsiveAdminLayout>
  );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const ReportsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReportCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReportIcon = styled.div<{ type: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => {
    const colors: any = {
      sales: '#10b98120',
      products: '#3b82f620',
      customers: '#8b5cf620',
      inventory: '#f59e0b20',
      finance: '#ef444420',
      marketing: '#06b6d420'
    };
    return colors[props.type] || '#e5e7eb';
  }};
  color: ${props => {
    const colors: any = {
      sales: '#10b981',
      products: '#3b82f6',
      customers: '#8b5cf6',
      inventory: '#f59e0b',
      finance: '#ef4444',
      marketing: '#06b6d4'
    };
    return colors[props.type] || '#6b7280';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const ReportContent = styled.div`
  flex: 1;
`;

const ReportName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const ReportDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`;

const LastGenerated = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
`;

const ReportActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
  }
`;

const QuickStats = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
`;
