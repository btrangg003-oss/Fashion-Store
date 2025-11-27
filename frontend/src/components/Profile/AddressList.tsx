import React from 'react'
import styled from 'styled-components'
import { Address } from '@/models/address'
import AddressCard from './AddressCard'

const Container = styled.div`
  display: grid;
  gap: 16px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
`

interface AddressListProps {
  addresses: Address[]
  onEdit: (address: Address) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
}

const AddressList: React.FC<AddressListProps> = ({
  addresses,
  onEdit,
  onDelete,
  onSetDefault
}) => {
  // Sort: default first, then by creation date
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault) return -1
    if (b.isDefault) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Container>
      {sortedAddresses.map(address => (
        <AddressCard
          key={address.id}
          address={address}
          onEdit={() => onEdit(address)}
          onDelete={() => onDelete(address.id)}
          onSetDefault={() => onSetDefault(address.id)}
        />
      ))}
    </Container>
  )
}

export default AddressList
