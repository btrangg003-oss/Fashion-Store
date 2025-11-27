import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProductFormModal from '@/components/Admin/ProductFormModal';
import { useAuth } from '@/contexts/AuthContext';
import {
  FiShoppingBag, FiPlus, FiSearch, FiFilter, FiGrid, FiList,
  FiEdit2, FiTrash2, FiEye, FiDownload, FiUpload, FiCopy,
  FiPackage, FiAlertCircle, FiCheckCircle, FiX
} from 'react-icons/fi';

const AdminProducts = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    loadProducts();
  }, [user, loading, router]);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchTerm, filterCategory, filterStatus, sortBy, products]);

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

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        loadProducts();
        alert('Xóa sản phẩm thành công!');
      }
    } catch (error) {
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Xóa ${selectedProducts.length} sản phẩm đã chọn?`)) return;

    try {
      await Promise.all(
        selectedProducts.map(id =>
          fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' })
        )
      );
      setSelectedProducts([]);
      loadProducts();
      alert('Xóa thành công!');
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Lỗi khi xóa sản phẩm');
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  if (loading) return <LoadingContainer>Đang tải...</LoadingContainer>;
  if (!user) return null;

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>
              <FiShoppingBag />
              Quản lý sản phẩm
            </Title>
            <Stats>
              <StatItem>
                <StatValue>{products.length}</StatValue>
                <StatLabel>Tổng sản phẩm</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{products.filter(p => p.stock < 10).length}</StatValue>
                <StatLabel>Sắp hết hàng</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{products.filter(p => p.status === 'active').length}</StatValue>
                <StatLabel>Đang bán</StatLabel>
              </StatItem>
            </Stats>
          </HeaderLeft>
          <Actions>
            <ActionButton onClick={async () => {
              try {
                const response = await fetch('/api/admin/products/export');
                if (response.ok) {
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `products_${new Date().toISOString().split('T')[0]}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } else {
                  alert('Lỗi khi export file');
                }
              } catch (error) {
                console.error('Export error:', error);
                alert('Có lỗi xảy ra khi export');
              }
            }}>
              <FiDownload /> Export Excel
            </ActionButton>
            <ActionButton onClick={() => {
              alert('Chức năng Import đang được phát triển.\nHiện tại bạn có thể thêm sản phẩm thủ công.');
            }}>
              <FiUpload /> Import
            </ActionButton>
            <PrimaryButton onClick={() => {
              setModalMode('create');
              setEditingProduct(null);
              setShowProductModal(true);
            }}>
              <FiPlus /> Thêm sản phẩm
            </PrimaryButton>
          </Actions>
        </Header>

        <Toolbar>
          <SearchContainer>
            <FiSearch />
            <SearchInput
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <ToolbarRight>
            <FilterButton onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Lọc {showFilters && '✓'}
            </FilterButton>

            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Tên A-Z</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="stock-asc">Tồn kho thấp → cao</option>
              <option value="stock-desc">Tồn kho cao → thấp</option>
            </Select>

            <ViewToggle>
              <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                <FiList />
              </ViewButton>
              <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                <FiGrid />
              </ViewButton>
            </ViewToggle>
          </ToolbarRight>
        </Toolbar>

        <AnimatePresence>
          {showFilters && (
            <FiltersPanel
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <FilterGroup>
                <FilterLabel>Danh mục</FilterLabel>
                <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Tất cả' : cat}
                    </option>
                  ))}
                </Select>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Trạng thái</FilterLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">Tất cả</option>
                  <option value="active">Đang bán</option>
                  <option value="inactive">Tạm dừng</option>
                </Select>
              </FilterGroup>

              <FilterButton onClick={() => {
                setFilterCategory('all');
                setFilterStatus('all');
                setSearchTerm('');
              }}>
                Xóa bộ lọc
              </FilterButton>
            </FiltersPanel>
          )}
        </AnimatePresence>

        {selectedProducts.length > 0 && (
          <BulkActions>
            <span>{selectedProducts.length} sản phẩm đã chọn</span>
            <BulkButton onClick={handleBulkDelete}>
              <FiTrash2 /> Xóa đã chọn
            </BulkButton>
            <BulkButton onClick={() => setSelectedProducts([])}>
              Bỏ chọn
            </BulkButton>
          </BulkActions>
        )}

        {viewMode === 'list' ? (
          <ProductTable>
            <thead>
              <tr>
                <Th>
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length}
                    onChange={toggleSelectAll}
                  />
                </Th>
                <Th>Hình ảnh</Th>
                <Th>Tên sản phẩm</Th>
                <Th>SKU</Th>
                <Th>Danh mục</Th>
                <Th>Giá</Th>
                <Th>Tồn kho</Th>
                <Th>Trạng thái</Th>
                <Th>Hành động</Th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <ProductRow key={product.id}>
                  <Td>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                    />
                  </Td>
                  <Td>
                    <ProductImage
                      src={product.images?.[0]?.url || product.featuredImage || 'https://via.placeholder.com/50'}
                      alt={product.name}
                    />
                  </Td>
                  <Td>
                    <ProductName>{product.name}</ProductName>
                  </Td>
                  <Td>{product.sku || '-'}</Td>
                  <Td>{product.category || '-'}</Td>
                  <Td>
                    <Price>{product.price.toLocaleString('vi-VN')} ₫</Price>
                  </Td>
                  <Td>
                    <StockBadge low={product.stock < 10}>
                      {product.stock < 10 && <FiAlertCircle />}
                      {product.stock}
                    </StockBadge>
                  </Td>
                  <Td>
                    <StatusBadge active={product.status === 'active'}>
                      {product.status === 'active' ? <FiCheckCircle /> : <FiX />}
                      {product.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButtons>
                      <IconButton title="Xem" onClick={() => window.open(`/products/${product.id}`, '_blank')}>
                        <FiEye />
                      </IconButton>
                      <IconButton title="Sửa" onClick={() => {
                        setModalMode('edit');
                        setEditingProduct(product);
                        setShowProductModal(true);
                      }}>
                        <FiEdit2 />
                      </IconButton>
                      <IconButton title="Nhân bản" onClick={async () => {
                        if (confirm('Nhân bản sản phẩm này?')) {
                          try {
                            const response = await fetch('/api/admin/products', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ ...product, id: undefined, name: product.name + ' (Copy)' })
                            });
                            if (response.ok) {
                              alert('Nhân bản thành công!');
                              loadProducts();
                            }
                          } catch (error) {
                            alert('Lỗi khi nhân bản');
                          }
                        }
                      }}>
                        <FiCopy />
                      </IconButton>
                      <IconButton title="Xóa" danger onClick={() => handleDelete(product.id)}>
                        <FiTrash2 />
                      </IconButton>
                    </ActionButtons>
                  </Td>
                </ProductRow>
              ))}
            </tbody>
          </ProductTable>
        ) : (
          <ProductGrid>
            {filteredProducts.map(product => (
              <ProductCard key={product.id}>
                <CardCheckbox>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                  />
                </CardCheckbox>
                <CardImage
                  src={product.images?.[0]?.url || product.featuredImage || 'https://via.placeholder.com/200'}
                  alt={product.name}
                />
                <CardContent>
                  <CardTitle>{product.name}</CardTitle>
                  <CardPrice>{product.price.toLocaleString('vi-VN')} ₫</CardPrice>
                  <CardInfo>
                    <span>Tồn: {product.stock}</span>
                    <StatusBadge active={product.status === 'active'}>
                      {product.status === 'active' ? 'Bán' : 'Dừng'}
                    </StatusBadge>
                  </CardInfo>
                  <CardActions>
                    <IconButton onClick={() => window.open(`/products/${product.id}`, '_blank')}>
                      <FiEye />
                    </IconButton>
                    <IconButton onClick={() => {
                      setModalMode('edit');
                      setEditingProduct(product);
                      setShowProductModal(true);
                    }}>
                      <FiEdit2 />
                    </IconButton>
                    <IconButton danger onClick={() => handleDelete(product.id)}>
                      <FiTrash2 />
                    </IconButton>
                  </CardActions>
                </CardContent>
              </ProductCard>
            ))}
          </ProductGrid>
        )}

        {filteredProducts.length === 0 && (
          <EmptyState>
            <FiPackage size={64} />
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
          </EmptyState>
        )}
      </Container>

      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
        product={editingProduct}
        mode={modalMode}
      />
    </AdminLayout>
  );

  // Handlers
  function handleProductSubmit(data: any) {
    if (modalMode === 'create') {
      fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => {
        if (res.ok) {
          alert('Thêm sản phẩm thành công!');
          setShowProductModal(false);
          loadProducts();
        } else {
          alert('Lỗi khi thêm sản phẩm');
        }
      });
    } else {
      fetch(`/api/admin/products?id=${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()).then(result => {
        if (result.success) {
          alert('Cập nhật thành công!');
          setShowProductModal(false);
          loadProducts();
        } else {
          alert('Lỗi khi cập nhật: ' + (result.error || 'Unknown error'));
        }
      }).catch(error => {
        console.error('Update error:', error);
        alert('Lỗi khi cập nhật');
      });
    }
  }
};

export default AdminProducts;

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
  margin: 0 0 1rem 0;
`;

const Stats = styled.div`
  display: flex;
  gap: 2rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

const PrimaryButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  svg {
    color: #9ca3af;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
`;

const ToolbarRight = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1rem;
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
  }
`;

const FiltersPanel = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  border: 1px solid #e2e8f0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
`;

const BulkActions = styled.div`
  background: #eff6ff;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #bfdbfe;

  span {
    font-weight: 600;
    color: #1e40af;
  }
`;

const BulkButton = styled.button`
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #3b82f6;
  color: #3b82f6;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #3b82f6;
    color: white;
  }
`;

const ProductTable = styled.table`
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

const Price = styled.div`
  font-weight: 600;
  color: #059669;
`;

const StockBadge = styled.span<{ low: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.low ? '#fef2f2' : '#f0fdf4'};
  color: ${props => props.low ? '#dc2626' : '#16a34a'};
`;

const StatusBadge = styled.span<{ active: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.active ? '#dbeafe' : '#f3f4f6'};
  color: ${props => props.active ? '#1e40af' : '#6b7280'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ danger?: boolean }>`
  padding: 0.5rem;
  background: ${props => props.danger ? '#fef2f2' : '#f3f4f6'};
  color: ${props => props.danger ? '#dc2626' : '#4b5563'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.danger ? '#fee2e2' : '#e5e7eb'};
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  position: relative;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const CardCheckbox = styled.div`
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 1;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardPrice = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.75rem;
`;

const CardInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
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

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;
