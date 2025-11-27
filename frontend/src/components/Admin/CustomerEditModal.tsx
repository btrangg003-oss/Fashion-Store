import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiAlertCircle, FiMail, FiCheck } from 'react-icons/fi';

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  dateOfBirth?: string;
  gender?: string;
  notes?: string;
}

interface CustomerEditModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCustomer: Partial<Customer>) => Promise<void>;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    notes: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Email change states
  const [newEmail, setNewEmail] = useState('');
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        dateOfBirth: customer.dateOfBirth || '',
        gender: customer.gender || '',
        notes: customer.notes || '',
        status: customer.status || 'active'
      });
      setNewEmail('');
      setShowEmailChange(false);
      setShowVerification(false);
      setVerificationCode('');
      setError('');
      setSuccess('');
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await onSave(formData);
      setSuccess('Đã cập nhật thông tin thành công!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }

    setEmailLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/customers/change-email/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id,
          newEmail: newEmail
        })
      });

      const data = await res.json();

      if (data.success) {
        setShowVerification(true);
        setSuccess('Đã gửi mã xác nhận đến email mới!');
      } else {
        setError(data.error || 'Không thể gửi mã xác nhận');
      }
    } catch (err) {
      setError('Lỗi khi gửi mã xác nhận');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyAndChangeEmail = async () => {
    if (!verificationCode) {
      setError('Vui lòng nhập mã xác nhận');
      return;
    }

    setEmailLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/customers/change-email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id,
          newEmail: newEmail,
          code: verificationCode
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('Đã thay đổi email thành công!');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || 'Mã xác nhận không đúng');
      }
    } catch (err) {
      setError('Lỗi khi xác nhận mã');
    } finally {
      setEmailLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Modal
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <ModalHeader>
              <ModalTitle>Chỉnh sửa khách hàng</ModalTitle>
              <CloseButton onClick={onClose}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <ModalBody>
                {error && (
                  <ErrorMessage>
                    <FiAlertCircle />
                    {error}
                  </ErrorMessage>
                )}

                {success && (
                  <SuccessMessage>
                    <FiCheck />
                    {success}
                  </SuccessMessage>
                )}

                <FormRow>
                  <FormGroup>
                    <Label>Họ</Label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Nhập họ"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Tên</Label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Nhập tên"
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label>Email hiện tại</Label>
                  <Input
                    type="email"
                    value={customer.email}
                    disabled
                  />
                  <ChangeEmailButton 
                    type="button"
                    onClick={() => setShowEmailChange(!showEmailChange)}
                  >
                    <FiMail /> {showEmailChange ? 'Hủy thay đổi email' : 'Thay đổi email'}
                  </ChangeEmailButton>
                </FormGroup>

                {showEmailChange && (
                  <EmailChangeSection>
                    <FormGroup>
                      <Label>Email mới</Label>
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Nhập email mới"
                        disabled={showVerification}
                      />
                    </FormGroup>

                    {!showVerification ? (
                      <ActionButton 
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={emailLoading || !newEmail}
                      >
                        <FiMail />
                        {emailLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                      </ActionButton>
                    ) : (
                      <>
                        <FormGroup>
                          <Label>Mã xác nhận (đã gửi đến {newEmail})</Label>
                          <Input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Nhập mã 6 số"
                            maxLength={6}
                          />
                        </FormGroup>
                        <ActionButton 
                          type="button"
                          onClick={handleVerifyAndChangeEmail}
                          disabled={emailLoading || !verificationCode}
                        >
                          <FiCheck />
                          {emailLoading ? 'Đang xác nhận...' : 'Xác nhận và thay đổi'}
                        </ActionButton>
                      </>
                    )}
                  </EmailChangeSection>
                )}

                <FormGroup>
                  <Label>Trạng thái tài khoản</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">✅ Hoạt động bình thường</option>
                    <option value="blocked">🚫 Bị chặn (không thể đăng nhập)</option>
                    <option value="restricted">⚠️ Hạn chế (không dùng AI, cart, wishlist)</option>
                  </Select>
                  <HelpText>
                    {formData.status === 'active' && 'Khách hàng có thể sử dụng đầy đủ chức năng'}
                    {formData.status === 'blocked' && 'Khách hàng không thể đăng nhập vào hệ thống'}
                    {formData.status === 'restricted' && 'Khách hàng bị hạn chế một số tính năng'}
                  </HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>Số điện thoại</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label>Ngày sinh</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Giới tính</Label>
                    <Select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </Select>
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label>Ghi chú</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Thêm ghi chú về khách hàng..."
                    rows={4}
                  />
                </FormGroup>
              </ModalBody>

              <ModalFooter>
                <CancelButton type="button" onClick={onClose}>
                  Hủy
                </CancelButton>
                <SaveButton type="submit" disabled={loading}>
                  <FiSave />
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </SaveButton>
              </ModalFooter>
            </Form>
          </Modal>
        </>
      )}
    </AnimatePresence>
  );
};

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  backdrop-filter: blur(4px);
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 !important;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
    color: #111827;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const ChangeEmailButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #3b82f6;
  background: white;
  color: #3b82f6;
  font-size: 0.813rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #eff6ff;
  }
`;

const EmailChangeSection = styled.div`
  padding: 1.5rem;
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const HelpText = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: #6b7280;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default CustomerEditModal;
