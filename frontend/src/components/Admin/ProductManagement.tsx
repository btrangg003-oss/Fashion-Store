import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertTriangle, FiSearch, FiFilter, FiDownload, FiUpload, FiPlus, FiPackage, FiEye, FiEyeOff, FiEdit3, FiTrash2
} from 'react-icons/fi';
import { useNotification } from '../../contexts/NotificationContext';
import { Product } from '@/models/products';

interface ProductManagementProps {
  products: Product[];
  categories: unknown[];
  onProductCreate: (product: Partial<Product>) => Promise<void>;
  onProductUpdate: (id: string, product: Partial<Product>) => Promise<void>;
  onProductDelete: (id: string) => Promise<void>;
  onBulkAction: (action: string, productIds: string[]) => Promise<void>;
  loading?: boolean;
}

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: stretch;
    
    > * {
      flex: 1;
    }
  }
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f7fafc;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    background: white;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.active ? '#3182ce' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.active ? '#3182ce' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3182ce;
    background: ${props => props.active ? '#2c5aa0' : '#f7fafc'};
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          border-color: #3182ce;
          background: #3182ce;
          color: white;
          
          &:hover {
            background: #2c5aa0;
            border-color: #2c5aa0;
          }
        `;
      case 'danger':
        return `
          border-color: #e53e3e;
          background: #e53e3e;
          color: white;
          
          &:hover {
            background: #c53030;
            border-color: #c53030;
          }
        `;
      default:
        return `
          border-color: #e2e8f0;
          background: white;
          color: #4a5568;
          
          &:hover {
            border-color: #cbd5e0;
            background: #f7fafc;
          }
        `;
    }
  }}
`;

const BulkActions = styled(motion.div)`
  padding: 1rem 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
`;

const BulkInfo = styled.div`
  color: #4a5568;
  font-weight: 500;
`;

const BulkActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f7fafc;
`;

const TableRow = styled.tr<{ selected?: boolean }>`
  background: ${props => props.selected ? '#ebf8ff' : 'white'};
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f7fafc;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 1rem;
  vertical-align: middle;
  font-size: 0.875rem;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const ProductImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f7fafc;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
`;

const ProductDetails = styled.div`
  min-width: 0;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductSku = styled.div`
  color: #6b7280;
  font-size: 0.75rem;
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' | 'draft' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'draft':
        return `
          background: #fef3c7;
          color: #92400e;
        `;

      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const VisibilityIcon = styled.div<{ visibility: 'visible' | 'hidden' }>`
  color: ${props => props.visibility === 'visible' ? '#10b981' : '#6b7280'};
`;

const Price = styled.div`
  font-weight: 600;
  color: #1a202c;
`;

const ComparePrice = styled.div`
  color: #6b7280;
  text-decoration: line-through;
  font-size: 0.75rem;
