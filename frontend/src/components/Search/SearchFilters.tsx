import { useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'

interface SearchFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

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

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #000;
`

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
`

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto 40px;
  position: relative;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 24px 16px 60px;
  border: 2px solid #ddd;
  border-radius: 50px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #667eea;
    outline: none;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 1.2rem;
`

const SearchButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  padding: 8px 20px;
  background: #667eea;
  color: white;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5a6fd8;
  }
`

const FilterToggle = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #000;
  color: white;
  border-radius: 8px;
  font-weight: 500;
  margin: 0 auto;
  
  @media (min-width: 769px) {
    display: none;
  }
`

const FilterContainer = styled(motion.div)<{ isOpen: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-top: 30px;
  
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
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: #000;
  }
`

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95rem;
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

const SearchFilters = ({ searchQuery, setSearchQuery }: SearchFiltersProps) => {
  const router = useRouter()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (localQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(localQuery.trim())}`)
      setSearchQuery(localQuery.trim())
    }
  }

  return (
    <FilterSection>
      <Container>
        <SearchHeader>
          <Title>Tìm kiếm sản phẩm</Title>
          <Subtitle>
            {searchQuery 
              ? `Kết quả tìm kiếm cho "${searchQuery}"`
              : 'Nhập từ khóa để tìm kiếm sản phẩm yêu thích'
            }
          </Subtitle>
        </SearchHeader>

        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchIcon>
              <FiSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
            <SearchButton type="submit">
              Tìm kiếm
            </SearchButton>
          </form>
        </SearchContainer>

        <FilterToggle onClick={() => setFiltersOpen(true)}>
          <FiFilter />
          Bộ lọc
        </FilterToggle>

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
            <h3>Khoảng giá</h3>
            <PriceRange>
              <input type="number" placeholder="Từ" />
              <span>-</span>
              <input type="number" placeholder="Đến" />
            </PriceRange>
          </FilterGroup>
        </FilterContainer>
      </Container>
    </FilterSection>
  )
}

export default SearchFilters