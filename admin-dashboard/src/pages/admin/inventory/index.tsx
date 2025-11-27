import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { 
  FiBox, FiTrendingUp, FiTrendingDown, FiAlertCircle,
  FiDownload, FiUpload, FiCheckSquare, FiPackage
} from 'react-icons/fi';
import { InventoryStats, CategoryStock, TopProduct } from '@/models/inventory';

const InventoryOverview = () => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [categoryStock, setCategoryStock] = useState<CategoryStock[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setCategoryStock(data.categoryStock);
        setTopProducts(data.topProducts);
      }
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingMessage>Đang tải...</LoadingMessage>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>📊 Tổng Quan Kho Hàng</Title>
          <QuickActions>
            <ActionButton href="/admin/inventory/inbound">
              <FiDownload /> Nhập kho
            </ActionButton>
            <ActionButton href="/admin/inventory/outbound">
              <FiUpload /> Xuất kho
            </ActionButton>
            <ActionButton href="/admin/inventory/check">
              <FiCheckSquare /> Kiểm kho
            </ActionButton>
          </QuickActions>
        </Header>

        {stats && (
          <>
            <StatsGrid>
              <StatCard>
                <StatIcon color="#3b82f6">
                  <FiBox />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.totalProducts.toLocaleString()}</StatValue>
                  <StatLabel>Tổng sản phẩm</StatLabel>
                </StatInfo>
              </StatCard>

              <StatCard>
                <StatIcon color="#8b5cf6">
                  <FiPackage />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.totalSKUs.toLocaleString()}</StatValue>
                  <StatLabel>Số mẫu (SKU)</StatLabel>
                </StatInfo>
              </StatCard>

              <StatCard>
                <StatIcon color="#10b981">
                  <FiTrendingUp />
                </StatIcon>
                <StatInfo>
                  <StatValue>{formatPrice(stats.totalValue)}</StatValue>
                  <StatLabel>Giá trị tồn kho</StatLabel>
                </StatInfo>
              </StatCard>

              <StatCard alert={stats.lowStockPercentage > 20}>
                <StatIcon color={stats.lowStockPercentage > 20 ? "#ef4444" : "#f59e0b"}>
                  <FiAlertCircle />
                </StatIcon>
                <StatInfo>
                  <StatValue>{stats.lowStockPercentage.toFixed(1)}%</StatValue>
                  <StatLabel>Sắp hết / Hết hàng</StatLabel>
                </StatInfo>
              </StatCard>
            </StatsGrid>

            <Grid>
              <GridItem span={2}>
                <Card>
                  <CardHeader>
                    <CardTitle>Trạng thái tồn kho</CardTitle>
                  </CardHeader>
                  <StockStatusGrid>
                    <StatusItem>
                      <StatusDot color="#10b981" />
                      <StatusLabel>Còn hàng</StatusLabel>
                      <StatusValue>{stats.inStock}</StatusValue>
                    </StatusItem>
                    <StatusItem>
                      <StatusDot color="#f59e0b" />
                      <StatusLabel>Sắp hết</StatusLabel>
                      <StatusValue>{stats.lowStock}</StatusValue>
                    </StatusItem>
                    <StatusItem>
                      <StatusDot color="#ef4444" />
                      <StatusLabel>Hết hàng</StatusLabel>
                      <StatusValue>{stats.outOfStock}</StatusValue>
                    </StatusItem>
                    <StatusItem>
                      <StatusDot color="#8b5cf6" />
                      <StatusLabel>Tồn nhiều</StatusLabel>
                      <StatusValue>{stats.overstock}</StatusValue>
                    </StatusItem>
                  </StockStatusGrid>
                </Card>
              </GridItem>

              <GridItem>
                <Card>
                  <CardHeader>
                    <CardTitle>Top sản phẩm bán chạy</CardTitle>
                  </CardHeader>
                  <TopProductsList>
                    {topProducts.slice(0, 5).map((product, index) => (
                      <TopProductItem key={product.productId}>
                        <ProductRank>#{index + 1}</ProductRank>
                        <ProductInfo>
                          <ProductName>{product.name}</ProductName>
                          <ProductStats>
                            Đã bán: {product.soldQuantity} | {formatPrice(product.revenue)}
                          </ProductStats>
                        </ProductInfo>
                      </TopProductItem>
                    ))}
                  </TopProductsList>
                </Card>
              </GridItem>
            </Grid>

            <Card>
              <CardHeader>
                <CardTitle>Tồn kho theo danh mục</CardTitle>
              </CardHeader>
              <CategoryTable>
                <thead>
                  <tr>
                    <th>Danh mục</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Giá trị</th>
                    <th>Sắp hết</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStock.map(cat => (
                    <tr key={cat.category}>
                      <td><strong>{cat.category}</strong></td>
                      <td>{cat.totalProducts}</td>
                      <td>{cat.totalQuantity.toLocaleString()}</td>
                      <td>{formatPrice(cat.totalValue)}</td>
                      <td>
                        {cat.lowStockCount > 0 && (
                          <Badge color="warning">{cat.lowStockCount}</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </CategoryTable>
            </Card>
          </>
        )}
      </Container>
    </AdminLayout>
  );
};

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
  }
`;

const ActionButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ alert?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.alert ? '#fef2f2' : 'transparent'};
  
  ${props => props.alert && `
    background: #fef2f2;
  `}
`;

const StatIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color}15;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GridItem = styled.div<{ span?: number }>`
  grid-column: span ${props => props.span || 1};
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const StockStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
`;

const StatusDot = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
  flex-shrink: 0;
`;

const StatusLabel = styled.div`
  flex: 1;
  font-size: 14px;
  color: #6b7280;
`;

const StatusValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
`;

const TopProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TopProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const ProductRank = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const ProductStats = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const CategoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 12px;
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    border-bottom: 2px solid #e5e7eb;
  }
  
  td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 14px;
  }
  
  tr:hover {
    background: #f9fafb;
  }
`;

const Badge = styled.span<{ color: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color === 'warning' ? '#fef3c7' : '#dbeafe'};
  color: ${props => props.color === 'warning' ? '#92400e' : '#1e40af'};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 18px;
  color: #6b7280;
`;

export default InventoryOverview;
