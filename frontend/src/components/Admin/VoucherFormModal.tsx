import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Voucher, VoucherType, VoucherTargetAudience } from '@/models/voucher';
import { FaTimes, FaRandom } from 'react-icons/fa';
import CustomerSearchInput from './CustomerSearchInput';

interface VoucherFormModalProps {
  voucher?: Voucher | null;
  onClose: () => void;
  onSave: (data: Partial<Voucher>) => Promise<void>;
}

const VoucherFormModal: React.FC<VoucherFormModalProps> = ({ voucher, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage' as VoucherType,
    value: 0,
    maxDiscount: undefined as number | undefined,
    startDate: '',
    endDate: '',
    minOrderValue: 0,
    maxUsageTotal: 1000,
    maxUsagePerUser: 1,
    targetAudience: 'all' as VoucherTargetAudience,
    targetTiers: [] as string[],
    specificUserIds: [] as string[],
    noStacking: false,
    noSaleProducts: false,
    isPublic: true,
    eventLabel: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (voucher) {
      setFormData({
        code: voucher.code,
        description: voucher.description,
        type: voucher.type,
        value: voucher.value,
        maxDiscount: voucher.maxDiscount,
        startDate: voucher.startDate.split('T')[0],
        endDate: voucher.endDate.split('T')[0],
        minOrderValue: voucher.minOrderValue,
        maxUsageTotal: voucher.maxUsageTotal,
        maxUsagePerUser: voucher.maxUsagePerUser,
        targetAudience: voucher.targetAudience,
        targetTiers: voucher.targetTiers || [],
        specificUserIds: voucher.specificUserIds || [],
        noStacking: voucher.noStacking,
        noSaleProducts: voucher.noSaleProducts,
        isPublic: voucher.isPublic,
        eventLabel: voucher.eventLabel || '',
        isActive: voucher.isActive
      });
    }
  }, [voucher]);

  const handleGenerateCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/vouchers/generate-code', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, code: data.code }));
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.code || formData.code.length < 6 || formData.code.length > 20) {
        throw new Error('Mã voucher phải từ 6-20 ký tự');
      }

      if (!/^[A-Z0-9]+$/.test(formData.code)) {
        throw new Error('Mã voucher chỉ chứa chữ in hoa và số');
      }

      if (formData.value <= 0) {
        throw new Error('Giá trị giảm phải lớn hơn 0');
      }

      if (formData.type === 'percentage' && formData.value > 100) {
        throw new Error('Phần trăm giảm không được vượt quá 100%');
      }

      if (formData.type === 'percentage' && formData.maxDiscount && formData.maxDiscount <= 0) {
        throw new Error('Mức giảm giá tối đa phải lớn hơn 0');
      }

      if (!formData.startDate || !formData.endDate) {
        throw new Error('Vui lòng chọn thời gian áp dụng');
      }

      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      // Prepare data
      const submitData: any = {
        ...formData,
        code: formData.code.toUpperCase(),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxDiscount: formData.type === 'percentage' ? formData.maxDiscount : undefined,
        targetTiers: formData.targetTiers as any,
        specificUserIds: formData.specificUserIds
      };

      await onSave(submitData);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{voucher ? 'Chỉnh Sửa Voucher' : 'Tạo Voucher Mới'}</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Section>
            <SectionTitle>Thông Tin Cơ Bản</SectionTitle>
            
            <FormGroup>
              <Label>Mã Voucher *</Label>
              <CodeInputGroup>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: SUMMER2024"
                  maxLength={20}
                  required
                  disabled={!!voucher}
                />
                {!voucher && (
                  <GenerateButton type="button" onClick={handleGenerateCode}>
                    <FaRandom /> Tạo ngẫu nhiên
                  </GenerateButton>
                )}
              </CodeInputGroup>
              <Hint>6-20 ký tự, chỉ chữ in hoa và số</Hint>
            </FormGroup>

            <FormGroup>
              <Label>Mô Tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ghi chú nội bộ về voucher này..."
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Nhãn Sự Kiện</Label>
              <Input
                type="text"
                value={formData.eventLabel}
                onChange={(e) => setFormData({ ...formData, eventLabel: e.target.value })}
                placeholder="VD: BLACK FRIDAY, 11.11, TẾT 2024"
              />
            </FormGroup>
          </Section>

          <Section>
            <SectionTitle>Loại & Giá Trị Giảm</SectionTitle>
            
            <FormGroup>
              <Label>Loại Giảm Giá *</Label>
              <RadioGroup>
                <RadioLabel>
                  <input
                    type="radio"
                    value="percentage"
                    checked={formData.type === 'percentage'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VoucherType })}
                  />
                  Phần trăm (%)
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    value="fixed"
                    checked={formData.type === 'fixed'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VoucherType })}
                  />
                  Số tiền cố định (₫)
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    value="freeship"
                    checked={formData.type === 'freeship'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VoucherType })}
                  />
                  Miễn phí ship
                </RadioLabel>
              </RadioGroup>
            </FormGroup>

            <TwoColumns>
              <FormGroup>
                <Label>
                  {formData.type === 'percentage' ? 'Phần Trăm Giảm (%) *' : 'Giá Trị Giảm (₫) *'}
                </Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  min="0"
                  max={formData.type === 'percentage' ? 100 : undefined}
                  step={formData.type === 'percentage' ? 1 : 1000}
                  required
                />
              </FormGroup>

              {formData.type === 'percentage' && (
                <FormGroup>
                  <Label>Mức Giảm Tối Đa (₫)</Label>
                  <Input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    min="0"
                    step="1000"
                    placeholder="Không giới hạn"
                  />
                  <Hint>Để trống nếu không giới hạn</Hint>
                </FormGroup>
              )}
            </TwoColumns>
          </Section>

          <Section>
            <SectionTitle>Thời Gian Áp Dụng</SectionTitle>
            
            <TwoColumns>
              <FormGroup>
                <Label>Ngày Bắt Đầu *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Ngày Kết Thúc *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </FormGroup>
            </TwoColumns>
          </Section>

          <Section>
            <SectionTitle>Điều Kiện Áp Dụng</SectionTitle>
            
            <FormGroup>
              <Label>Giá Trị Đơn Tối Thiểu (₫)</Label>
              <Input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) })}
                min="0"
                step="1000"
              />
            </FormGroup>

            <TwoColumns>
              <FormGroup>
                <Label>Số Lần Sử Dụng Tối Đa</Label>
                <Input
                  type="number"
                  value={formData.maxUsageTotal}
                  onChange={(e) => setFormData({ ...formData, maxUsageTotal: parseInt(e.target.value) })}
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <Label>Số Lần/User</Label>
                <Input
                  type="number"
                  value={formData.maxUsagePerUser}
                  onChange={(e) => setFormData({ ...formData, maxUsagePerUser: parseInt(e.target.value) })}
                  min="1"
                />
              </FormGroup>
            </TwoColumns>

            <FormGroup>
              <Label>Đối Tượng Áp Dụng</Label>
              <Select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as VoucherTargetAudience })}
              >
                <option value="all">Tất cả khách hàng</option>
                <option value="new">Khách hàng mới</option>
                <option value="regular">Khách hàng thường</option>
                <option value="long-term">Khách hàng lâu năm</option>
                <option value="loyal">Khách hàng trung thành</option>
                <option value="vip">Khách hàng VIP</option>
                <option value="tier">Theo hạng thành viên</option>
                <option value="specific">Khách hàng cụ thể</option>
              </Select>
            </FormGroup>

            {formData.targetAudience === 'tier' && (
              <FormGroup>
                <Label>Chọn Hạng Thành Viên</Label>
                <CheckboxGroup>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.targetTiers.includes('bronze')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, targetTiers: [...formData.targetTiers, 'bronze'] });
                        } else {
                          setFormData({ ...formData, targetTiers: formData.targetTiers.filter(t => t !== 'bronze') });
                        }
                      }}
                    />
                    🥉 Hạng Đồng
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.targetTiers.includes('silver')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, targetTiers: [...formData.targetTiers, 'silver'] });
                        } else {
                          setFormData({ ...formData, targetTiers: formData.targetTiers.filter(t => t !== 'silver') });
                        }
                      }}
                    />
                    🥈 Hạng Bạc
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.targetTiers.includes('gold')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, targetTiers: [...formData.targetTiers, 'gold'] });
                        } else {
                          setFormData({ ...formData, targetTiers: formData.targetTiers.filter(t => t !== 'gold') });
                        }
                      }}
                    />
                    🥇 Hạng Vàng
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.targetTiers.includes('platinum')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, targetTiers: [...formData.targetTiers, 'platinum'] });
                        } else {
                          setFormData({ ...formData, targetTiers: formData.targetTiers.filter(t => t !== 'platinum') });
                        }
                      }}
                    />
                    💎 Hạng Bạch Kim
                  </CheckboxLabel>
                  <CheckboxLabel>
                    <input
                      type="checkbox"
                      checked={formData.targetTiers.includes('diamond')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, targetTiers: [...formData.targetTiers, 'diamond'] });
                        } else {
                          setFormData({ ...formData, targetTiers: formData.targetTiers.filter(t => t !== 'diamond') });
                        }
                      }}
                    />
                    💎 Hạng Kim Cương
                  </CheckboxLabel>
                </CheckboxGroup>
              </FormGroup>
            )}

            {formData.targetAudience === 'specific' && (
              <FormGroup>
                <Label>Chọn Khách Hàng</Label>
                <CustomerSearchInput
                  placeholder="Tìm kiếm khách hàng..."
                  onSelectCustomer={(customerId: string) => {
                    if (!formData.specificUserIds.includes(customerId)) {
                      setFormData({ 
                        ...formData, 
                        specificUserIds: [...formData.specificUserIds, customerId] 
                      });
                    }
                  }}
                />
                {formData.specificUserIds.length > 0 && (
                  <SelectedCustomersList>
                    {formData.specificUserIds.map((id: string) => (
                      <CustomerTag key={id}>
                        {id}
                        <RemoveCustomerButton onClick={() => {
                          setFormData({
                            ...formData,
                            specificUserIds: formData.specificUserIds.filter((uid: string) => uid !== id)
                          });
                        }}>×</RemoveCustomerButton>
                      </CustomerTag>
                    ))}
                  </SelectedCustomersList>
                )}
              </FormGroup>
            )}
          </Section>

          <Section>
            <SectionTitle>Cấu Hình Khác</SectionTitle>
            
            <CheckboxGroup>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.noStacking}
                  onChange={(e) => setFormData({ ...formData, noStacking: e.target.checked })}
                />
                Không chồng mã khác
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.noSaleProducts}
                  onChange={(e) => setFormData({ ...formData, noSaleProducts: e.target.checked })}
                />
                Không áp dụng với sản phẩm đang sale
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
                Hiển thị công khai
              </CheckboxLabel>

              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Kích hoạt ngay
              </CheckboxLabel>
            </CheckboxGroup>
          </Section>

          <Actions>
            <CancelButton type="button" onClick={onClose}>
              Hủy
            </CancelButton>
            <SaveButton type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : voucher ? 'Cập Nhật' : 'Tạo Voucher'}
            </SaveButton>
          </Actions>
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #111827;
  }
`;

const Form = styled.form`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const CodeInputGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const GenerateButton = styled.button`
  padding: 10px 16px;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover {
    background: #4b5563;
  }
`;

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;

  input[type="radio"] {
    cursor: pointer;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;

  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const Hint = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const SaveButton = styled.button`
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SelectedCustomersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
`;

const CustomerTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
`;

const RemoveCustomerButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;

  &:hover {
    color: #dc2626;
  }
`;

export default VoucherFormModal;