`;

const Stock = styled.div<{ low?: boolean }>`
  font-weight: 600;
  color: ${props => props.low ? '#e53e3e' : '#1a202c'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    switch (props.variant) {
      case 'edit':
        return `
          background: #ebf8ff;
          color: #3182ce;
          
          &:hover {
            background: #bee3f8;
          }
        `;
      case 'delete':
        return `
          background: #fed7d7;
          color: #e53e3e;
          
          &:hover {
            background: #feb2b2;
          }
        `;
      default:
        return `
          background: #f7fafc;
          color: #4a5568;
          
          &:hover {
            background: #edf2f7;
          }
        `;
    }
  }}
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const ProductManagement: React.FC<ProductManagementProps> = ({
  products,
  categories,
  onProductCreate,
  onProductUpdate,
  onProductDelete,
  onBulkAction,
  loading = false
}) => {
  const { success, error } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  // // const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<'active' | 'inactive' | 'draft' | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) {
      error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    try {
      await onBulkAction(action, selectedProducts);
      setSelectedProducts([]);
      success(`Đã thực hiện ${action} cho ${selectedProducts.length} sản phẩm`);
    } catch (err) {
      error('Có lỗi xảy ra khi thực hiện thao tác');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusText = (status: 'active' | 'inactive' | 'draft') => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'draft': return 'Nháp';

      default: return status;
    }
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Quản lý sản phẩm</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon>
              <FiSearch size={16} />
            </SearchIcon>
          </SearchContainer>
        </HeaderLeft>
        
        <HeaderRight>
          <FilterButton
            active={showFilters}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter size={16} />
            Bộ lọc
          </FilterButton>
          
          <ActionButton>
            <FiDownload size={16} />
            Xuất
          </ActionButton>
          
          <ActionButton>
            <FiUpload size={16} />
            Nhập
          </ActionButton>
          
          <ActionButton variant="primary">
            <FiPlus size={16} />
            Thêm sản phẩm
          </ActionButton>
        </HeaderRight>
      </Header>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedProducts.length > 0 && (
          <BulkActions
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <BulkInfo>
              Đã chọn {selectedProducts.length} sản phẩm
            </BulkInfo>
            
            <BulkActionButtons>
              <ActionButton onClick={() => handleBulkAction('activate')}>
                Kích hoạt
              </ActionButton>
              <ActionButton onClick={() => handleBulkAction('deactivate')}>
                Vô hiệu hóa
              </ActionButton>
              <ActionButton 
                variant="danger"
                onClick={() => handleBulkAction('delete')}
              >
                Xóa
              </ActionButton>
            </BulkActionButtons>
          </BulkActions>
        )}
      </AnimatePresence>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>
                <Checkbox
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeaderCell>
              <TableHeaderCell>Sản phẩm</TableHeaderCell>
              <TableHeaderCell>Trạng thái</TableHeaderCell>
              <TableHeaderCell>Hiển thị</TableHeaderCell>
              <TableHeaderCell>Giá</TableHeaderCell>
              <TableHeaderCell>Tồn kho</TableHeaderCell>
              <TableHeaderCell>Danh mục</TableHeaderCell>
              <TableHeaderCell>Thao tác</TableHeaderCell>
            </TableRow>
          </TableHeader>
          
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <TableCell colSpan={8}>
                  <EmptyState>
                    <EmptyIcon>
                      <FiPackage size={24} />
                    </EmptyIcon>
                    <div>Không tìm thấy sản phẩm nào</div>
                  </EmptyState>
                </TableCell>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <TableRow
                  key={product.id}
                  selected={selectedProducts.includes(product.id)}
                >
                  <TableCell>
                    <Checkbox
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <ProductInfo>
                      <ProductImage
                        src={(product.images[0] as unknown)?.url || '/placeholder-product.jpg'}
                        alt={product.name}
                      />
                      <ProductDetails>
                        <ProductName>{product.name}</ProductName>
                        <ProductSku>SKU: {product.sku}</ProductSku>
                      </ProductDetails>
                    </ProductInfo>
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge status={product.status}>
                      {getStatusText(product.status)}
                    </StatusBadge>
                  </TableCell>
                  
                  <TableCell>
                    <VisibilityIcon visibility={product.visibility}>
                      {product.visibility === 'visible' ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                    </VisibilityIcon>
                  </TableCell>
                  
                  <TableCell>
                    <Price>{formatPrice(product.price)}</Price>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <ComparePrice>{formatPrice(product.comparePrice)}</ComparePrice>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Stock low={product.stock <= (product.lowStockThreshold || 0)}>
                      {product.stock}
                      {product.stock <= (product.lowStockThreshold || 0) && (
                        <FiAlertTriangle size={14} />
                      )}
                    </Stock>
                  </TableCell>
                  
                  <TableCell>
                    {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                  </TableCell>
                  
                  <TableCell>
                    <ActionButtons>
                      <IconButton variant="edit">
                        <FiEdit3 size={14} />
                      </IconButton>
                      <IconButton 
                        variant="delete"
                        onClick={() => onProductDelete(product.id)}
                      >
                        <FiTrash2 size={14} />
                      </IconButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProductManagement;