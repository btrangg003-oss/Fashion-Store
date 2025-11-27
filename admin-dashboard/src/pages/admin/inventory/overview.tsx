import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { 
  FiPackage, FiAlertTriangle, FiTrendingUp, FiDollarSign,
  FiShoppingBag, FiUsers, FiDownload, FiRefreshCw, FiFilter,
  FiBarChart2, FiClock, FiCheckCircle
} from 'react-icons/fi';
import { useRouter } from 'next/router';

interface InventoryOverview {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  expiringCount: number;
  topSellingProducts: Array<{
    id: string;
    name: string;
    sku: string;
    sales: number;
    revenue: number;
  }>;
  stockByCategory: Array<{
    category: string;
    quantity: number;
    value: number;
  }>;
  stockBySupplier: Array<{
    supplier: string;
    quantity: number;
    value: number;
  }>;
  recentMovements: Array<{
    id: string;
    type: string;
    date: string;
    items: number;
    value: number;
  }>;
}

const InventoryOverviewPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    loadOverview();
  }, [timeRange]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/overview?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOverview(data);
      }
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingMessage>Đang tải dữ liệu...</LoadingMessage>
        </Container>
      </AdminLayout>
    );
  }

  if (!overview) {
    return (
      <AdminLayout>
        <Container>
          <ErrorMessage>Không thể tải dữ liệu</ErrorMessage>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>📊 Tổng Quan Kho Hàng</Title>
            <Subtitle>Theo dõi tình trạng kho hàng theo thời gian thực</Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <TimeRangeSelect value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
              <option value="year">Năm nay</option>
            </TimeRangeSelect>
            <IconButton onClick={loadOverview} title="Làm mới">
              <FiRefreshCw />
            </IconButton>
            <ExportButton onClick={() => alert('Xuất báo cáo Excel')}>
              <FiDownload /> Xuất báo cáo
            </ExportButton>
          </HeaderRight>
        </Header>

        {/* Key Metrics */}
        <MetricsGrid>
          <MetricCard>
            <MetricIcon color="#3b82f6">
              <FiPackage />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Tổng số sản phẩm</MetricLabel>
              <MetricValue>{formatNumber(overview.totalProducts)}</MetricValue>
              <MetricSubtext>Mẫu sản phẩm</MetricSubtext>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#10b981">
              <FiShoppingBag />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Tổng số lượng</MetricLabel>
              <MetricValue>{formatNumber(overview.totalQuantity)}</MetricValue>
              <MetricSubtext>Đơn vị tồn kho</MetricSubtext>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#f59e0b">
              <FiDollarSign />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Giá trị hàng tồn</MetricLabel>
              <MetricValue>{formatCurrency(overview.totalValue)}</MetricValue>
              <MetricSubtext>Tổng giá trị kho</MetricSubtext>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#ef4444">
              <FiAlertTriangle />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Cảnh báo</MetricLabel>
              <MetricValue>
                {overview.lowStockCount + overview.outOfStockCount + overview.expiringCount}
              </MetricValue>
              <MetricSubtext>Sản phẩm cần chú ý</MetricSubtext>
            </MetricContent>
          </MetricCard>
        </MetricsGrid>

        {/* Alerts Section */}
        <AlertsSection>
          <SectionTitle>⚠️ Cảnh Báo Hàng Hóa</SectionTitle>
          <AlertsGrid>
            <AlertCard 
              color="#ef4444" 
              onClick={() => router.push('/admin/inventory/stock?filter=out_of_stock')}
            >
              <AlertIcon>🚫</AlertIcon>
              <AlertContent>
                <AlertCount>{overview.outOfStockCount}</AlertCount>
                <AlertLabel>Hết hàng</AlertLabel>
              </AlertContent>
            </AlertCard>

            <AlertCard 
              color="#f59e0b"
              onClick={() => router.push('/admin/inventory/stock?filter=low_stock')}
            >
              <AlertIcon>⚠️</AlertIcon>
              <AlertContent>
                <AlertCount>{overview.lowStockCount}</AlertCount>
                <AlertLabel>Sắp hết hàng</AlertLabel>
              </AlertContent>
            </AlertCard>

            <AlertCard 
              color="#8b5cf6"
              onClick={() => router.push('/admin/inventory/stock?filter=overstock')}
            >
              <AlertIcon>📦</AlertIcon>
              <AlertContent>
                <AlertCount>{overview.overstockCount}</AlertCount>
                <AlertLabel>Tồn kho nhiều</AlertLabel>
              </AlertContent>
            </AlertCard>

            <AlertCard 
              color="#f97316"
              onClick={() => router.push('/admin/inventory/stock?filter=expiring')}
            >
              <AlertIcon>⏰</AlertIcon>
              <AlertContent>
                <AlertCount>{overview.expiringCount}</AlertCount>
                <AlertLabel>Sắp hết hạn</AlertLabel>
              </AlertContent>
            </AlertCard>
          </AlertsGrid>
        </AlertsSection>

        {/* Data Tables */}
        <TablesGrid>
          {/* Top Selling Products */}
          <TableCard>
            <CardHeader>
              <CardTitle>🏆 Top Sản Phẩm Bán Chạy</CardTitle>
              <ViewAllLink onClick={() => router.push('/admin/phan-tich')}>
                Xem tất cả →
              </ViewAllLink>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Sản phẩm</Th>
                  <Th>SKU</Th>
                  <Th>Đã bán</Th>
                  <Th>Doanh thu</Th>
                </tr>
              </thead>
              <tbody>
                {overview.topSellingProducts.map((product, index) => (
                  <tr key={product.id}>
                    <Td>
                      <Rank>{index + 1}</Rank>
                    </Td>
                    <Td>{product.name}</Td>
                    <Td><Code>{product.sku}</Code></Td>
                    <Td>{formatNumber(product.sales)}</Td>
                    <Td><Price>{formatCurrency(product.revenue)}</Price></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableCard>

          {/* Stock by Category */}
          <TableCard>
            <CardHeader>
              <CardTitle>📂 Tồn Kho Theo Danh Mục</CardTitle>
            </CardHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Danh mục</Th>
                  <Th>Số lượng</Th>
                  <Th>Giá trị</Th>
                </tr>
              </thead>
              <tbody>
                {overview.stockByCategory.map((cat, index) => (
                  <tr key={index}>
                    <Td>{cat.category}</Td>
                    <Td>{formatNumber(cat.quantity)}</Td>
                    <Td><Price>{formatCurrency(cat.value)}</Price></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableCard>
        </TablesGrid>

        {/* Stock by Supplier */}
        <TableCard>
          <CardHeader>
            <CardTitle>🏢 Tồn Kho Theo Nhà Cung Cấp</CardTitle>
            <ViewAllLink onClick={() => router.push('/admin/inventory/suppliers')}>
              Xem tất cả →
            </ViewAllLink>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Nhà cung cấp</Th>
                <Th>Số lượng sản phẩm</Th>
                <Th>Giá trị tồn kho</Th>
                <Th>Tỷ lệ</Th>
              </tr>
            </thead>
            <tbody>
              {overview.stockBySupplier.map((supplier, index) => (
                <tr key={index}>
                  <Td>{supplier.supplier}</Td>
                  <Td>{formatNumber(supplier.quantity)}</Td>
                  <Td><Price>{formatCurrency(supplier.value)}</Price></Td>
                  <Td>
                    <ProgressBar>
                      <ProgressFill 
                        width={(supplier.value / overview.totalValue) * 100} 
                      />
                    </ProgressBar>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableCard>

        {/* Recent Movements */}
        <TableCard>
          <CardHeader>
            <CardTitle>📋 Hoạt Động Gần Đây</CardTitle>
            <ViewAllLink onClick={() => router.push('/admin/inventory/inbound')}>
              Xem tất cả →
            </ViewAllLink>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Loại</Th>
                <Th>Ngày</Th>
                <Th>Số sản phẩm</Th>
                <Th>Giá trị</Th>
              </tr>
            </thead>
            <tbody>
              {overview.recentMovements.map((movement, index) => (
                <tr key={index}>
                  <Td>
                    <TypeBadge type={movement.type}>
                      {movement.type === 'inbound' ? '⬇️ Nhập' : '⬆️ Xuất'}
                    </TypeBadge>
                  </Td>
                  <Td>{new Date(movement.date).toLocaleDateString('vi-VN')}</Td>
                  <Td>{formatNumber(movement.items)}</Td>
                  <Td><Price>{formatCurrency(movement.value)}</Price></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableCard>

        {/* Quick Actions */}
        <QuickActions>
          <SectionTitle>⚡ Thao Tác Nhanh</SectionTitle>
          <ActionsGrid>
            <ActionCard onClick={() => router.push('/admin/inventory/inbound/create')}>
              <ActionIcon color="#3b82f6">⬇️</ActionIcon>
              <ActionLabel>Nhập kho</ActionLabel>
            </ActionCard>
            <ActionCard onClick={() => router.push('/admin/inventory/outbound/create')}>
              <ActionIcon color="#10b981">⬆️</ActionIcon>
              <ActionLabel>Xuất kho</ActionLabel>
            </ActionCard>
            <ActionCard onClick={() => router.push('/admin/inventory/stock-check')}>
              <ActionIcon color="#f59e0b">✅</ActionIcon>
              <ActionLabel>Kiểm kho</ActionLabel>
            </ActionCard>
            <ActionCard onClick={() => router.push('/admin/inventory/stock')}>
              <ActionIcon color="#8b5cf6">📦</ActionIcon>
              <ActionLabel>Quản lý tồn</ActionLabel>
            </ActionCard>
          </ActionsGrid>
        </QuickActions>
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`padding: 24px; max-width: 1600px; margin: 0 auto;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px;`;
const HeaderLeft = styled.div``;
const HeaderRight = styled.div`display: flex; gap: 12px; align-items: center;`;
const Title = styled.h1`font-size: 32px; font-weight: 700; color: #111827; margin: 0 0 8px 0;`;
const Subtitle = styled.p`font-size: 16px; color: #6b7280; margin: 0;`;

const TimeRangeSelect = styled.select`
  padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;
  background: white; cursor: pointer;
  &:focus { outline: none; border-color: #3b82f6; }
`;

const IconButton = styled.button`
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  background: white; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer;
  &:hover { background: #f9fafb; border-color: #3b82f6; color: #3b82f6; }
`;

const ExportButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #3b82f6;
  color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;
  &:hover { background: #2563eb; }
`;

const MetricsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;
`;

const MetricCard = styled.div`
  background: white; border-radius: 12px; padding: 24px; display: flex; gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MetricIcon = styled.div<{ color: string }>`
  width: 56px; height: 56px; border-radius: 12px; background: ${props => props.color}15;
  color: ${props => props.color}; display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
`;

const MetricContent = styled.div`flex: 1;`;
const MetricLabel = styled.div`font-size: 14px; color: #6b7280; margin-bottom: 8px;`;
const MetricValue = styled.div`font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 4px;`;
const MetricSubtext = styled.div`font-size: 12px; color: #9ca3af;`;

const AlertsSection = styled.div`margin-bottom: 32px;`;
const SectionTitle = styled.h2`font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 20px 0;`;

const AlertsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;
`;

const AlertCard = styled.div<{ color: string }>`
  background: white; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); cursor: pointer; border-left: 4px solid ${props => props.color};
  transition: all 0.2s;
  &:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transform: translateY(-2px); }
`;

const AlertIcon = styled.div`font-size: 32px;`;
const AlertContent = styled.div`flex: 1;`;
const AlertCount = styled.div`font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 4px;`;
const AlertLabel = styled.div`font-size: 14px; color: #6b7280;`;

const TablesGrid = styled.div`
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 32px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const TableCard = styled.div`
  background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
`;

const CardTitle = styled.h3`font-size: 18px; font-weight: 600; color: #111827; margin: 0;`;

const ViewAllLink = styled.a`
  font-size: 14px; color: #3b82f6; cursor: pointer;
  &:hover { text-decoration: underline; }
`;

const Table = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  text-align: left; padding: 12px; background: #f9fafb; font-size: 13px; font-weight: 600;
  color: #6b7280; border-bottom: 2px solid #e5e7eb;
`;
const Td = styled.td`padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;`;

const Rank = styled.div`
  width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; color: #3b82f6;
  display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 13px;
`;

const Code = styled.code`
  padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 13px;
  font-family: 'Courier New', monospace;
`;

const Price = styled.span`font-weight: 600; color: #111827;`;

const TypeBadge = styled.span<{ type: string }>`
  padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;
  background: ${props => props.type === 'inbound' ? '#dbeafe' : '#d1fae5'};
  color: ${props => props.type === 'inbound' ? '#1e40af' : '#065f46'};
`;

const ProgressBar = styled.div`
  width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  width: ${props => props.width}%; height: 100%; background: #3b82f6; transition: width 0.3s;
`;

const QuickActions = styled.div`margin-bottom: 32px;`;

const ActionsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;
`;

const ActionCard = styled.div`
  background: white; border-radius: 12px; padding: 24px; text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); cursor: pointer; transition: all 0.2s;
  &:hover { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); transform: translateY(-2px); }
`;

const ActionIcon = styled.div<{ color: string }>`
  font-size: 40px; margin-bottom: 12px; color: ${props => props.color};
`;

const ActionLabel = styled.div`font-size: 14px; font-weight: 500; color: #374151;`;

const LoadingMessage = styled.div`text-align: center; padding: 80px 20px; font-size: 18px; color: #6b7280;`;
const ErrorMessage = styled.div`text-align: center; padding: 80px 20px; font-size: 18px; color: #ef4444;`;

export default InventoryOverviewPage;
