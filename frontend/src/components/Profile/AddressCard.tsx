import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiEdit2, FiTrash2, FiHome, FiBriefcase, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import { Address } from '@/models/address'

const Card = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`

const TypeBadge = styled.div<{ type: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    switch (props.type) {
      case 'home': return '#e3f2fd'
      case 'office': return '#fff3e0'
      default: return '#f3e5f5'
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'home': return '#1976d2'
      case 'office': return '#f57c00'
      default: return '#7b1fa2'
    }
  }};
  
  svg {
    font-size: 1rem;
  }
`

const DefaultBadge = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #d4edda;
  color: #155724;
  text-transform: uppercase;
`

const Info = styled.div`
  margin-bottom: 16px;
`

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.9rem;
  
  svg {
    color: #667eea;
    flex-shrink: 0;
  }
`

const Name = styled.div`
  font-weight: 600;
  font-size: 1rem;
`

const Phone = styled.div`
  color: #666;
`

const AddressText = styled.div`
  color: #666;
  line-height: 1.6;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`

const Button = styled(motion.button)`
  flex: 1;
  min-width: 100px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  
  &.edit {
    background: #f0f0f0;
    color: #333;
    
    &:hover {
      background: #e0e0e0;
    }
  }
  
  &.delete {
    background: #fee;
    color: #e53e3e;
    
    &:hover {
      background: #fdd;
    }
  }
  
  &.default {
    background: #667eea;
    color: white;
    
    &:hover {
      background: #5a67d8;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`

interface AddressCardProps {
  address: Address
  onEdit: () => void
  onDelete: () => void
  onSetDefault: () => void
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault
}) => {
  const getTypeIcon = () => {
    switch (address.type) {
      case 'home': return <FiHome />
      case 'office': return <FiBriefcase />
      default: return <FiMapPin />
    }
  }

  const getTypeLabel = () => {
    switch (address.type) {
      case 'home': return 'Nhà riêng'
      case 'office': return 'Văn phòng'
      default: return address.label || 'Khác'
    }
  }

  return (
    <Card
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <TypeBadge type={address.type}>
          {getTypeIcon()}
          {getTypeLabel()}
        </TypeBadge>
        {address.isDefault && <DefaultBadge>Mặc định</DefaultBadge>}
      </Header>

      <Info>
        <InfoRow>
          <FiUser />
          <Name>{address.fullName}</Name>
        </InfoRow>
        <InfoRow>
          <FiPhone />
          <Phone>{address.phone}</Phone>
        </InfoRow>
      </Info>

      <AddressText>
        <FiMapPin style={{ display: 'inline', marginRight: '6px' }} />
        {address.fullAddress}
      </AddressText>

      <Actions style={{ marginTop: '16px' }}>
        <Button
          className="edit"
          onClick={onEdit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiEdit2 />
          Sửa
        </Button>
        <Button
          className="delete"
          onClick={onDelete}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiTrash2 />
          Xóa
        </Button>
        {!address.isDefault && (
          <Button
            className="default"
            onClick={onSetDefault}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ flexBasis: '100%' }}
          >
            Đặt làm mặc định
          </Button>
        )}
      </Actions>
    </Card>
  )
}

export default AddressCard
