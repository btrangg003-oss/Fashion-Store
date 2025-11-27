import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Campaign, CampaignType, CampaignTarget } from '@/models/campaign';
import { Voucher } from '@/models/voucher';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

interface CampaignFormModalProps {
  campaign?: Campaign | null;
  onClose: () => void;
  onSave: (data: Partial<Campaign>) => Promise<void>;
}

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({ campaign, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email' as CampaignType,
    startDate: '',
    endDate: '',
    targetAudience: 'all' as CampaignTarget,
    estimatedReach: 0,
    voucherIds: [] as string[],
    productIds: [] as string[],
    bannerImageUrl: '',
    landingPageUrl: '',
    emailSubject: '',
    emailTemplate: '',
    budget: 0,
    goalType: 'revenue' as 'revenue' | 'orders' | 'signups' | 'engagement',
    goalValue: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([]);
  const [selectedVouchers, setSelectedVouchers] = useState<Voucher[]>([]);

  useEffect(() => {
    fetchVouchers();
    
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        startDate: campaign.startDate.split('T')[0],
        endDate: campaign.endDate.split('T')[0],
        targetAudience: campaign.targetAudience,
        estimatedReach: campaign.estimatedReach,
        voucherIds: campaign.voucherIds || [],
        productIds: campaign.productIds || [],
        bannerImageUrl: campaign.bannerImageUrl || '',
        landingPageUrl: campaign.landingPageUrl || '',
        emailSubject: campaign.emailSubject || '',
        emailTemplate: campaign.emailTemplate || '',
        budget: campaign.budget || 0,
        goalType: campaign.goalType || 'revenue',
        goalValue: campaign.goalValue || 0
      });
    }
  }, [campaign]);

  const fetchVouchers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/vouchers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableVouchers(data);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  useEffect(() => {
    // Update selected vouchers when voucherIds change
    const selected = availableVouchers.filter(v => formData.voucherIds.includes(v.id));
    setSelectedVouchers(selected);
  }, [formData.voucherIds, availableVouchers]);

  const handleAddVoucher = (voucherId: string) => {
    if (!formData.voucherIds.includes(voucherId)) {
      setFormData({
        ...formData,
        voucherIds: [...formData.voucherIds, voucherId]
      });
    }
  };

  const handleRemoveVoucher = (voucherId: string) => {
    setFormData({
      ...formData,
      voucherIds: formData.voucherIds.filter(id => id !== voucherId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.name || formData.name.length < 3) {
        throw new Error('Tên chiến dịch phải có ít nhất 3 ký tự');
      }

      if (!formData.startDate || !formData.endDate) {
        throw new Error('Vui lòng chọn thời gian bắt đầu và kết thúc');
      }

      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      // Prepare data
      const submitData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
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
          <Title>{campaign ? 'Chỉnh Sửa Chiến Dịch' : 'Tạo Chiến Dịch Mới'}</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Section>
            <SectionTitle>Thông Tin Cơ Bản</SectionTitle>
            
            <FormGroup>
              <Label>Tên Chiến Dịch *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Black Friday 2024"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Mô Tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về chiến dịch..."
                rows={3}
              />
            </FormGroup>

            <TwoColumns>
              <FormGroup>
                <Label>Loại Chiến Dịch *</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as CampaignType })}
                >
                  <option value="email">Email Marketing</option>
                  <option value="banner">Banner/Display</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="seasonal">Theo Mùa</option>
                  <option value="product_launch">Ra Mắt Sản Phẩm</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Đối Tượng *</Label>
                <Select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as CampaignTarget })}
                >
                  <option value="all">Tất cả khách hàng</option>
                  <option value="new_customers">Khách hàng mới</option>
                  <option value="vip">Khách VIP</option>
                  <option value="inactive">Khách không hoạt động</option>
                  <option value="segment">Phân khúc cụ thể</option>
                </Select>
              </FormGroup>
            </TwoColumns>
          </Section>

          <Section>
            <SectionTitle>Thời Gian</SectionTitle>
            
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
            <SectionTitle>Vouchers & Mã Giảm Giá</SectionTitle>
            
            <FormGroup>
              <Label>Chọn Vouchers</Label>
              <Select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddVoucher(e.target.value);
                    e.target.value = '';
                  }
                }}
              >
                <option value="">-- Chọn voucher để thêm --</option>
                {availableVouchers
                  .filter(v => !formData.voucherIds.includes(v.id))
                  .map(voucher => (
                    <option key={voucher.id} value={voucher.id}>
                      {voucher.code} - {voucher.type === 'percentage' ? `${voucher.value}%` : `${voucher.value.toLocaleString()}₫`}
                      {voucher.maxDiscount && ` (max ${voucher.maxDiscount.toLocaleString()}₫)`}
                    </option>
                  ))}
              </Select>
            </FormGroup>

            {selectedVouchers.length > 0 && (
              <VouchersList>
                {selectedVouchers.map(voucher => (
                  <VoucherItem key={voucher.id}>
                    <VoucherInfo>
                      <VoucherCode>{voucher.code}</VoucherCode>
                      <VoucherDetails>
                        {voucher.type === 'percentage' && `${voucher.value}%`}
                        {voucher.type === 'fixed' && `${voucher.value.toLocaleString()}₫`}
                        {voucher.type === 'freeship' && 'Miễn phí ship'}
                        {voucher.maxDiscount && ` (tối đa ${voucher.maxDiscount.toLocaleString()}₫)`}
                      </VoucherDetails>
                    </VoucherInfo>
                    <RemoveButton onClick={() => handleRemoveVoucher(voucher.id)}>
                      <FaTrash />
                    </RemoveButton>
                  </VoucherItem>
                ))}
              </VouchersList>
            )}

            <Hint>
              💡 Vouchers được gắn vào chiến dịch sẽ được theo dõi hiệu quả riêng
            </Hint>
          </Section>

          {formData.type === 'email' && (
            <Section>
              <SectionTitle>Email Campaign</SectionTitle>
              
              <FormGroup>
                <Label>Tiêu Đề Email</Label>
                <Input
                  type="text"
                  value={formData.emailSubject}
                  onChange={(e) => setFormData({ ...formData, emailSubject: e.target.value })}
                  placeholder="VD: 🎉 Black Friday - Giảm đến 50%!"
                />
              </FormGroup>

              <FormGroup>
                <Label>Nội Dung Email</Label>
                <Textarea
                  value={formData.emailTemplate}
                  onChange={(e) => setFormData({ ...formData, emailTemplate: e.target.value })}
                  placeholder="Nội dung email..."
                  rows={5}
                />
              </FormGroup>
            </Section>
          )}

          <Section>
            <SectionTitle>Ngân Sách & Mục Tiêu</SectionTitle>
            
            <TwoColumns>
              <FormGroup>
                <Label>Ngân Sách (₫)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                  min="0"
                  step="1000"
                />
              </FormGroup>

              <FormGroup>
                <Label>Loại Mục Tiêu</Label>
                <Select
                  value={formData.goalType}
                  onChange={(e) => setFormData({ ...formData, goalType: e.target.value as any })}
                >
                  <option value="revenue">Doanh thu</option>
                  <option value="orders">Số đơn hàng</option>
                  <option value="signups">Đăng ký mới</option>
                  <option value="engagement">Tương tác</option>
                </Select>
              </FormGroup>
            </TwoColumns>

            <FormGroup>
              <Label>Giá Trị Mục Tiêu</Label>
              <Input
                type="number"
                value={formData.goalValue}
                onChange={(e) => setFormData({ ...formData, goalValue: parseFloat(e.target.value) })}
                min="0"
                step="1000"
              />
            </FormGroup>
          </Section>

          <Actions>
            <CancelButton type="button" onClick={onClose}>
              Hủy
            </CancelButton>
            <SaveButton type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : campaign ? 'Cập Nhật' : 'Tạo Chiến Dịch'}
            </SaveButton>
          </Actions>
        </Form>
      </Modal>
    </Overlay>
  );
};

// Styled Components
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
  max-width: 900px;
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

const TwoColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const VouchersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const VoucherItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const VoucherInfo = styled.div`
  flex: 1;
`;

const VoucherCode = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 14px;
  margin-bottom: 4px;
`;

const VoucherDetails = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const RemoveButton = styled.button`
  padding: 8px;
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: #fee2e2;
  }
`;

const Hint = styled.p`
  margin: 12px 0 0 0;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
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

export default CampaignFormModal;
