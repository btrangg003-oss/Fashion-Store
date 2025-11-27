import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiPackage, FiAlertCircle, FiTrendingDown, FiTrendingUp,
  FiRefreshCw, FiDownload, FiPlus, FiMinus, FiEdit2, FiX
} from 'react-icons/fi';

const AdminInventory = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in');
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentNote, setAdjustmentNote] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    loadProducts();
  }, [user, loading, router]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const result = await response.json();
      if (result.success) {
        setProducts(result.data || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleStockAdjustment = async () => {
    if (!adjustingProduct || adjustmentQty <= 0) return;

    const newStock = adjustmentType === 'in' 
      ? adjustingProduct.stock + adjustmentQty
      : adjustingProduct.stock - adjustmentQty;

    if (newStock < 0) {
      alert('Số lượng tồn kho không thể âm!');
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${adjustingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });

      if (response.ok) {
        alert('Cập nhật tồn kho thành công!');
        setAdjustingProduct(null);
        setAdjustmentQty(0);
        setAdjustmentNote('');
        loadProducts();
      }
    } catch (error) {
      alert('Lỗi khi cập nhật tồn kho');
    }
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'low') return p.stock < 10;
    if (filter === 'out') return p.stock === 0;
    if (filter === 'normal') return p.stock >= 10;
    return true;
  });

  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock < 10 && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  };

  if (loading) return <LoadingContainer>Đang tải...</LoadingContainer>;
  if (!user) return null;

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>
              <FiPackage />
              Quản lý kho hàng
            </Title>
            <Subtitle>Theo dõi và quản lý tồn kho sản phẩm</Subtitle>
          </HeaderLeft>
          <Actions>
            <ActionButton onClick={loadProducts}>
              <FiRefreshCw /> Làm mới
            </ActionButton>
            <ActionButton onClick={() => {
              const csv = 'Sản phẩm,SKU,Tồn kho,Giá trị\n' + 
                filteredProducts.map(p => `${p.name},${p.sku || '-'},${p.stock},${p.price * p.stock}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'inventory-report.csv';
              a.click();
            }}>
              <FiDownload /> Xuất báo cáo
            </ActionButton>
          </Actions>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatIcon color="#3b82f6">
              <FiPackage />
            </StatIcon>
            <StatContent>
              <StatLabel>Tổng sản phẩm</StatLabel>
              <StatValue>{stats.total}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#f59e0b">
              <FiAlertCircle />
            </StatIcon>
            <StatContent>
              <StatLabel>Sắp hết hàng</StatLabel>
              <StatValue>{stats.lowStock}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#ef4444">
              <FiTrendingDown />
            </StatIcon>
            <StatContent>
              <StatLabel>Hết hàng</StatLabel>
              <StatValue>{stats.outOfStock}</StatValue>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon color="#10b981">
              <FiTrendingUp />
            </StatIcon>
            <StatContent>
              <StatLabel>Giá trị tồn kho</StatLabel>
              <StatValue>{(stats.totalValue / 1000000).toFixed(1)}M</StatValue>
            </StatContent>
          </StatCard>
        </StatsGrid>

        <Toolbar>
          <FilterButtons>
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
              Tất cả ({products.length})
            </FilterButton>
            <FilterButton active={filter === 'normal'} onClick={() => setFilter('normal')}>
              Bình thường ({products.filter(p => p.stock >= 10).length})
            </FilterButton>
            <FilterButton active={filter === 'low'} onClick={() => setFilter('low')}>
              Sắp hết ({stats.lowStock})
            </FilterButton>
            <FilterButton active={filter === 'out'} onClick={() => setFilter('out')}>
              Hết hàng ({stats.outOfStock})
            </FilterButton>
          </FilterButtons>
        </Toolbar>

        <InventoryTable>
          <thead>
            <tr>
              <Th>Sản phẩm</Th>
              <Th>SKU</Th>
              <Th>Tồn kho</Th>
              <Th>Giá trị</Th>
              <Th>Trạng thái</Th>
              <Th>Hành động</Th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <ProductRow key={product.id}>
                <Td>
                  <ProductInfo>
                    <ProductImage 
                      src={product.images?.[0]?.url || product.featuredImage || 'https://via.placeholder.com/50'} 
                      alt={product.name}
                    />
                    <ProductName>{product.name}</ProductName>
                  </ProductInfo>
                </Td>
                <Td>{product.sku || '-'}</Td>
                <Td>
                  <StockInfo>
                    <StockValue status={
                      product.stock === 0 ? 'out' : 
                      product.stock < 10 ? 'low' : 'normal'
                    }>
                      {product.stock}
                    </StockValue>
                    <StockUnit>đơn vị</StockUnit>
                  </StockInfo>
                </Td>
                <Td>
                  <ValueText>{(product.price * product.stock).toLocaleString('vi-VN')} ₫</ValueText>
                </Td>
                <Td>
                  <StatusBadge status={
                    product.stock === 0 ? 'out' : 
                    product.stock < 10 ? 'low' : 'normal'
                  }>
                    {product.stock === 0 ? (
                      <><FiAlertCircle /> Hết hàng</>
                    ) : product.stock < 10 ? (
                      <><FiAlertCircle /> Sắp hết</>
                    ) : (
                      <><FiPackage /> Bình thường</>
                    )}
                  </StatusBadge>
                </Td>
                <Td>
                  <ActionButtons>
                    <IconButton onClick={() => setAdjustingProduct(product)}>
                      <FiEdit2 /> Điều chỉnh
                    </IconButton>
                  </ActionButtons>
                </Td>
              </ProductRow>
            ))}
          </tbody>
        </InventoryTable>

        {filteredProducts.length === 0 && (
          <EmptyState>
            <FiPackage size={64} />
            <h3>Không có sản phẩm nào</h3>
            <p>Thử thay đổi bộ lọc</p>
          </EmptyState>
        )}
      </Container>

      <AnimatePresence>
        {adjustingProduct && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdjustingProduct(null)}
          >
            <ModalContent
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Điều chỉnh tồn kho</ModalTitle>
                <CloseButton onClick={() => setAdjustingProduct(null)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <ProductInfo>
                  <ProductImage 
                    src={adjustingProduct.images?.[0]?.url || adjustingProduct.featuredImage || 'https://via.placeholder.com/50'} 
                    alt={adjustingProduct.name}
                  />
                  <div>
                    <ProductName>{adjustingProduct.name}</ProductName>
                    <CurrentStock>Tồn kho hiện tại: <strong>{adjustingProduct.stock}</strong></CurrentStock>
                  </div>
                </ProductInfo>

                <FormGroup>
                  <Label>Loại điều chỉnh</Label>
                  <TypeButtons>
                    <TypeButton 
                      active={adjustmentType === 'in'}
                      onClick={() => setAdjustmentType('in')}
                    >
                      <FiPlus /> Nhập kho
                    </TypeButton>
                    <TypeButton 
                      active={adjustmentType === 'out'}
                      onClick={() => setAdjustmentType('out')}
                    >
                      <FiMinus /> Xuất kho
                    </TypeButton>
                  </TypeButtons>
                </FormGroup>

                <FormGroup>
                  <Label>Số lượng</Label>
                  <Input
                    type="number"
                    min="1"
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                    placeholder="Nhập số lượng"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Ghi chú (tùy chọn)</Label>
                  <Textarea
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    placeholder="Lý do điều chỉnh..."
                    rows={3}
                  />
                </FormGroup>

                <ResultPreview>
                  <span>Tồn kho sau điều chỉnh:</span>
                  <ResultValue>
                    {adjustmentType === 'in' 
                      ? adjustingProduct.stock + adjustmentQty
                      : adjustingProduct.stock - adjustmentQty
                    }
                  </ResultValue>
                </ResultPreview>
              </ModalBody>

              <ModalFooter>
                <CancelButton onClick={() => setAdjustingProduct(null)}>
                  Hủy
                </CancelButton>
                <SubmitButton onClick={handleStockAdjustment}>
                  Xác nhận điều chỉnh
                </SubmitButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </ResponsiveAdminLayout>
  );
};

export default AdminInventory;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #6b7280;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
`;

const Toolbar = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#4b5563'};
  border: 1px solid ${props => props.active ? '#3b82f6' : '#e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: ${props => props.active ? 'white' : '#3b82f6'};
  }
`;

const InventoryTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
`;

const ProductRow = styled.tr`
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #1f2937;
`;

const StockInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
`;

const StockValue = styled.span<{ status: 'normal' | 'low' | 'out' }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => {
    if (props.status === 'out') return '#ef4444';
    if (props.status === 'low') return '#f59e0b';
    return '#10b981';
  }};
`;

const StockUnit = styled.span`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const ValueText = styled.div`
  font-weight: 600;
  color: #059669;
`;

const StatusBadge = styled.span<{ status: 'normal' | 'low' | 'out' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => {
    if (props.status === 'out') return '#fef2f2';
    if (props.status === 'low') return '#fef3c7';
    return '#f0fdf4';
  }};
  color: ${props => {
    if (props.status === 'out') return '#dc2626';
    if (props.status === 'low') return '#d97706';
    return '#16a34a';
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;

  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #4b5563;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const TypeButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const TypeButton = styled.button<{ active: boolean }>`
  padding: 1rem;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#4b5563'};
  border: 2px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const CurrentStock = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;

  strong {
    color: #1f2937;
  }
`;

const ResultPreview = styled.div`
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;

  span {
    color: #166534;
    font-weight: 500;
  }
`;

const ResultValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #16a34a;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #4b5563;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;
