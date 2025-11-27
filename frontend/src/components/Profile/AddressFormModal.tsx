import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiAlertCircle } from 'react-icons/fi'
import { Address, AddressInput } from '@/models/address'
import LocationSelector from './LocationSelector'

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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
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

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  
  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 16px;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
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

const Button = styled(motion.button)`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  
  &.cancel {
    background: #f0f0f0;
    color: #333;
    
    &:hover {
      background: #e0e0e0;
    }
  }
  
  &.submit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      opacity: 0.9;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`

interface AddressFormModalProps {
  address?: Address | null
  onClose: () => void
  onSuccess: () => void
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  address,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<AddressInput>>({
    type: 'home',
    fullName: '',
    phone: '',
    province: '',
    provinceCode: '',
    district: '',
    districtCode: '',
    ward: '',
    wardCode: '',
    street: '',
    isDefault: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (address) {
      setFormData({
        type: address.type,
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        province: address.province,
        provinceCode: address.provinceCode,
        district: address.district,
        districtCode: address.districtCode,
        ward: address.ward,
        wardCode: address.wardCode,
        street: address.street,
        isDefault: address.isDefault
      })
    }
  }, [address])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleLocationChange = (location: any) => {
    setFormData(prev => ({
      ...prev,
      ...location
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const url = address
        ? `/api/profile/addresses/${address.id}`
        : '/api/profile/addresses'

      const method = address ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
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
            <Title>{address ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</Title>
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
                <Label>Loại địa chỉ</Label>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="type"
                      value="home"
                      checked={formData.type === 'home'}
                      onChange={handleChange}
                    />
                    🏠 Nhà riêng
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="type"
                      value="office"
                      checked={formData.type === 'office'}
                      onChange={handleChange}
                    />
                    🏢 Văn phòng
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="type"
                      value="other"
                      checked={formData.type === 'other'}
                      onChange={handleChange}
                    />
                    📍 Khác
                  </RadioLabel>
                </RadioGroup>
              </FormGroup>

              <FormGroup>
                <Label>Họ và tên *</Label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Số điện thoại *</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0123456789"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Địa chỉ</Label>
                <LocationSelector
                  provinceCode={formData.provinceCode}
                  districtCode={formData.districtCode}
                  wardCode={formData.wardCode}
                  onChange={handleLocationChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Địa chỉ cụ thể *</Label>
                <Textarea
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường..."
                  required
                />
              </FormGroup>

              <Checkbox>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                />
                Đặt làm địa chỉ mặc định
              </Checkbox>
            </Content>

            <Footer>
              <Button
                type="button"
                className="cancel"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </Button>
            </Footer>
          </form>
        </Modal>
      </Overlay>
    </AnimatePresence>
  )
}

export default AddressFormModal
