import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCheck, FiAlertCircle } from 'react-icons/fi'
import { BsGenderMale, BsGenderFemale, BsGenderAmbiguous } from 'react-icons/bs'
import { useAuth } from '../../contexts/AuthContext'
import AvatarUpload from './AvatarUpload'
import PhoneVerification from './PhoneVerification'
import AccountBadge from './AccountBadge'
import ChangeEmailRequestButton from './ChangeEmailRequestButton'
import ChangePhoneRequestButton from './ChangePhoneRequestButton'

const Container = styled.div`
  max-width: 800px;
`

const Section = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
`

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
`

const Input = styled.input`
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
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`

const GenderGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  
  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`

const GenderIcon = styled.span<{ color?: string }>`
  display: inline-flex;
  align-items: center;
  font-size: 1.2rem;
  color: ${props => props.color || '#667eea'};
  margin-left: 4px;
`

const VerificationBadge = styled.span<{ verified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.verified ? '#d4edda' : '#fff3cd'};
  color: ${props => props.verified ? '#155724' : '#856404'};
  
  svg {
    font-size: 0.9rem;
  }
`

const SaveButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

interface ProfileData {
  displayName: string
  gender: 'male' | 'female' | 'other' | ''
  dateOfBirth: string
  phone: string
}

const PersonalInfoTab: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState<ProfileData>({
    displayName: '',
    gender: '',
    dateOfBirth: '',
    phone: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || `${user.firstName} ${user.lastName}`,
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' })
        if (updateUser) {
          updateUser(data.user)
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Có lỗi xảy ra' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể kết nối đến server' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Đang tải...</div>
  }

  return (
    <Container>
      {message && (
        <Message
          type={message.type}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
          {message.text}
        </Message>
      )}

      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SectionTitle>📸 Ảnh đại diện</SectionTitle>
        <AvatarUpload 
          currentAvatar={user.avatar}
          onUploadSuccess={(avatarUrl) => {
            if (updateUser) {
              updateUser({ ...user, avatar: avatarUrl })
            }
          }}
        />
      </Section>

      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SectionTitle>👤 Thông tin cá nhân</SectionTitle>
        
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Tên hiển thị</Label>
              <Input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Nhập tên hiển thị"
              />
            </FormGroup>

            <FormGroup>
              <Label>Ngày sinh</Label>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </FormGroup>
          </FormGrid>

          <FormGroup>
            <Label>
              Giới tính
              {formData.gender === 'male' && (
                <GenderIcon color="#3b82f6">
                  <BsGenderMale />
                </GenderIcon>
              )}
              {formData.gender === 'female' && (
                <GenderIcon color="#ec4899">
                  <BsGenderFemale />
                </GenderIcon>
              )}
              {formData.gender === 'other' && (
                <GenderIcon color="#8b5cf6">
                  <BsGenderAmbiguous />
                </GenderIcon>
              )}
            </Label>
            <GenderGroup>
              <RadioLabel>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                />
                <BsGenderMale style={{ color: '#3b82f6', fontSize: '1.1rem' }} />
                Nam
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                />
                <BsGenderFemale style={{ color: '#ec4899', fontSize: '1.1rem' }} />
                Nữ
              </RadioLabel>
              <RadioLabel>
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={handleChange}
                />
                <BsGenderAmbiguous style={{ color: '#8b5cf6', fontSize: '1.1rem' }} />
                Khác
              </RadioLabel>
            </GenderGroup>
          </FormGroup>

          <SaveButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
          </SaveButton>
        </form>
      </Section>

      <Section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SectionTitle>📧 Email & Số điện thoại</SectionTitle>
        
        <FormGroup style={{ marginBottom: '20px' }}>
          <Label>
            Email
            <VerificationBadge verified={user.emailVerified || user.isVerified}>
              {(user.emailVerified || user.isVerified) ? <><FiCheck /> Đã xác minh</> : <><FiAlertCircle /> Chưa xác minh</>}
            </VerificationBadge>
          </Label>
          <Input
            type="email"
            value={user.email}
            disabled
          />
          <ChangeEmailRequestButton 
            currentEmail={user.email}
            onSuccess={() => {
              // Optionally refresh or show notification
              console.log('Email change request sent');
            }}
          />
        </FormGroup>

        <PhoneVerification
          currentPhone={formData.phone}
          phoneVerified={user.phoneVerified || false}
          onPhoneUpdate={(phone) => {
            setFormData(prev => ({ ...prev, phone }))
            if (updateUser) {
              updateUser({ phone, phoneVerified: true })
            }
          }}
        />
        <ChangePhoneRequestButton 
          currentPhone={formData.phone}
          onSuccess={() => {
            console.log('Phone change request sent');
          }}
        />
      </Section>


    </Container>
  )
}

export default PersonalInfoTab
