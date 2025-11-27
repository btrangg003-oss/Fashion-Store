import { useState } from 'react'
import styled from 'styled-components'
import { FiFilter, FiX } from 'react-icons/fi'

const FilterSection = styled.section`
  padding: 120px 0 40px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
`

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #000;
`

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #000;
  color: white;
  border-radius: 6px;
  font-weight: 500;
  
  @media (min-width: 769px) {
    display: none;
  }
`

const FilterContainer = styled.div<{ isOpen: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'grid' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 1000;
    padding: 20px;
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
`

const FilterGroup = styled.div`
  h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #000;
  }
`

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  
  input {
    margin: 0;
  }
  
  &:hover {
    color: #000;
  }
`

const PriceRange = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  span {
    color: #666;
    font-size: 0.9rem;
  }
`

const MobileFilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  @media (min-width: 769px) {
    display: none;
  }
`

const CloseButton = styled.button`
  padding: 8px;
  font-size: 1.2rem;
  color: #666;
`

const ProductFilters = () => {
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <FilterSection>
      <Container>
        <FilterHeader>
          <Title>Sản phẩm thời trang</Title>
          <FilterToggle onClick={() => setFiltersOpen(true)}>
            <FiFilter />
            Bộ lọc
          </FilterToggle>
        </FilterHeader>
        
        <FilterContainer isOpen={filtersOpen}>
          <MobileFilterHeader>
            <h2>Bộ lọc sản phẩm</h2>
            <CloseButton onClick={() => setFiltersOpen(false)}>
              <FiX />
            </CloseButton>
          </MobileFilterHeader>
          
          <FilterGroup>
            <h3>Danh mục</h3>
            <FilterOptions>
              <FilterOption>
                <input type="checkbox" />
                Áo sơ mi
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Váy đầm
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Quần jeans
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Áo khoác
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Phụ kiện
              </FilterOption>
            </FilterOptions>
          </FilterGroup>
          
          <FilterGroup>
            <h3>Kích thước</h3>
            <FilterOptions>
              <FilterOption>
                <input type="checkbox" />
                XS
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                S
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                M
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                L
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                XL
              </FilterOption>
            </FilterOptions>
          </FilterGroup>
          
          <FilterGroup>
            <h3>Màu sắc</h3>
            <FilterOptions>
              <FilterOption>
                <input type="checkbox" />
                Đen
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Trắng
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Xanh
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Đỏ
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Hồng
              </FilterOption>
            </FilterOptions>
          </FilterGroup>
          
          <FilterGroup>
            <h3>Khoảng giá</h3>
            <PriceRange>
              <input type="number" placeholder="Từ" />
              <span>-</span>
              <input type="number" placeholder="Đến" />
            </PriceRange>
          </FilterGroup>
          
          <FilterGroup>
            <h3>Thương hiệu</h3>
            <FilterOptions>
              <FilterOption>
                <input type="checkbox" />
                Fashion Store
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Premium Line
              </FilterOption>
              <FilterOption>
                <input type="checkbox" />
                Luxury Collection
              </FilterOption>
            </FilterOptions>
          </FilterGroup>
        </FilterContainer>
      </Container>
    </FilterSection>
  )
}

export default ProductFilters