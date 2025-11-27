import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiDownload, FiCalendar } from 'react-icons/fi';

interface FinancialData {
  revenue: {
    total: number;
    byMonth: { month: string; amount: number }[];
    growth: number;
  };
  expenses: {
    total: number;
    byCategory: { category: string; amount: number }[];
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  taxes: {
    due: number;
    paid: number;
    pending: number;
  };
  cashFlow: {
    inflow: number;
    outflow: number;
    balance: number;
  };
}

export default function FinancePage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      const res = await fetch(`/api/admin/finance?range=${dateRange}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/admin/export/finance?format=${exportFormat}&range=${dateRange}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report-${dateRange}.${exportFormat}`;
      a.click();
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading) return <ResponsiveAdminLayout><Loading>Đang tải...</Loading></ResponsiveAdminLayout>;

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>Báo Cáo Tài Chính</Title>
          <Controls>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm này</option>
            </Select>
            <Select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </Select>
            <ExportButton onClick={handleExport}>
              <FiDownload /> Xuất báo cáo
            </ExportButton>
          </Controls>
        </Header>

        <MetricsGrid>
          <MetricCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MetricIcon color="#10b981">
              <FiDollarSign />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Doanh thu</MetricLabel>
              <MetricValue>{data?.revenue.total.toLocaleString('vi-VN')} ₫</MetricValue>
              <MetricChange positive={data?.revenue.growth! > 0}>
                {data?.revenue.growth! > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {Math.abs(data?.revenue.growth || 0)}%
              </MetricChange>
            </MetricContent>
          </MetricCard>

          <MetricCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MetricIcon color="#ef4444">
              <FiTrendingDown />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Chi phí</MetricLabel>
              <MetricValue>{data?.expenses.total.toLocaleString('vi-VN')} ₫</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <MetricIcon color="#3b82f6">
              <FiTrendingUp />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Lợi nhuận ròng</MetricLabel>
              <MetricValue>{data?.profit.net.toLocaleString('vi-VN')} ₫</MetricValue>
              <MetricSubtext>Biên lợi nhuận: {data?.profit.margin}%</MetricSubtext>
            </MetricContent>
          </MetricCard>

          <MetricCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MetricIcon color="#8b5cf6">
              <FiCalendar />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Dòng tiền</MetricLabel>
              <MetricValue>{data?.cashFlow.balance.toLocaleString('vi-VN')} ₫</MetricValue>
            </MetricContent>
          </MetricCard>
        </MetricsGrid>

        <ChartsGrid>
          <ChartCard>
            <ChartTitle>Doanh thu theo tháng</ChartTitle>
            <ChartContent>
              {data?.revenue.byMonth.map((item, index) => (
                <BarItem key={index}>
                  <BarLabel>{item.month}</BarLabel>
                  <BarWrapper>
                    <Bar
                      width={(item.amount / Math.max(...data.revenue.byMonth.map(m => m.amount))) * 100}
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.amount / Math.max(...data.revenue.byMonth.map(m => m.amount))) * 100}%` }}
                      transition={{ delay: index * 0.1 }}
                    />
                  </BarWrapper>
                  <BarValue>{item.amount.toLocaleString('vi-VN')} ₫</BarValue>
                </BarItem>
              ))}
            </ChartContent>
          </ChartCard>

          <ChartCard>
            <ChartTitle>Chi phí theo danh mục</ChartTitle>
            <ExpenseList>
              {data?.expenses.byCategory.map((item, index) => (
                <ExpenseItem key={index}>
                  <ExpenseInfo>
                    <ExpenseName>{item.category}</ExpenseName>
                    <ExpenseAmount>{item.amount.toLocaleString('vi-VN')} ₫</ExpenseAmount>
                  </ExpenseInfo>
                  <ExpenseBar
                    width={(item.amount / data.expenses.total) * 100}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.amount / data.expenses.total) * 100}%` }}
                    transition={{ delay: index * 0.1 }}
                  />
                </ExpenseItem>
              ))}
            </ExpenseList>
          </ChartCard>
        </ChartsGrid>

        <TaxSection>
          <SectionTitle>Thuế & Nghĩa vụ</SectionTitle>
          <TaxGrid>
            <TaxCard>
              <TaxLabel>Tổng thuế phải nộp</TaxLabel>
              <TaxValue>{data?.taxes.due.toLocaleString('vi-VN')} ₫</TaxValue>
            </TaxCard>
            <TaxCard>
              <TaxLabel>Đã thanh toán</TaxLabel>
              <TaxValue color="#10b981">{data?.taxes.paid.toLocaleString('vi-VN')} ₫</TaxValue>
            </TaxCard>
            <TaxCard>
              <TaxLabel>Chờ thanh toán</TaxLabel>
              <TaxValue color="#f59e0b">{data?.taxes.pending.toLocaleString('vi-VN')} ₫</TaxValue>
            </TaxCard>
          </TaxGrid>
        </TaxSection>
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
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
`;

const MetricIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
`;

const MetricChange = styled.div<{ positive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  margin-top: 0.5rem;
`;

const MetricSubtext = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const ChartContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BarLabel = styled.div`
  width: 60px;
  font-size: 0.875rem;
  color: #6b7280;
`;

const BarWrapper = styled.div`
  flex: 1;
  height: 24px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
`;

const Bar = styled(motion.div)<{ width: number }>`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 4px;
`;

const BarValue = styled.div`
  width: 120px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const ExpenseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExpenseItem = styled.div``;

const ExpenseInfo = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ExpenseName = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ExpenseAmount = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const ExpenseBar = styled(motion.div)<{ width: number }>`
  height: 8px;
  background: linear-gradient(90deg, #ef4444, #f59e0b);
  border-radius: 4px;
`;

const TaxSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const TaxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const TaxCard = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const TaxLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const TaxValue = styled.div<{ color?: string }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.color || '#1f2937'};
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;
