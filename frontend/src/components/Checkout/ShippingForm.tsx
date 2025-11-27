import React, { useState } from 'react';
import styled from 'styled-components';

interface ShippingFormProps {
  onNext: (data: ShippingData) => void;
  initialData?: ShippingData;
}

export interface ShippingData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState<ShippingData>(initialData || {
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormTitle>Thông tin giao hàng</FormTitle>
      
      <FormGroup>
        <Label>Họ và tên *</Label>
        <Input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
          placeholder="Nguyễn Văn A"
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <Label>Số điện thoại *</Label>
          <Input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="0912345678"
          />
        </FormGroup>

        <FormGroup>
          <Label>Email *</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="email@example.com"
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Label>Địa chỉ *</Label>
        <Input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Số nhà, tên đường"
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <Label>Tỉnh/Thành phố *</Label>
          <Select name="city" value={formData.city} onChange={handleChange} required>
            <option value="">Chọn Tỉnh/Thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Hải Phòng">Hải Phòng</option>
            <option value="Cần Thơ">Cần Thơ</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Quận/Huyện *</Label>
          <Input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            placeholder="Quận/Huyện"
          />
        </FormGroup>
      </FormRow>

      <FormGroup>
        <Label>Phường/Xã *</Label>
        <Input
          type="text"
          name="ward"
          value={formData.ward}
          onChange={handleChange}
          required
          placeholder="Phường/Xã"
        />
      </FormGroup>

      <FormGroup>
        <Label>Ghi chú (tùy chọn)</Label>
        <TextArea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
          rows={3}
        />
      </FormGroup>

      <SubmitButton type="submit">Tiếp tục</SubmitButton>
    </Form>
  );
};

const Form = styled.form`
  max-width: 600px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #1f2937;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
  flex: 1;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

export default ShippingForm;
