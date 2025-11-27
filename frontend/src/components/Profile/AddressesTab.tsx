import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiPlus, FiAlertCircle } from 'react-icons/fi'
import { Address } from '@/models/address'
import AddressList from './AddressList'
import AddressFormModal from './AddressFormModal'

const Container = styled.div`
  max-width: 900px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #333;
`

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  
  svg {
    font-size: 1.2rem;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
`

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 16px;
`

const EmptyTitle = styled.h3`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.2rem;
`

const EmptyText = styled.p`
  margin: 0 0 24px 0;
  color: #666;
  font-size: 0.95rem;
`

const Message = styled(motion.div)<{ type: 'success' | 'error' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  background: ${props => props.type === 'success' ? '#d4edda' : '#f8d7da'};
  color: ${props => props.type === 'success' ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.type === 'success' ? '#c3e6cb' : '#f5c6cb'};
`

const AddressesTab: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/profile/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setAddresses(data.addresses)
      }
    } catch (error) {
      console.error('Fetch addresses error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setShowModal(true)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return

    try {
      const response = await fetch(`/api/profile/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Xóa địa chỉ thành công' })
        fetchAddresses()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Xóa địa chỉ thất bại' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể xóa địa chỉ' })
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/profile/addresses/${id}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Đã đặt làm địa chỉ mặc định' })
        fetchAddresses()
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.message || 'Thao tác thất bại' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể đặt địa chỉ mặc định' })
    }
  }

  const handleSaveSuccess = () => {
    setShowModal(false)
    setEditingAddress(null)
    setMessage({ type: 'success', text: editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công' })
    fetchAddresses()
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return <Container>Đang tải...</Container>
  }

  return (
    <Container>
      {message && (
        <Message
          type={message.type}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiAlertCircle />
          {message.text}
        </Message>
      )}

      <Header>
        <Title>📍 Địa chỉ giao hàng</Title>
        <AddButton
          onClick={handleAddNew}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus />
          Thêm địa chỉ mới
        </AddButton>
      </Header>

      {addresses.length === 0 ? (
        <EmptyState>
          <EmptyIcon>📍</EmptyIcon>
          <EmptyTitle>Chưa có địa chỉ giao hàng</EmptyTitle>
          <EmptyText>
            Thêm địa chỉ để đặt hàng nhanh chóng hơn
          </EmptyText>
          <AddButton
            onClick={handleAddNew}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus />
            Thêm địa chỉ đầu tiên
          </AddButton>
        </EmptyState>
      ) : (
        <AddressList
          addresses={addresses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSetDefault={handleSetDefault}
        />
      )}

      {showModal && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => {
            setShowModal(false)
            setEditingAddress(null)
          }}
          onSuccess={handleSaveSuccess}
        />
      )}
    </Container>
  )
}

export default AddressesTab
