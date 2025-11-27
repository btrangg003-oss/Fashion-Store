import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaSearch, FaUser } from 'react-icons/fa';

interface Customer {
  id: string;
  username: string;
  email: string;
  tier?: string;
}

interface CustomerSearchInputProps {
  placeholder?: string;
  onSelectCustomer: (customerId: string) => void;
}

const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
  placeholder = 'Tìm kiếm khách hàng...',
  onSelectCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(c =>
        c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer: Customer) => {
    onSelectCustomer(customer.id);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const getTierBadge = (tier?: string) => {
    const badges: Record<string, string> = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💎'
    };
    return tier ? badges[tier] || '' : '';
  };

  return (
    <Wrapper ref={wrapperRef}>
      <SearchContainer>
        <SearchIcon><FaSearch /></SearchIcon>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />
      </SearchContainer>

      {showDropdown && (
        <Dropdown>
          {loading ? (
            <DropdownItem>Đang tải...</DropdownItem>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.slice(0, 10).map(customer => (
              <DropdownItem
                key={customer.id}
                onClick={() => handleSelect(customer)}
              >
                <CustomerInfo>
                  <FaUser />
                  <div>
                    <CustomerName>
                      {getTierBadge(customer.tier)} {customer.username}
                    </CustomerName>
                    <CustomerEmail>{customer.email}</CustomerEmail>
                  </div>
                </CustomerInfo>
              </DropdownItem>
            ))
          ) : (
            <DropdownItem>Không tìm thấy khách hàng</DropdownItem>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: #9ca3af;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
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

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: #6b7280;
    font-size: 16px;
  }
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  margin-bottom: 2px;
`;

const CustomerEmail = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

export default CustomerSearchInput;
