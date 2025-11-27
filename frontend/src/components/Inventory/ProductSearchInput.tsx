import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiSearch, FiPlus } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  sku: string;
  image?: string;
  stock: number;
  price: number;
}

interface ProductSearchInputProps {
  onSelect: (product: Product) => void;
  onAddNew?: () => void;
  filterFn?: (product: Product) => boolean;
  emptyMessage?: string;
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ 
  onSelect, 
  onAddNew,
  filterFn,
  emptyMessage = 'Không tìm thấy sản phẩm'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let filtered = products;
    
    // Apply custom filter first (e.g., only in-stock items)
    if (filterFn) {
      filtered = filtered.filter(filterFn);
    }
    
    // Then apply search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, products, filterFn]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Products API response:', result);
        
        // API returns data in 'data' field, not 'products'
        const productsData = result.data || result.products || [];
        console.log('Products loaded:', productsData.length);
        
        // Map products to include stock from inventory if available
        const mappedProducts = productsData.map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || p.id,
          image: p.featuredImage || p.image,
          stock: p.stock || 0,
          price: p.price || 0,
          trackingType: p.trackingType || 'none'
        }));
        
        setProducts(mappedProducts);
      } else {
        console.error('Failed to fetch products:', response.status);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product: Product) => {
    onSelect(product);
    setSearchTerm('');
    setShowDropdown(false);
  };

  return (
    <Wrapper ref={wrapperRef}>
      <SearchContainer>
        <SearchIcon><FiSearch /></SearchIcon>
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
        {onAddNew && (
          <AddNewButton onClick={onAddNew}>
            <FiPlus /> Thêm mới
          </AddNewButton>
        )}
      </SearchContainer>

      {showDropdown && (
        <Dropdown>
          {loading ? (
            <DropdownItem>Đang tải...</DropdownItem>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.slice(0, 10).map(product => (
              <DropdownItem key={product.id} onClick={() => handleSelect(product)}>
                <ProductInfo>
                  {product.image && <ProductImage src={product.image} alt={product.name} />}
                  <ProductDetails>
                    <ProductName>{product.name}</ProductName>
                    <ProductMeta>
                      SKU: {product.sku} | Tồn: {product.stock} | 
                      Giá: {product.price.toLocaleString()}₫
                    </ProductMeta>
                  </ProductDetails>
                </ProductInfo>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem>{emptyMessage}</DropdownItem>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  z-index: 1;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const AddNewButton = styled.button`
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background: #059669;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
  z-index: 10;
`;

const DropdownItem = styled.div`
  padding: 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ProductMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

export default ProductSearchInput;
