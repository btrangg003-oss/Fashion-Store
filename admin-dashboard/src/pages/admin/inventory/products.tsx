import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  trackingType: 'none' | 'batch' | 'serial';
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  supplier: string;
  barcode?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTracking, setFilterTracking] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          sku: 'SKU001',
          name: 'Áo thun nam basic',
          category: 'Áo',
          trackingType: 'batch',
          price: 250000,
          cost: 150000,
          stock: 150,
          minStock: 20,
          maxStock: 500,
          supplier: 'Nhà cung cấp A',
          barcode: '8934567890123',
          status: 'active',
          createdAt: '2024-11-01',
          updatedAt: '2024-11-16'
        },
        {
          id: '2',
          sku: 'SKU002',
          name: 'Quần jean nữ',
          category: 'Quần',
          trackingType: 'serial',
          price: 450000,
          cost: 280000,
          stock: 45,
          minStock: 10,
          maxStock: 200,
          supplier: 'Nhà cung cấp B',
          barcode: '8934567890124',
          status: 'active',
          createdAt: '2024-11-02',
          updatedAt: '2024-11-16'
        },
        {
          id: '3',
          sku: 'SKU003',
          name: 'Váy dạ hội',
          category: 'Váy',
          trackingType: 'serial',
          price: 1200000,
          cost: 750000,
          stock: 8,
          minStock: 5,
          maxStock: 50,
          supplier: 'Nhà cung cấp C',
          status: 'active',
          createdAt: '2024-11-03',
          updatedAt: '2024-11-16'
        },
        {
          id: '4',
          sku: 'SKU004',
          name: 'Giày thể thao',
          category: 'Giày',
          trackingType: 'batch',
          price: 850000,
          cost: 520000,
          stock: 75,
          minStock: 15,
          maxStock: 300,
          supplier: 'Nhà cung cấp A',
          barcode: '8934567890125',
          status: 'active',
          createdAt: '2024-11-04',
          updatedAt: '2024-11-16'
        },
        {
          id: '5',
          sku: 'SKU005',
          name: 'Túi xách da',
          category: 'Phụ kiện',
          trackingType: 'serial',
          price: 650000,
          cost: 400000,
          stock: 12,
          minStock: 5,
          maxStock: 100,
          supplier: 'Nhà cung cấp D',
          status: 'active',
          createdAt: '2024-11-05',
          updatedAt: '2024-11-16'
        }
      ];
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesTracking = filterTracking === 'all' || product.trackingType === filterTracking;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesTracking;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stock <= p.minStock).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.cost), 0)
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, { ...product, id: Date.now().toString() }]);
    }
    setShowModal(false);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: 'Hết hàng', color: '#dc2626' };
    if (product.stock <= product.minStock) return { label: 'Sắp hết', color: '#f59e0b' };
    if (product.stock >= product.maxStock) return { label: 'Tồn nhiều', color: '#8b5cf6' };
    return { label: 'Còn hàng', color: '#10b981' };
  };

  const getTrackingBadge = (type: string) => {
    const badges = {
      none: { label: 'Không theo dõi', color: '#6b7280' },
      batch: { label: 'Theo lô', color: '#3b82f6' },
      serial: { label: 'Theo serial', color: '#8b5cf6' }
    };
    return badges[type as keyof typeof badges] || badges.none;
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>📦 Quản lý Sản phẩm</Title>
          <HeaderActions>
            <ExportButton>📊 Xuất Excel</ExportButton>
            <ImportButton>📥 Nhập Excel</ImportButton>
            <AddButton onClick={handleAddProduct}>+ Thêm sản phẩm</AddButton>
          </HeaderActions>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatIcon>📦</StatIcon>
            <StatInfo>
              <StatValue>{stats.total}</StatValue>
              <StatLabel>Tổng sản phẩm</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard>
            <StatIcon>✅</StatIcon>
            <StatInfo>
              <StatValue>{stats.active}</StatValue>
              <StatLabel>Đang hoạt động</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#f59e0b">
            <StatIcon>⚠️</StatIcon>
            <StatInfo>
              <StatValue>{stats.lowStock}</StatValue>
              <StatLabel>Sắp hết hàng</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#dc2626">
            <StatIcon>🔴</StatIcon>
            <StatInfo>
              <StatValue>{stats.outOfStock}</StatValue>
              <StatLabel>Hết hàng</StatLabel>
            </StatInfo>
          </StatCard>
          <StatCard color="#10b981">
            <StatIcon>💰</StatIcon>
            <StatInfo>
              <StatValue>{(stats.totalValue / 1000000).toFixed(1)}M</StatValue>
              <StatLabel>Giá trị tồn kho</StatLabel>
            </StatInfo>
          </StatCard>
        </StatsGrid>

        <FilterSection>
          <SearchBox>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Tìm theo tên hoặc SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          
          <FilterGroup>
            <FilterSelect value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </FilterSelect>

            <FilterSelect value={filterTracking} onChange={(e) => setFilterTracking(e.target.value)}>
              <option value="all">Tất cả tracking</option>
              <option value="none">Không theo dõi</option>
              <option value="batch">Theo lô</option>
              <option value="serial">Theo serial</option>
            </FilterSelect>

            <FilterSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </FilterSelect>
          </FilterGroup>
        </FilterSection>

        {loading ? (
          <LoadingState>Đang tải...</LoadingState>
        ) : filteredProducts.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyText>Không tìm thấy sản phẩm</EmptyText>
          </EmptyState>
        ) : (
          <ProductGrid>
            {filteredProducts.map(product => {
              const stockStatus = getStockStatus(product);
              const trackingBadge = getTrackingBadge(product.trackingType);
              
              return (
                <ProductCard key={product.id}>
                  <ProductHeader>
                    <ProductSKU>{product.sku}</ProductSKU>
                    <ProductActions>
                      <ActionButton onClick={() => handleEditProduct(product)}>✏️</ActionButton>
                      <ActionButton onClick={() => handleDeleteProduct(product.id)}>🗑️</ActionButton>
                    </ProductActions>
                  </ProductHeader>

                  <ProductName>{product.name}</ProductName>
                  
                  <ProductInfo>
                    <InfoRow>
                      <InfoLabel>Danh mục:</InfoLabel>
                      <InfoValue>{product.category}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Nhà cung cấp:</InfoLabel>
                      <InfoValue>{product.supplier}</InfoValue>
                    </InfoRow>
                  </ProductInfo>

                  <BadgeRow>
                    <TrackingBadge color={trackingBadge.color}>
                      {trackingBadge.label}
                    </TrackingBadge>
                    <StockBadge color={stockStatus.color}>
                      {stockStatus.label}
                    </StockBadge>
                  </BadgeRow>

                  <StockInfo>
                    <StockBar>
                      <StockFill 
                        width={(product.stock / product.maxStock) * 100}
                        color={stockStatus.color}
                      />
                    </StockBar>
                    <StockText>
                      {product.stock} / {product.maxStock} (Min: {product.minStock})
                    </StockText>
                  </StockInfo>

                  <PriceRow>
                    <PriceItem>
                      <PriceLabel>Giá vốn:</PriceLabel>
                      <PriceValue>{product.cost.toLocaleString()}đ</PriceValue>
                    </PriceItem>
                    <PriceItem>
                      <PriceLabel>Giá bán:</PriceLabel>
                      <PriceValue highlight>{product.price.toLocaleString()}đ</PriceValue>
                    </PriceItem>
                  </PriceRow>

                  <ProductFooter>
                    <FooterText>Cập nhật: {new Date(product.updatedAt).toLocaleDateString('vi-VN')}</FooterText>
                    {product.barcode && <Barcode>🏷️ {product.barcode}</Barcode>}
                  </ProductFooter>
                </ProductCard>
              );
            })}
          </ProductGrid>
        )}

        {showModal && (
          <ProductModal
            product={editingProduct}
            onSave={handleSaveProduct}
            onClose={() => setShowModal(false)}
          />
        )}
      </Container>
    </AdminLayout>
  );
};

