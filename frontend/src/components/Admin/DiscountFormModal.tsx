import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface DiscountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  discount?: any;
  mode: 'create' | 'edit';
}

export default function DiscountFormModal({ isOpen, onClose, onSubmit, discount, mode }: DiscountFormModalProps) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    maxUses: '',
    expiryDate: '',
    minOrderValue: '',
    status: 'active'
  });

  useEffect(() => {
    if (discount && mode === 'edit') {
      setFormData({
        code: discount.code || '',
        type: discount.type || 'percentage',
        value: discount.value?.toString() || '',
        maxUses: discount.maxUses?.toString() || '',
        expiryDate: discount.expiryDate ? new Date(discount.expiryDate).toISOString().split('T')[0] : '',
        minOrderValue: discount.minOrderValue?.toString() || '',
        status: discount.status || 'active'
      });
    } else {
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        maxUses: '',
        expiryDate: '',
        minOrderValue: '',
        status: 'active'
      });
    }
  }, [discount, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      code: formData.code.toUpperCase(),
      value: parseFloat(formData.value) || 0,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      used: discount?.used || 0
    };

    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>
              {mode === 'create' ? '💰 Tạo Mã Giảm Giá' : '✏️ Sửa Mã Giảm Giá'}
            </ModalTitle>
            <CloseButton onClick={onClose}><FiX /></CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label>Mã giảm giá <Required>*</Required></Label>
                <Input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="VD: SALE50"
                  required
                  style={{ textTransform: 'uppercase' }}
                />
                <Helper>Chữ in hoa, không dấu, không khoảng trắng</Helper>
              </FormGroup>

              <FormRow>
                <FormGroup>
                  <Label>Loại giảm giá <Required>*</Required></Label>
                  <Select name="type" value={formData.type} onChange={handleChange} required>
                    <option value="percentage">% Phần trăm</option>
                    <option value="fixed">₫ Số tiền cố định</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Giá trị <Required>*</Required></Label>
                  <Input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                  />
                  <Helper>{formData.type === 'percentage' ? '% (0-100)' : 'VNĐ'}</Helper>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>Số lần sử dụng tối đa</Label>
                  <Input
                    type="number"
                    name="maxUses"
                    value={formData.maxUses}
                    onChange={handleChange}
                    placeholder="Không giới hạn"
                    min="1"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Ngày hết hạn</Label>
                  <Input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label>Giá trị đơn hàng tối thiểu</Label>
                <Input
                  type="number"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
                <Helper>VNĐ (Để trống nếu không yêu cầu)</Helper>
              </FormGroup>

              <FormGroup>
                <Label>Trạng thái</Label>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={handleChange}
                    />
                    <span>Hoạt động</span>
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={handleChange}
                    />
                    <span>Tạm dừng</span>
                  </RadioLabel>
                </RadioGroup>
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <CancelButton type="button" onClick={onClose}>Hủy</CancelButton>
              <SubmitButton type="submit">
                {mode === 'create' ? '✅ Tạo Mã' : '💾 Lưu'}
              </SubmitButton>
            </ModalFooter>
          </Form>
        </ModalContainer>
      </Overlay>
    </AnimatePresence>
  );
}

// Styled Components (tái sử dụng từ ProductFormModal)
const Overlay = styled(motion.div)`position: fixed;top: 0;left: 0;right: 0;bottom: 0;background: rgba(0, 0, 0, 0.5);display: flex;align-items: center;justify-content: center;z-index: 10000;padding: 1rem;`;
const ModalContainer = styled(motion.div)`background: white;border-radius: 12px;width: 100%;max-width: 700px;max-height: 90vh;overflow: hidden;display: flex;flex-direction: column;`;
const ModalHeader = styled.div`padding: 1.5rem;border-bottom: 1px solid #e5e7eb;display: flex;justify-content: space-between;align-items: center;`;
const ModalTitle = styled.h2`font-size: 1.5rem;font-weight: 700;color: #1f2937;margin: 0;`;
const CloseButton = styled.button`background: none;border: none;font-size: 1.5rem;color: #9ca3af;cursor: pointer;padding: 0.25rem;display: flex;align-items: center;justify-content: center;border-radius: 6px;transition: all 0.2s;&:hover {background: #f3f4f6;color: #4b5563;}`;
const Form = styled.form`display: flex;flex-direction: column;flex: 1;overflow: hidden;`;
const ModalBody = styled.div`padding: 1.5rem;overflow-y: auto;flex: 1;`;
const FormRow = styled.div`display: grid;grid-template-columns: 1fr 1fr;gap: 1rem;margin-bottom: 1rem;@media (max-width: 640px) {grid-template-columns: 1fr;}`;
const FormGroup = styled.div`margin-bottom: 1rem;`;
const Label = styled.label`display: block;font-size: 0.875rem;font-weight: 600;color: #374151;margin-bottom: 0.5rem;`;
const Required = styled.span`color: #ef4444;`;
const Input = styled.input`width: 100%;padding: 0.75rem;border: 1px solid #e5e7eb;border-radius: 8px;font-size: 1rem;transition: all 0.2s;&:focus {outline: none;border-color: #3b82f6;box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);}&::placeholder {color: #9ca3af;}`;
const Select = styled.select`width: 100%;padding: 0.75rem;border: 1px solid #e5e7eb;border-radius: 8px;font-size: 1rem;background: white;cursor: pointer;transition: all 0.2s;&:focus {outline: none;border-color: #3b82f6;box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);}`;
const Helper = styled.div`font-size: 0.75rem;color: #6b7280;margin-top: 0.25rem;`;
const RadioGroup = styled.div`display: flex;gap: 1.5rem;`;
const RadioLabel = styled.label`display: flex;align-items: center;gap: 0.5rem;cursor: pointer;input[type="radio"] {width: 18px;height: 18px;cursor: pointer;}span {font-size: 0.875rem;color: #374151;}`;
const ModalFooter = styled.div`padding: 1.5rem;border-top: 1px solid #e5e7eb;display: flex;gap: 1rem;justify-content: flex-end;`;
const CancelButton = styled.button`padding: 0.75rem 1.5rem;background: white;border: 1px solid #e5e7eb;border-radius: 8px;cursor: pointer;font-weight: 500;color: #4b5563;transition: all 0.2s;&:hover {background: #f9fafb;}`;
const SubmitButton = styled.button`padding: 0.75rem 1.5rem;background: #3b82f6;color: white;border: none;border-radius: 8px;cursor: pointer;font-weight: 600;transition: all 0.2s;&:hover {background: #2563eb;}&:disabled {background: #9ca3af;cursor: not-allowed;}`;
