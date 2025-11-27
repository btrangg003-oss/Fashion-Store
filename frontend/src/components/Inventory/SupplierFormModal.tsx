import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiSave } from 'react-icons/fi';
import { Supplier } from '@/models/inventory';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSave: (data: Partial<Supplier>) => Promise<void>;
}

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    taxCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Net 30',
    currency: 'VND',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        companyName: supplier.companyName || '',
        taxCode: supplier.taxCode || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        paymentTerms: supplier.paymentTerms || 'Net 30',
        currency: supplier.currency || 'VND',
        notes: supplier.notes || ''
      });
    } else {
      setFormData({
        name: '',
        companyName: '',
        taxCode: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        paymentTerms: 'Net 30',
        currency: 'VND',
        notes: ''
      });
    }
  }, [supplier]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhà cung cấp là bắt buộc';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Tên công ty là bắt buộc';
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Người liên hệ là bắt buộc';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{supplier ? '✏️ Chỉnh Sửa Nhà Cung Cấp' : '➕ Thêm Nhà Cung Cấp'}</Title>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Tên nhà cung cấp <Required>*</Required></Label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: ABC Supply Co."
                error={!!errors.name}
              />
              {errors.name && <ErrorText>{errors.name}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Tên công ty <Required>*</Required></Label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="VD: Công ty TNHH ABC"
                error={!!errors.companyName}
              />
              {errors.companyName && <ErrorText>{errors.companyName}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Mã số thuế</Label>
              <Input
                value={formData.taxCode}
                onChange={(e) => handleChange('taxCode', e.target.value)}
                placeholder="VD: 0123456789"
              />
            </FormGroup>

            <FormGroup>
              <Label>Người liên hệ <Required>*</Required></Label>
              <Input
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                error={!!errors.contactPerson}
              />
              {errors.contactPerson && <ErrorText>{errors.contactPerson}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Email <Required>*</Required></Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="VD: contact@abc.com"
                error={!!errors.email}
              />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Số điện thoại <Required>*</Required></Label>
              <Input
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="VD: 0901234567"
                error={!!errors.phone}
              />
              {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
            </FormGroup>

            <FormGroup fullWidth>
              <Label>Địa chỉ <Required>*</Required></Label>
              <TextArea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Nhập địa chỉ đầy đủ..."
                rows={2}
                error={!!errors.address}
              />
              {errors.address && <ErrorText>{errors.address}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Điều khoản thanh toán</Label>
              <Select
                value={formData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
              >
                <option value="COD">COD - Thanh toán khi nhận hàng</option>
                <option value="Net 7">Net 7 - Thanh toán trong 7 ngày</option>
                <option value="Net 15">Net 15 - Thanh toán trong 15 ngày</option>
                <option value="Net 30">Net 30 - Thanh toán trong 30 ngày</option>
                <option value="Net 60">Net 60 - Thanh toán trong 60 ngày</option>
                <option value="Net 90">Net 90 - Thanh toán trong 90 ngày</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Đơn vị tiền tệ</Label>
              <Select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
              >
                <option value="VND">VND - Việt Nam Đồng</option>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="CNY">CNY - Chinese Yuan</option>
              </Select>
            </FormGroup>

            <FormGroup fullWidth>
              <Label>Ghi chú</Label>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Ghi chú thêm về nhà cung cấp..."
                rows={3}
              />
            </FormGroup>
          </FormGrid>

          <Footer>
            <CancelButton type="button" onClick={onClose}>
              Hủy
            </CancelButton>
            <SaveButton type="submit" disabled={loading}>
              <FiSave /> {loading ? 'Đang lưu...' : 'Lưu'}
            </SaveButton>
          </Footer>
        </Form>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
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
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #e5e7eb;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
  
  svg {
    font-size: 20px;
    color: #6b7280;
  }
`;

const Form = styled.form`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  grid-column: ${props => props.fullWidth ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const Required = styled.span`
  color: #ef4444;
`;

const Input = styled.input<{ error?: boolean }>`
  padding: 10px 14px;
  border: 2px solid ${props => props.error ? '#fecaca' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#3b82f6'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea<{ error?: boolean }>`
  padding: 10px 14px;
  border: 2px solid ${props => props.error ? '#fecaca' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#ef4444' : '#3b82f6'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ErrorText = styled.div`
  font-size: 12px;
  color: #ef4444;
  margin-top: -4px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 2px solid #e5e7eb;
  margin-top: 20px;
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default SupplierFormModal;
