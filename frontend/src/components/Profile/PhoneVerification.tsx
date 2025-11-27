import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiCheck, FiAlertCircle, FiPhone } from 'react-icons/fi'

const Container = styled.div``

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
`

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const Button = styled(motion.button)`
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: #667eea;
  color: white;
  white-space: nowrap;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
`

const OTPModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled(motion.div)`
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
`

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 1.2rem;
  color: #333;
`

const OTPInput = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.5rem;
  text-align: center;
  letter-spacing: 8px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`

interface PhoneVerificationProps {
  currentPhone: string
  phoneVerified: boolean
  onPhoneUpdate: (phone: string) => void
}

const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  currentPhone,
  phoneVerified,
  onPhoneUpdate
}) => {
  const [phone, setPhone] = useState(currentPhone)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [otp, setOTP] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      alert('Vui lòng nhập số điện thoại hợp lệ')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/profile/verify-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (response.ok) {
        setShowOTPModal(true)
        alert(`Mã OTP đã được gửi đến ${phone}`)
      } else {
        alert(data.message || 'Gửi OTP thất bại')
      }
    } catch (error) {
      alert('Không thể gửi OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      alert('Vui lòng nhập mã OTP 6 số')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/profile/confirm-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phone, otp })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Xác minh số điện thoại thành công!')
        setShowOTPModal(false)
        onPhoneUpdate(phone)
        window.location.reload()
      } else {
        alert(data.message || 'Mã OTP không đúng')
      }
    } catch (error) {
      alert('Không thể xác minh OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <FormGroup>
        <Label>
          <FiPhone />
          Số điện thoại
          <VerificationBadge verified={phoneVerified}>
            {phoneVerified ? <><FiCheck /> Đã xác minh</> : <><FiAlertCircle /> Chưa xác minh</>}
          </VerificationBadge>
        </Label>
        <InputGroup>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            disabled={phoneVerified}
          />
          {!phoneVerified && (
            <Button
              onClick={handleSendOTP}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Đang gửi...' : 'Xác minh'}
            </Button>
          )}
        </InputGroup>
      </FormGroup>

      {showOTPModal && (
        <OTPModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowOTPModal(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalTitle>Nhập mã OTP</ModalTitle>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '16px' }}>
              Mã OTP đã được gửi đến số điện thoại {phone}
            </p>
            <OTPInput
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
            />
            <ButtonGroup>
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ flex: 1 }}
              >
                {loading ? 'Đang xác minh...' : 'Xác nhận'}
              </Button>
              <Button
                onClick={() => setShowOTPModal(false)}
                style={{ flex: 1, background: '#f5f5f5', color: '#666' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Hủy
              </Button>
            </ButtonGroup>
          </ModalContent>
        </OTPModal>
      )}
    </Container>
  )
}

export default PhoneVerification
