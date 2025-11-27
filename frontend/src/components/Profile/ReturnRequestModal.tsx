import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiAlertCircle } from 'react-icons/fi'
import { Order } from '@/models/orders'
import { RETURN_REASONS } from '@/models/returns'

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`

const Modal = styled(motion.div)`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: #333;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  border-radius: 50%;
  transition: all 0.3s;
  
  &:hover {
    background: #f0f0f0;
  }
`

const Content = styled.div`
  padding: 24px;
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
`

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #667eea;
    background: #f9f9ff;
  }
  
  input[type="radio"] {
    width: 18px;
    height: 18px;
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 100px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const ErrorMessage = styled.div`
  background: #fee;
  color: #e53e3e;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`

const Footer = styled.div`
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  background: white;
`

const Button = styled(motion.button)<{ primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  ` : `
    background: #f0f0f0;
    color: #333;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

interface ReturnRequestModalProps {
  onClose: () => void
  onSuccess: () => void
}

const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ onClose, onSuccess }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDeliveredOrders()
  }, [])

  const fetchDeliveredOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=delivered', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        setOrders(data.orders || data.data || [])
      }
    } catch (error) {
      console.error('Fetch orders error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedOrder) {
      setError('Vui lòng chọn đơn hàng')
      return
    }

    if (!reason) {
      setError('Vui lòng chọn lý do trả hàng')
      return
    }

    if (description.trim().length < 20) {
      setError('Mô tả phải có ít nhất 20 ký tự')
      return
    }

    setLoading(true)

    try {
      const order = orders.find(o => o.id === selectedOrder)
      if (!order) return

      const reasonObj = RETURN_REASONS.find(r => r.value === reason)

      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: selectedOrder,
          items: order.items.map((item: any) => ({
            productId: item.productId || item.id || '',
            productName: item.name || item.productName || '',
            image: typeof item.image === 'string' ? item.image : item.image?.url || '',
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            reason: reasonObj?.label || reason
          })),
          reason,
          reasonText: reasonObj?.label || reason,
          description,
          photos: [],
          refundMethod: 'wallet'
        })
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
      } else {
        setError(data.message || 'Có lỗi xảy ra')
      }
    } catch (err) {
      setError('Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Modal
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Header>
            <Title>Yêu cầu trả hàng</Title>
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </Header>

          <form onSubmit={handleSubmit}>
            <Content>
              {error && (
                <ErrorMessage>
                  <FiAlertCircle />
                  {error}
                </ErrorMessage>
              )}

              <FormGroup>
                <Label>Chọn đơn hàng đã giao *</Label>
                <Select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  required
                >
                  <option value="">-- Chọn đơn hàng --</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      #{order.orderNumber} - {order.total?.toLocaleString('vi-VN')}₫
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Lý do trả hàng *</Label>
                <RadioGroup>
                  {RETURN_REASONS.map(r => (
                    <RadioLabel key={r.value}>
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <span>{r.icon} {r.label}</span>
                    </RadioLabel>
                  ))}
                </RadioGroup>
              </FormGroup>

              <FormGroup>
                <Label>Mô tả chi tiết * (tối thiểu 20 ký tự)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Vui lòng mô tả chi tiết lý do trả hàng..."
                  required
                />
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>
                  {description.length}/20 ký tự
                </div>
              </FormGroup>
            </Content>

            <Footer>
              <Button type="button" onClick={onClose}>
                Hủy
              </Button>
              <Button
                type="submit"
                primary
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </Footer>
          </form>
        </Modal>
      </Overlay>
    </AnimatePresence>
  )
}

export default ReturnRequestModal
