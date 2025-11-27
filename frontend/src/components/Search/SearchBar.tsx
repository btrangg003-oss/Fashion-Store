import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { FiSearch, FiX } from 'react-icons/fi';
import Image from 'next/image';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

interface SearchSuggestion {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  categoryId: string;
}

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #a0aec0;
  display: flex;
  align-items: center;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 50px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0.25rem;
  
  &:hover {
    color: #4a5568;
  }
`;

const SuggestionsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  border: 1px solid #e2e8f0;
`;

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f7fafc;
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 12px 12px;
  }
`;

const SuggestionImageContainer = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
`;

const SuggestionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuggestionName = styled.div`
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SuggestionPrice = styled.div`
  color: #e53e3e;
  font-weight: 600;
  font-size: 0.875rem;
`;

const NoResults = styled.div`
  padding: 2rem;
  text-align: center;
  color: #718096;
`;

const LoadingSpinner = styled.div`
  padding: 2rem;
  text-align: center;
  color: #718096;
`;

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Tìm kiếm sản phẩm...', 
  onSearch 
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const result = await response.json();

      if (result.success) {
        setSuggestions(result.data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce
  }, [fetchSuggestions]);

  // Handle search submit
  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!query.trim()) {
      router.push('/products');
      return;
    }

    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(query);
    } else {
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [query, onSearch, router]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    router.push(`/products/${suggestion.id}`);
  }, [router]);

  // Clear search
  const handleClear = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  // Handle focus
  const handleFocus = useCallback(() => {
    if (query) {
      setShowSuggestions(true);
    }
  }, [query]);

  // Format currency
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }, []);

  return (
    <SearchContainer ref={searchRef}>
      <form onSubmit={handleSearch}>
        <SearchInputWrapper>
          <SearchIcon>
            <FiSearch size={20} />
          </SearchIcon>
          
          <SearchInput
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder={placeholder}
          />
          
          {query && (
            <ClearButton type="button" onClick={handleClear}>
              <FiX size={20} />
            </ClearButton>
          )}
        </SearchInputWrapper>
      </form>

      {showSuggestions && (
        <SuggestionsDropdown>
          {loading ? (
            <LoadingSpinner>Đang tìm kiếm...</LoadingSpinner>
          ) : suggestions.length > 0 ? (
            suggestions.map(suggestion => (
              <SuggestionItem
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <SuggestionImageContainer>
                  <Image 
                    src={suggestion.image} 
                    alt={suggestion.name}
                    width={50}
                    height={50}
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                </SuggestionImageContainer>
                <SuggestionInfo>
                  <SuggestionName>{suggestion.name}</SuggestionName>
                  <SuggestionPrice>{formatCurrency(suggestion.price)}</SuggestionPrice>
                </SuggestionInfo>
              </SuggestionItem>
            ))
          ) : (
            <NoResults>
              Không tìm thấy sản phẩm nào với từ khóa "{query}"
            </NoResults>
          )}
        </SuggestionsDropdown>
      )}
    </SearchContainer>
  );
};

export default SearchBar;