// Product Modal Component
const ProductModal: React.FC<{
  product: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}> = ({ product, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      sku: '',
      name: '',
      category: '',
      trackingType: 'none',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      maxStock: 0,
      supplier: '',
      barcode: '',
      description: '',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Product);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{product ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}</ModalTitle>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <ModalForm onSubmit={handleSubmit}>
          <FormRow>
            <FormGroup>
              <Label>SKU *</Label>
              <Input
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU001"
              />
            </FormGroup>
            <FormGroup>
              <Label>Tên sản phẩm *</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tên sản phẩm"
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Danh mục *</Label>
              <Select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Chọn danh mục</option>
                <option value="Áo">Áo</option>
                <option value="Quần">Quần</option>
                <option value="Váy">Váy</option>
                <option value="Giày">Giày</option>
                <option value="Phụ kiện">Phụ kiện</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Tracking Type *</Label>
              <Select
                required
                value={formData.trackingType}
                onChange={(e) => setFormData({ ...formData, trackingType: e.target.value as any })}
              >
                <option value="none">Không theo dõi</option>
                <option value="batch">Theo lô</option>
                <option value="serial">Theo serial</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Giá vốn *</Label>
              <Input
                type="number"
                required
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Giá bán *</Label>
              <Input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Tồn kho hiện tại</Label>
              <Input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </FormGroup>

            <FormGroup>
              <Label>Tồn kho tối thiểu</Label>
              <Input
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
            </FormGroup>

            <FormGroup>
              <Label>Tồn kho tối đa</Label>
              <Input
                type="number"
                min="0"
                value={formData.maxStock}
                onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
              />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Nhà cung cấp</Label>
              <Input
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Tên nhà cung cấp"
              />
            </FormGroup>
            <FormGroup>
              <Label>Barcode</Label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="8934567890123"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Mô tả</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả sản phẩm..."
              rows={3}
            />
          </FormGroup>

          <FormGroup>
            <Label>Trạng thái</Label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </Select>
          </FormGroup>

          <ModalFooter>
            <CancelButton type="button" onClick={onClose}>Hủy</CancelButton>
            <SaveButton type="submit">💾 Lưu</SaveButton>
          </ModalFooter>
        </ModalForm>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProductsPage;

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const AddButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const ExportButton = styled(Button)`
  background: #10b981;
  color: white;
`;

const ImportButton = styled(Button)`
  background: #3b82f6;
  color: white;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ color?: string }>`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 4px solid ${props => props.color || '#667eea'};
`;

const StatIcon = styled.div`
  font-size: 32px;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
`;

const FilterSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const SearchBox = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ProductSKU = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 4px 12px;
  border-radius: 6px;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const ProductName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
`;

const ProductInfo = styled.div`
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const InfoLabel = styled.span`
  color: #6b7280;
`;

const InfoValue = styled.span`
  color: #1f2937;
  font-weight: 500;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const TrackingBadge = styled.div<{ color: string }>`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color}20;
  color: ${props => props.color};
`;

const StockBadge = styled.div<{ color: string }>`
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color}20;
  color: ${props => props.color};
`;

const StockInfo = styled.div`
  margin-bottom: 16px;
`;

const StockBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const StockFill = styled.div<{ width: number; color: string }>`
  width: ${props => Math.min(props.width, 100)}%;
  height: 100%;
  background: ${props => props.color};
  transition: width 0.3s;
`;

const StockText = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 12px;
`;

const PriceItem = styled.div`
  text-align: center;
`;

const PriceLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const PriceValue = styled.div<{ highlight?: boolean }>`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.highlight ? '#10b981' : '#1f2937'};
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
`;

const FooterText = styled.div``;

const Barcode = styled.div`
  font-family: monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 18px;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.div`
  font-size: 18px;
  color: #6b7280;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const ModalForm = styled.form`
  padding: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }
`;

const SaveButton = styled.button`
  padding: 10px 24px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;
