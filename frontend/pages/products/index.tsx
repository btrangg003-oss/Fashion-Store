import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Header from '@/components/layout/Header';

const PageContainer = styled.div`
  margin-top: 80px;
`;

const CategoryBanner = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const CategoryCard = styled.div`
  position: relative;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }
`;

const CategoryImage = styled.div<{ bg: string }>`
  width: 100%;
  height: 100%;
  background: ${props => props.bg};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
`;

const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 100px;

  @media (max-width: 1024px) {
    position: relative;
    top: 0;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 1rem;
`;

const PriceInputs = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const FilterCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4a5568;

  input {
    cursor: pointer;
  }

  &:hover {
    color: #1a202c;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const FilterButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background: #667eea;
    color: white;
    border: none;

    &:hover {
      background: #5568d3;
    }
  ` : `
    background: white;
    color: #4a5568;
    border: 1px solid #e2e8f0;

    &:hover {
      background: #f7fafc;
    }
  `}
`;

const ProductsSection = styled.div``;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ProductCount = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
`;

const SortSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 280px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #e53e3e;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  grid-column: 1 / -1;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  grid-column: 1 / -1;
`;

const ProductsPage = () => {
  const router = useRouter();
  const { search, gender } = router.query;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceFrom: '',
    priceTo: '',
    categories: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
    sizes: [] as string[]
  });

  const genderCategories = [
    { id: 'nam', name: 'Nam', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'nu', name: 'Nữ', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'phu-kien', name: 'Phụ kiện', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
  ];

  const categoryOptions = ['Áo', 'Quần', 'Váy', 'Giày', 'Dép'];
  const brandOptions = ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo'];
  const colorOptions = ['Đen', 'Trắng', 'Xám', 'Xanh', 'Đỏ', 'Vàng'];
  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    loadProducts();
  }, [search, gender, filters]);

  const loadProducts = async () => {
    setLoading(true);

    try {
      let url = '/api/products';
      const params = new URLSearchParams();

      if (search) params.append('search', search as string);
      if (gender) params.append('gender', gender as string);
      if (filters.priceFrom) {
        const priceFrom = filters.priceFrom.replace(/,/g, '');
        params.append('minPrice', priceFrom);
      }
      if (filters.priceTo) {
        const priceTo = filters.priceTo.replace(/,/g, '');
        params.append('maxPrice', priceTo);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        let filteredProducts = result.data;

        // Apply client-side filters
        if (filters.categories.length > 0) {
          filteredProducts = filteredProducts.filter((p: any) =>
            filters.categories.some(cat => p.name.toLowerCase().includes(cat.toLowerCase()))
          );
        }

        if (filters.brands.length > 0) {
          filteredProducts = filteredProducts.filter((p: any) =>
            filters.brands.includes(p.vendor)
          );
        }

        if (filters.colors.length > 0) {
          filteredProducts = filteredProducts.filter((p: any) =>
            p.tags?.some((tag: string) =>
              filters.colors.some(color => tag.toLowerCase().includes(color.toLowerCase()))
            )
          );
        }

        if (filters.sizes.length > 0) {
          filteredProducts = filteredProducts.filter((p: any) =>
            p.variants?.some((variant: any) =>
              variant.options?.some((opt: any) =>
                opt.name === 'Size' && filters.sizes.includes(opt.value)
              )
            )
          );
        }

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenderClick = (genderId: string) => {
    router.push(`/products?gender=${genderId}`);
  };

  const handleProductClick = (product: any) => {
    router.push(`/products/${product.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatPriceInput = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (field: 'priceFrom' | 'priceTo', value: string) => {
    const formatted = formatPriceInput(value);
    setFilters(prev => ({ ...prev, [field]: formatted }));
  };

  const toggleFilter = (type: 'categories' | 'brands' | 'colors' | 'sizes', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const applyFilters = () => {
    loadProducts();
  };

  const clearFilters = () => {
    setFilters({
      priceFrom: '',
      priceTo: '',
      categories: [],
      brands: [],
      colors: [],
      sizes: []
    });
  };

  return (
    <>
      <Header />
      <PageContainer>
        {/* Category Banner */}
        <CategoryBanner>
          {genderCategories.map(cat => (
            <CategoryCard key={cat.id} onClick={() => handleGenderClick(cat.id)}>
              <CategoryImage bg={cat.bg}>
                <div style={{ fontSize: '3rem' }}>
                  {cat.id === 'nam' ? '👔' : cat.id === 'nu' ? '👗' : '👜'}
                </div>
              </CategoryImage>
              <CategoryLabel>{cat.name}</CategoryLabel>
            </CategoryCard>
          ))}
        </CategoryBanner>

        {/* Main Content */}
        <MainContent>
          {/* Sidebar Filters */}
          <Sidebar>
            <FilterSection>
              <FilterTitle>Khoảng giá</FilterTitle>
              <PriceInputs>
                <PriceInput
                  type="text"
                  placeholder="Từ"
                  value={filters.priceFrom}
                  onChange={(e) => handlePriceChange('priceFrom', e.target.value)}
                />
                <span>-</span>
                <PriceInput
                  type="text"
                  placeholder="Đến"
                  value={filters.priceTo}
                  onChange={(e) => handlePriceChange('priceTo', e.target.value)}
                />
              </PriceInputs>
            </FilterSection>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FilterSection>
                <FilterTitle>Danh mục</FilterTitle>
                {categoryOptions.map(cat => (
                  <FilterCheckbox key={cat}>
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat)}
                      onChange={() => toggleFilter('categories', cat)}
                    />
                    {cat}
                  </FilterCheckbox>
                ))}
              </FilterSection>

              <FilterSection>
                <FilterTitle>Thương hiệu</FilterTitle>
                {brandOptions.map(brand => (
                  <FilterCheckbox key={brand}>
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleFilter('brands', brand)}
                    />
                    {brand}
                  </FilterCheckbox>
                ))}
              </FilterSection>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FilterSection>
                <FilterTitle>Màu sắc</FilterTitle>
                {colorOptions.map(color => (
                  <FilterCheckbox key={color}>
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(color)}
                      onChange={() => toggleFilter('colors', color)}
                    />
                    {color}
                  </FilterCheckbox>
                ))}
              </FilterSection>

              <FilterSection>
                <FilterTitle>Size</FilterTitle>
                {sizeOptions.map(size => (
                  <FilterCheckbox key={size}>
                    <input
                      type="checkbox"
                      checked={filters.sizes.includes(size)}
                      onChange={() => toggleFilter('sizes', size)}
                    />
                    {size}
                  </FilterCheckbox>
                ))}
              </FilterSection>
            </div>

            <FilterActions>
              <FilterButton variant="primary" onClick={applyFilters}>
                Áp dụng
              </FilterButton>
              <FilterButton variant="secondary" onClick={clearFilters}>
                Xóa tất cả
              </FilterButton>
            </FilterActions>
          </Sidebar>

          {/* Products Section */}
          <ProductsSection>
            <ProductsHeader>
              <ProductCount>
                {loading ? 'Đang tải...' : `${products.length} sản phẩm`}
                {gender && ` - ${genderCategories.find(g => g.id === gender)?.name}`}
              </ProductCount>
              <SortSelect>
                <option>Mặc định</option>
                <option>Giá: Thấp đến cao</option>
                <option>Giá: Cao đến thấp</option>
                <option>Mới nhất</option>
              </SortSelect>
            </ProductsHeader>

            <ProductsGrid>
              {loading ? (
                <LoadingState>Đang tải sản phẩm...</LoadingState>
              ) : products.length > 0 ? (
                products.map(product => (
                  <ProductCard
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductImage
                      src={product.images?.[0]?.url || product.featuredImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'}
                      alt={product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
                      }}
                    />
                    <ProductInfo>
                      <ProductName>{product.name}</ProductName>
                      <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
                    </ProductInfo>
                  </ProductCard>
                ))
              ) : (
                <NoResults>
                  {search
                    ? `Không tìm thấy sản phẩm nào với từ khóa "${search}"`
                    : 'Không có sản phẩm nào'
                  }
                </NoResults>
              )}
            </ProductsGrid>
          </ProductsSection>
        </MainContent>
      </PageContainer>
    </>
  );
};

export default ProductsPage;