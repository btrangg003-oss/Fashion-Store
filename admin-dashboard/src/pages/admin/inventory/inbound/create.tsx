import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProductSearchInput from '@/components/Inventory/ProductSearchInput';
import SerialNumberInput from '@/components/Inventory/SerialNumberInput';
import PhotoVerification, { PhotoItem } from '@/components/Inventory/PhotoVerification';
import { FiDownload, FiPlus, FiX, FiCalendar, FiUser, FiPackage, FiDollarSign, FiPercent, FiLayers, FiHash } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { TrackingType } from '@/models/inventory';

interface InboundItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  costPrice: number;
  totalValue: number;
  trackingType?: TrackingType;
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  serials?: string[];
}

const InboundCreatePage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin' });
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Photo verification
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'new_stock' as 'new_stock' | 'return' | 'adjustment',
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    notes: '',
    items: [] as InboundItem[],
    
    // Calculation fields
    vatRate: 10,
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    
    // Payment
    paymentMethods: ['cash'] as string[],
    paidAmount: 0,
    
    // Status
    status: 'draft' as 'draft' | 'pending' | 'approved' | 'completed'
  });

  // Generate receipt number on mount
  useEffect(() => {
    generateReceiptNumber();
    loadCurrentUser();
  }, []);

  const generateReceiptNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setReceiptNumber(`INB-${dateStr}-${randomNum}`);
  };

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleProductSelect = (product: any) => {
    // Check if product already exists
    const exists = formData.items.find(item => item.sku === product.sku);
    if (exists) {
      alert('Sản phẩm đã có trong danh sách');
      return;
    }

    const newItem: InboundItem = {
      id: Date.now().toString(),
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity: 1,
      costPrice: product.price || 0,
      totalValue: product.price || 0,
      trackingType: product.trackingType || 'none' // Get tracking type from product
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const handleItemChange = (id: string, field: 'quantity' | 'costPrice', value: number) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.totalValue = updated.quantity * updated.costPrice;
        return updated;
      }
      return item;
    });

    setFormData({ ...formData, items: updatedItems });
  };

  const handleRemoveItem = (id: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== id)
    });
  };

  const generateBatchNumber = (sku: string) => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BATCH-${sku}-${date}-${random}`;
  };

  const handleBatchInfoChange = (itemId: string, field: 'batchNumber' | 'manufactureDate' | 'expiryDate', value: string) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        
        // Auto-suggest expiry date (1 year after manufacture)
        if (field === 'manufactureDate' && value && !item.expiryDate) {
          const mfgDate = new Date(value);
          mfgDate.setFullYear(mfgDate.getFullYear() + 1);
          updated.expiryDate = mfgDate.toISOString().split('T')[0];
        }
        
        return updated;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAutoGenerateBatch = (itemId: string, sku: string) => {
    const batchNumber = generateBatchNumber(sku);
    handleBatchInfoChange(itemId, 'batchNumber', batchNumber);
  };

  const handleSerialChange = (itemId: string, serials: string[]) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        return { ...item, serials };
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddNewProduct = () => {
    router.push('/admin/products?action=add&returnTo=/admin/inventory/inbound/create');
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => sum + item.totalValue, 0);
  const vatAmount = (subtotal * formData.vatRate) / 100;
  const discountAmount = formData.discountType === 'percentage'
    ? (subtotal * formData.discountValue) / 100
    : formData.discountValue;
  const finalTotal = subtotal + vatAmount - discountAmount;
  const debtAmount = finalTotal - formData.paidAmount;

  const handlePaymentMethodToggle = (method: string) => {
    const methods = formData.paymentMethods.includes(method)
      ? formData.paymentMethods.filter(m => m !== method)
      : [...formData.paymentMethods, method];
    
    setFormData({ ...formData, paymentMethods: methods });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    if (!formData.supplierName) {
      alert('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    // Validate tracking data
    for (const item of formData.items) {
      // Batch validation
      if (item.trackingType === 'batch') {
        if (!item.batchNumber) {
          alert(`Vui lòng nhập số lô cho sản phẩm: ${item.name}`);
          return;
        }
        
        // Validate dates
        if (item.manufactureDate && item.expiryDate) {
          const mfgDate = new Date(item.manufactureDate);
          const expDate = new Date(item.expiryDate);
          
          if (expDate <= mfgDate) {
            alert(`Hạn sử dụng phải sau ngày sản xuất cho sản phẩm: ${item.name}`);
            return;
          }
        }
        
        // Warn if expiring soon
        if (item.expiryDate) {
          const expDate = new Date(item.expiryDate);
          const daysUntilExpiry = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 30) {
            if (!confirm(`⚠️ Sản phẩm "${item.name}" sẽ hết hạn trong ${daysUntilExpiry} ngày. Bạn có chắc muốn nhập?`)) {
              return;
            }
          }
        }
      }
      
      // Serial validation
      if (item.trackingType === 'serial') {
        if (!item.serials || item.serials.length === 0) {
          alert(`Vui lòng nhập serial numbers cho sản phẩm: ${item.name}`);
          return;
        }
        
        if (item.serials.length !== item.quantity) {
          alert(`Số lượng serial (${item.serials.length}) phải bằng số lượng sản phẩm (${item.quantity}) cho: ${item.name}`);
          return;
        }
      }
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        receiptNumber,
        type: 'inbound',
        subType: formData.type,
        receiptDate,
        movementDate: new Date().toISOString(),
        
        items: formData.items.map(item => ({
          productId: item.productId,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          costPrice: item.costPrice,
          totalValue: item.totalValue,
          // Batch & Serial tracking
          trackingType: item.trackingType,
          batchNumber: item.batchNumber,
          manufactureDate: item.manufactureDate,
          expiryDate: item.expiryDate,
          serials: item.serials
        })),
        
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes,
        reason: `Nhập kho - ${formData.type === 'new_stock' ? 'Nhập mới' : formData.type === 'return' ? 'Hoàn hàng' : 'Điều chỉnh'}`,
        
        // Calculations
        subtotal,
        vatRate: formData.vatRate,
        vatAmount,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        discountAmount,
        finalTotal,
        totalValue: finalTotal,
        totalItems: formData.items.length,
        
        // Payment
        paymentMethod: formData.paymentMethods,
        paidAmount: formData.paidAmount,
        debtAmount,
        
        // Status
        status: formData.status,
        
        // Photos
        photos: photos.map(p => ({
          id: p.id,
          url: p.url,
          type: p.type,
          uploadedAt: p.uploadedAt,
          notes: p.notes
        })),
        
        // User
        createdBy: currentUser?.email || 'admin',
        createdByName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin',
        
        // History
        history: [{
          action: formData.status === 'draft' ? 'Tạo nháp' : 'Tạo phiếu',
          by: currentUser?.email || 'admin',
          byName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'Admin',
          at: new Date().toISOString(),
          note: formData.notes
        }]
      };

      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Tạo phiếu nhập kho thành công!');
        router.push('/admin/inventory/inbound');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>⬇️ Phiếu Nhập Kho</Title>
            <ReceiptInfo>
              <ReceiptNumber>{receiptNumber}</ReceiptNumber>
              <StatusBadge status={formData.status}>
                {formData.status === 'draft' && '📝 Nháp'}
                {formData.status === 'pending' && '⏳ Chờ duyệt'}
                {formData.status === 'approved' && '✅ Đã duyệt'}
                {formData.status === 'completed' && '✔️ Hoàn thành'}
              </StatusBadge>
            </ReceiptInfo>
          </HeaderLeft>
          <HeaderRight>
            <InfoItem>
              <FiCalendar />
              <input 
                type="date" 
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
              />
            </InfoItem>
            <InfoItem>
              <FiUser />
              <span>{currentUser?.firstName || 'Admin'}</span>
            </InfoItem>
          </HeaderRight>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <Card>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <FormGrid>
              <FormGroup>
                <Label>Loại nhập *</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="new_stock">📦 Nhập mới</option>
                  <option value="return">↩️ Hoàn hàng</option>
                  <option value="adjustment">🔧 Điều chỉnh</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Nhà cung cấp *</Label>
                <Input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="Tên nhà cung cấp"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Số hóa đơn</Label>
                <Input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  placeholder="INV-001"
                />
              </FormGroup>

              <FormGroup>
                <Label>Trạng thái phiếu</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="draft">📝 Nháp</option>
                  <option value="pending">⏳ Chờ duyệt</option>
                  <option value="approved">✅ Đã duyệt</option>
                  <option value="completed">✔️ Hoàn thành</option>
                </Select>
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ghi chú về lô hàng..."
                rows={3}
              />
            </FormGroup>
          </Card>

          {/* Product Search */}
          <Card>
            <CardTitle>
              <FiPackage /> Tìm kiếm sản phẩm
            </CardTitle>
            <SearchRow>
              <ProductSearchInput onSelect={handleProductSelect} />
              <AddNewButton type="button" onClick={handleAddNewProduct}>
                <FiPlus /> Thêm sản phẩm mới
              </AddNewButton>
            </SearchRow>
          </Card>

          {/* Items List */}
          {formData.items.length > 0 && (
            <Card>
              <CardTitle>Danh sách sản phẩm ({formData.items.length})</CardTitle>
              
              {formData.items.map((item, index) => (
                <ItemCard key={item.id}>
                  <ItemHeader>
                    <ItemNumber>{index + 1}</ItemNumber>
                    <ItemInfo>
                      <ItemName>{item.name}</ItemName>
                      <ItemSKU>SKU: {item.sku}</ItemSKU>
                    </ItemInfo>
                    <RemoveButton type="button" onClick={() => handleRemoveItem(item.id)}>
                      <FiX />
                    </RemoveButton>
                  </ItemHeader>

                  <ItemBody>
                    <ItemRow>
                      <ItemField>
                        <FieldLabel>Số lượng</FieldLabel>
                        <SmallInput
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        />
                      </ItemField>

                      <ItemField>
                        <FieldLabel>Giá nhập</FieldLabel>
                        <SmallInput
                          type="number"
                          min="0"
                          value={item.costPrice}
                          onChange={(e) => handleItemChange(item.id, 'costPrice', parseInt(e.target.value) || 0)}
                        />
                      </ItemField>

                      <ItemField>
                        <FieldLabel>Thành tiền</FieldLabel>
                        <TotalValue>{item.totalValue.toLocaleString()}₫</TotalValue>
                      </ItemField>
                    </ItemRow>

                    {/* Batch Tracking */}
                    {item.trackingType === 'batch' && (
                      <TrackingSection>
                        <TrackingSectionTitle>
                          <FiLayers /> Thông tin lô hàng
                        </TrackingSectionTitle>
                        <BatchInputGrid>
                          <BatchField>
                            <FieldLabel>Số lô *</FieldLabel>
                            <BatchInputRow>
                              <Input
                                type="text"
                                value={item.batchNumber || ''}
                                onChange={(e) => handleBatchInfoChange(item.id, 'batchNumber', e.target.value)}
                                placeholder="BATCH-001"
                              />
                              <AutoGenButton
                                type="button"
                                onClick={() => handleAutoGenerateBatch(item.id, item.sku)}
                                title="Tự động tạo số lô"
                              >
                                🎲 Auto
                              </AutoGenButton>
                            </BatchInputRow>
                          </BatchField>
                          <BatchField>
                            <FieldLabel>Ngày sản xuất</FieldLabel>
                            <Input
                              type="date"
                              value={item.manufactureDate || ''}
                              onChange={(e) => handleBatchInfoChange(item.id, 'manufactureDate', e.target.value)}
                            />
                            <HelperText>Tự động gợi ý HSD sau 1 năm</HelperText>
                          </BatchField>
                          <BatchField>
                            <FieldLabel>Hạn sử dụng</FieldLabel>
                            <Input
                              type="date"
                              value={item.expiryDate || ''}
                              onChange={(e) => handleBatchInfoChange(item.id, 'expiryDate', e.target.value)}
                            />
                            {item.expiryDate && (() => {
                              const daysUntil = Math.floor((new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                              if (daysUntil < 30) {
                                return <WarningText>⚠️ Sắp hết hạn trong {daysUntil} ngày!</WarningText>;
                              }
                              return <HelperText>✓ Còn {daysUntil} ngày</HelperText>;
                            })()}
                          </BatchField>
                        </BatchInputGrid>
                      </TrackingSection>
                    )}

                    {/* Serial Tracking */}
                    {item.trackingType === 'serial' && (
                      <TrackingSection>
                        <TrackingSectionTitle>
                          <FiHash /> Serial Numbers
                        </TrackingSectionTitle>
                        <SerialNumberInput
                          productSku={item.sku}
                          productName={item.name}
                          requiredQuantity={item.quantity}
                          onSerialChange={(serials) => handleSerialChange(item.id, serials)}
                          mode="inbound"
                        />
                      </TrackingSection>
                    )}
                  </ItemBody>
                </ItemCard>
              ))}
            </Card>
          )}

          {/* Calculation */}
          {formData.items.length > 0 && (
            <Card>
              <CardTitle>
                <FiDollarSign /> Tính toán
              </CardTitle>
              
              <CalcGrid>
                <CalcRow>
                  <CalcLabel>Tạm tính:</CalcLabel>
                  <CalcValue>{subtotal.toLocaleString()}₫</CalcValue>
                </CalcRow>

                <CalcRow>
                  <CalcLabel>
                    <FiPercent /> VAT:
                    <SmallSelect
                      value={formData.vatRate}
                      onChange={(e) => setFormData({ ...formData, vatRate: parseInt(e.target.value) })}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="8">8%</option>
                      <option value="10">10%</option>
                    </SmallSelect>
                  </CalcLabel>
                  <CalcValue>+{vatAmount.toLocaleString()}₫</CalcValue>
                </CalcRow>

                <CalcRow>
                  <CalcLabel>
                    Giảm giá:
                    <SmallSelect
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">₫</option>
                    </SmallSelect>
                    <SmallInput
                      type="number"
                      min="0"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </CalcLabel>
                  <CalcValue>-{discountAmount.toLocaleString()}₫</CalcValue>
                </CalcRow>

                <CalcRow highlight>
                  <CalcLabel><strong>Tổng cộng:</strong></CalcLabel>
                  <CalcValue><strong>{finalTotal.toLocaleString()}₫</strong></CalcValue>
                </CalcRow>
              </CalcGrid>
            </Card>
          )}

          {/* Payment */}
          {formData.items.length > 0 && (
            <Card>
              <CardTitle>Thanh toán</CardTitle>
              
              <FormGroup>
                <Label>Phương thức thanh toán</Label>
                <PaymentMethods>
                  <PaymentMethod
                    active={formData.paymentMethods.includes('cash')}
                    onClick={() => handlePaymentMethodToggle('cash')}
                  >
                    💵 Tiền mặt
                  </PaymentMethod>
                  <PaymentMethod
                    active={formData.paymentMethods.includes('transfer')}
                    onClick={() => handlePaymentMethodToggle('transfer')}
                  >
                    🏦 Chuyển khoản
                  </PaymentMethod>
                  <PaymentMethod
                    active={formData.paymentMethods.includes('debt')}
                    onClick={() => handlePaymentMethodToggle('debt')}
                  >
                    📝 Công nợ
                  </PaymentMethod>
                </PaymentMethods>
              </FormGroup>

              <PaymentGrid>
                <FormGroup>
                  <Label>Đã thanh toán</Label>
                  <Input
                    type="number"
                    min="0"
                    max={finalTotal}
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Còn nợ</Label>
                  <DebtAmount debt={debtAmount > 0}>
                    {debtAmount.toLocaleString()}₫
                  </DebtAmount>
                </FormGroup>
              </PaymentGrid>
            </Card>
          )}

          {/* Photo Verification */}
          {formData.items.length > 0 && (
            <Card>
              <PhotoVerification
                outboundId={receiptNumber}
                onPhotosChange={(updatedPhotos) => {
                  setPhotos(updatedPhotos);
                  console.log('Photos updated:', updatedPhotos);
                }}
                maxPhotos={10}
              />
            </Card>
          )}

          {/* Actions */}
          <Actions>
            <CancelButton type="button" onClick={() => router.back()}>
              Hủy
            </CancelButton>
            <SubmitButton type="submit">
              <FiDownload /> Lưu phiếu nhập kho
            </SubmitButton>
          </Actions>
        </Form>
      </Container>
    </AdminLayout>
  );
};

// Styled Components (same as before)
const Container = styled.div`padding: 24px; max-width: 1400px; margin: 0 auto;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;`;
const HeaderLeft = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const HeaderRight = styled.div`display: flex; gap: 16px; align-items: center;`;
const Title = styled.h1`font-size: 28px; font-weight: 700; color: #111827; margin: 0;`;
const ReceiptInfo = styled.div`display: flex; align-items: center; gap: 12px;`;
const ReceiptNumber = styled.div`font-size: 16px; font-weight: 600; color: #3b82f6; font-family: 'Courier New', monospace;`;
const StatusBadge = styled.div<{ status: string }>`
  padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'draft': return '#f3f4f6';
      case 'pending': return '#fef3c7';
      case 'approved': return '#d1fae5';
      case 'completed': return '#dbeafe';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'draft': return '#6b7280';
      case 'pending': return '#d97706';
      case 'approved': return '#059669';
      case 'completed': return '#2563eb';
      default: return '#6b7280';
    }
  }};
`;
const InfoItem = styled.div`display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f9fafb; border-radius: 8px; font-size: 14px; color: #374151; svg { color: #6b7280; } input[type="date"] { border: none; background: transparent; font-size: 14px; color: #374151; cursor: pointer; &:focus { outline: none; } }`;
const Form = styled.form`display: flex; flex-direction: column; gap: 24px;`;
const Card = styled.div`background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`;
const CardTitle = styled.h3`font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; display: flex; align-items: center; gap: 8px;`;
const FormGrid = styled.div`display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; @media (max-width: 768px) { grid-template-columns: 1fr; }`;
const FormGroup = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const Label = styled.label`font-size: 14px; font-weight: 500; color: #374151;`;
const Input = styled.input`padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; &:focus { outline: none; border-color: #3b82f6; }`;
const Select = styled.select`padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; cursor: pointer; &:focus { outline: none; border-color: #3b82f6; }`;
const Textarea = styled.textarea`padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; &:focus { outline: none; border-color: #3b82f6; }`;
const SearchRow = styled.div`display: flex; gap: 12px; align-items: center; > div:first-child { flex: 1; }`;
const AddNewButton = styled.button`padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; &:hover { background: #059669; }`;
const ItemsTable = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`text-align: left; padding: 12px; background: #f9fafb; font-size: 13px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;`;
const Td = styled.td`padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;`;
const Code = styled.code`padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 13px; font-family: 'Courier New', monospace; color: #3b82f6;`;
const SmallInput = styled.input`width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; &:focus { outline: none; border-color: #3b82f6; }`;
const Price = styled.span`font-weight: 600; color: #111827;`;
const RemoveButton = styled.button`width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #fef2f2; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; &:hover { background: #fee2e2; }`;
const CalcGrid = styled.div`display: flex; flex-direction: column; gap: 12px; max-width: 600px; margin-left: auto;`;
const CalcRow = styled.div<{ highlight?: boolean }>`display: flex; justify-content: space-between; align-items: center; padding: ${props => props.highlight ? '16px' : '12px'}; background: ${props => props.highlight ? '#f0f9ff' : 'transparent'}; border-radius: 8px; font-size: ${props => props.highlight ? '18px' : '15px'};`;
const CalcLabel = styled.div`display: flex; align-items: center; gap: 8px; color: #374151;`;
const CalcValue = styled.div`font-weight: 600; color: #111827;`;
const SmallSelect = styled.select`padding: 4px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px; background: white; cursor: pointer; margin-left: 8px;`;
const PaymentMethods = styled.div`display: flex; gap: 12px; flex-wrap: wrap;`;
const PaymentMethod = styled.button<{ active: boolean }>`padding: 10px 20px; border: 2px solid ${props => props.active ? '#3b82f6' : '#d1d5db'}; background: ${props => props.active ? '#eff6ff' : 'white'}; color: ${props => props.active ? '#3b82f6' : '#6b7280'}; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.2s; &:hover { border-color: #3b82f6; background: #eff6ff; }`;
const PaymentGrid = styled.div`display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 16px;`;
const DebtAmount = styled.div<{ debt: boolean }>`padding: 10px 12px; border: 1px solid ${props => props.debt ? '#fca5a5' : '#d1d5db'}; border-radius: 8px; font-size: 16px; font-weight: 600; color: ${props => props.debt ? '#dc2626' : '#059669'}; background: ${props => props.debt ? '#fef2f2' : '#f0fdf4'};`;
const Actions = styled.div`display: flex; justify-content: flex-end; gap: 12px;`;
const CancelButton = styled.button`padding: 12px 24px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 500; cursor: pointer; &:hover { background: #f9fafb; }`;
const SubmitButton = styled.button`padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; &:hover { background: #2563eb; }`;

export default InboundCreatePage;


// New styled components for item cards
const ItemCard = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
`;

const ItemNumber = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  font-weight: 700;
  font-size: 16px;
`;

const ItemInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ItemName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const ItemSKU = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
`;

const ItemBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ItemField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
`;

const TotalValue = styled.div`
  padding: 10px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
`;

const TrackingSection = styled.div`
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
`;

const TrackingSectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BatchInputGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BatchField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BatchInputRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const AutoGenButton = styled.button`
  padding: 10px 16px;
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    background: #e0f2fe;
    border-color: #7dd3fc;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const HelperText = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
`;

const WarningText = styled.div`
  font-size: 12px;
  color: #dc2626;
  font-weight: 500;
  margin-top: 4px;
`;
