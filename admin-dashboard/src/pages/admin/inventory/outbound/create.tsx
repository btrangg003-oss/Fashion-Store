import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import ProductSearchInput from '@/components/Inventory/ProductSearchInput';
import ShippingSection from '@/components/Inventory/ShippingSection';
import BatchSelectionModal from '@/components/Inventory/BatchSelectionModal';
import SerialNumberInput from '@/components/Inventory/SerialNumberInput';
import PhotoVerification, { PhotoItem } from '@/components/Inventory/PhotoVerification';
import PickingRouteDisplay from '@/components/Inventory/PickingRouteDisplay';
import { FiUpload, FiPlus, FiX, FiCalendar, FiUser, FiPackage, FiDollarSign, FiPercent, FiAlertTriangle, FiShoppingCart, FiLayers, FiHash, FiAlertCircle } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { TrackingType, BatchInfo, SerialInfo } from '@/models/inventory';

interface OutboundItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  availableQty: number;
  costPrice: number;
  sellingPrice: number;
  totalValue: number;
  trackingType?: TrackingType;
  batches?: { batchNumber: string; quantity: number }[];
  serials?: string[];
  availableBatches?: BatchInfo[];
  availableSerials?: SerialInfo[];
}

const OutboundPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin' });
  const [receiptNumber, setReceiptNumber] = useState('');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [inventory, setInventory] = useState<any[]>([]);
  
  // Batch & Serial tracking
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedItemForTracking, setSelectedItemForTracking] = useState<OutboundItem | null>(null);
  
  // Photo verification
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  
  const [formData, setFormData] = useState({
    type: 'sale' as 'sale' | 'online_order' | 'return_supplier' | 'damaged',
    
    // Customer info (for sale/online_order)
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    
    // Order info
    orderId: '',
    orderNumber: '',
    
    // Supplier info (for return_supplier)
    supplierId: '',
    supplierName: '',
    
    invoiceNumber: '',
    notes: '',
    items: [] as OutboundItem[],
    
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
    loadInventory();
  }, []);

  const generateReceiptNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setReceiptNumber(`OUT-${dateStr}-${randomNum}`);
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

  const loadInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInventory(data.items || []);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    }
  };

  const handleProductSelect = (product: any) => {
    // Check if product already exists
    const exists = formData.items.find(item => item.sku === product.sku);
    if (exists) {
      alert('Sản phẩm đã có trong danh sách');
      return;
    }

    // Get inventory info
    const inventoryItem = inventory.find(inv => inv.sku === product.sku);
    const availableQty = inventoryItem?.quantity || 0;

    if (!inventoryItem) {
      alert('⚠️ Sản phẩm chưa có trong kho!');
      return;
    }

    if (availableQty <= 0) {
      alert(`⚠️ Sản phẩm đã hết hàng trong kho! (Tồn kho: ${availableQty})`);
      return;
    }

    const newItem: OutboundItem = {
      id: Date.now().toString(),
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity: 1,
      availableQty,
      costPrice: inventoryItem?.costPrice || product.price || 0,
      sellingPrice: product.price || 0,
      totalValue: product.price || 0,
      trackingType: inventoryItem?.trackingType || 'none',
      availableBatches: inventoryItem?.batches || [],
      availableSerials: inventoryItem?.serials || []
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
  };

  const handleItemChange = (id: string, field: 'quantity' | 'sellingPrice', value: number) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Validate quantity
        if (field === 'quantity' && value > item.availableQty) {
          alert(`⚠️ Chỉ còn ${item.availableQty} sản phẩm trong kho!`);
          return item;
        }
        
        updated.totalValue = updated.quantity * updated.sellingPrice;
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

  const handleAddNewProduct = () => {
    router.push('/admin/products?action=add&returnTo=/admin/inventory/outbound');
  };

  // Batch & Serial tracking handlers
  const handleOpenBatchModal = (item: OutboundItem) => {
    setSelectedItemForTracking(item);
    setShowBatchModal(true);
  };

  const handleBatchSelect = (selectedBatches: { batchNumber: string; quantity: number }[]) => {
    if (!selectedItemForTracking) return;

    const updatedItems = formData.items.map(item => {
      if (item.id === selectedItemForTracking.id) {
        return {
          ...item,
          batches: selectedBatches
        };
      }
      return item;
    });

    setFormData({ ...formData, items: updatedItems });
    setShowBatchModal(false);
    setSelectedItemForTracking(null);
  };

  const handleSerialChange = (itemId: string, serials: string[]) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          serials
        };
      }
      return item;
    });

    setFormData({ ...formData, items: updatedItems });
  };

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => sum + item.totalValue, 0);
  const vatAmount = (subtotal * formData.vatRate) / 100;
  const discountAmount = formData.discountType === 'percentage'
    ? (subtotal * formData.discountValue) / 100
    : formData.discountValue;
  const finalTotal = subtotal + vatAmount - discountAmount;
  const debtAmount = finalTotal - formData.paidAmount;
  
  // Cost calculation
  const totalCost = formData.items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const profit = finalTotal - totalCost;
  const profitMargin = finalTotal > 0 ? ((profit / finalTotal) * 100).toFixed(1) : '0';

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

    // Validate based on type
    if ((formData.type === 'sale' || formData.type === 'online_order') && !formData.customerName) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    if (formData.type === 'return_supplier' && !formData.supplierName) {
      alert('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    // Validate tracking data
    for (const item of formData.items) {
      // Check available quantity
      if (item.quantity > item.availableQty) {
        alert(`⚠️ Không đủ hàng! Chỉ còn ${item.availableQty} sản phẩm "${item.name}" trong kho.`);
        return;
      }

      // Batch validation
      if (item.trackingType === 'batch') {
        if (!item.batches || item.batches.length === 0) {
          alert(`Vui lòng chọn lô hàng cho sản phẩm: ${item.name}`);
          return;
        }
        
        const totalBatchQty = item.batches.reduce((sum, b) => sum + b.quantity, 0);
        if (totalBatchQty !== item.quantity) {
          alert(`Tổng số lượng từ các lô (${totalBatchQty}) phải bằng số lượng xuất (${item.quantity}) cho: ${item.name}`);
          return;
        }

        // Warn about expiring batches
        const expiringBatches = item.batches.filter(b => {
          const batch = item.availableBatches?.find(ab => ab.batchNumber === b.batchNumber);
          if (batch?.expiryDate) {
            const daysUntil = Math.floor((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysUntil < 7;
          }
          return false;
        });

        if (expiringBatches.length > 0) {
          const batchList = expiringBatches.map(b => b.batchNumber).join(', ');
          if (!confirm(`⚠️ Cảnh báo: Các lô ${batchList} sắp hết hạn trong 7 ngày. Bạn có chắc muốn xuất?`)) {
            return;
          }
        }
      }
      
      // Serial validation
      if (item.trackingType === 'serial') {
        if (!item.serials || item.serials.length === 0) {
          alert(`Vui lòng chọn serial numbers cho sản phẩm: ${item.name}`);
          return;
        }
        
        if (item.serials.length !== item.quantity) {
          alert(`Số lượng serial (${item.serials.length}) phải bằng số lượng xuất (${item.quantity}) cho: ${item.name}`);
          return;
        }
      }
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        receiptNumber,
        type: 'outbound',
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
          quantityBefore: item.availableQty,
          quantityAfter: item.availableQty - item.quantity,
          // Batch & Serial tracking
          trackingType: item.trackingType,
          batches: item.batches,
          serials: item.serials
        })),
        
        // Customer/Supplier info
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        orderId: formData.orderId,
        orderNumber: formData.orderNumber,
        supplierId: formData.supplierId,
        supplierName: formData.supplierName,
        
        invoiceNumber: formData.invoiceNumber,
        notes: formData.notes,
        reason: `Xuất kho - ${getTypeLabel(formData.type)}`,
        
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
        
        // Cost & Profit
        totalCost,
        profit,
        profitMargin: parseFloat(profitMargin),
        
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
        alert('Tạo phiếu xuất kho thành công!');
        router.push('/admin/inventory/stock');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      sale: 'Bán hàng',
      online_order: 'Đơn hàng online',
      return_supplier: 'Trả hàng NCC',
      damaged: 'Hàng hỏng/hủy'
    };
    return labels[type] || type;
  };

  const getTypeIcon = (type: string) => {
    const icons: any = {
      sale: '🛒',
      online_order: '📦',
      return_supplier: '↩️',
      damaged: '❌'
    };
    return icons[type] || '📤';
  };

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <Title>⬆️ Phiếu Xuất Kho</Title>
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
                <Label>Loại xuất *</Label>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="sale">🛒 Bán hàng</option>
                  <option value="online_order">📦 Đơn hàng online</option>
                  <option value="return_supplier">↩️ Trả hàng NCC</option>
                  <option value="damaged">❌ Hàng hỏng/hủy</option>
                </Select>
              </FormGroup>

              {(formData.type === 'sale' || formData.type === 'online_order') && (
                <>
                  <FormGroup>
                    <Label>Tên khách hàng *</Label>
                    <Input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Số điện thoại</Label>
                    <Input
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      placeholder="0901234567"
                    />
                  </FormGroup>

                  {formData.type === 'online_order' && (
                    <FormGroup>
                      <Label>Địa chỉ giao hàng</Label>
                      <Input
                        type="text"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      />
                    </FormGroup>
                  )}

                  {formData.type === 'online_order' && (
                    <FormGroup>
                      <Label>Mã đơn hàng</Label>
                      <Input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder="ORD-001"
                      />
                    </FormGroup>
                  )}
                </>
              )}

              {formData.type === 'return_supplier' && (
                <>
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
                    <Label>Số hóa đơn trả hàng</Label>
                    <Input
                      type="text"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      placeholder="RET-001"
                    />
                  </FormGroup>
                </>
              )}

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
                placeholder="Ghi chú về phiếu xuất..."
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
              <ProductSearchInput 
                onSelect={handleProductSelect}
                filterFn={(product) => {
                  const inventoryItem = inventory.find(inv => inv.sku === product.sku);
                  return inventoryItem && inventoryItem.quantity > 0;
                }}
                emptyMessage="Không tìm thấy sản phẩm còn hàng"
              />
              <AddNewButton type="button" onClick={handleAddNewProduct}>
                <FiPlus /> Thêm sản phẩm mới
              </AddNewButton>
            </SearchRow>
            {inventory.length > 0 && (
              <StockInfo>
                <FiAlertCircle />
                <span>Chỉ hiển thị sản phẩm còn hàng trong kho. Tổng: {inventory.filter(i => i.quantity > 0).length} sản phẩm</span>
              </StockInfo>
            )}
          </Card>

          {/* Items List */}
          {formData.items.length > 0 && (
            <Card>
              <CardTitle>Danh sách sản phẩm ({formData.items.length})</CardTitle>
              <ItemsTable>
                <thead>
                  <tr>
                    <Th>STT</Th>
                    <Th>SKU</Th>
                    <Th>Tên sản phẩm</Th>
                    <Th style={{ width: '100px' }}>Tồn kho</Th>
                    <Th style={{ width: '120px' }}>Số lượng</Th>
                    <Th style={{ width: '150px' }}>Tracking</Th>
                    <Th style={{ width: '150px' }}>Giá bán</Th>
                    <Th style={{ width: '150px' }}>Thành tiền</Th>
                    <Th style={{ width: '60px' }}></Th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr>
                        <Td>{index + 1}</Td>
                        <Td><Code>{item.sku}</Code></Td>
                        <Td><strong>{item.name}</strong></Td>
                        <Td>
                          <StockBadge 
                            status={
                              item.availableQty === 0 ? 'out' : 
                              item.availableQty <= 10 ? 'low' : 'ok'
                            }
                          >
                            {item.availableQty}
                          </StockBadge>
                        </Td>
                        <Td>
                          <QuantityCell>
                            <SmallInput
                              type="number"
                              min="1"
                              max={item.availableQty}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            />
                            {item.quantity > item.availableQty && (
                              <QuantityWarning>⚠️ Vượt quá tồn kho!</QuantityWarning>
                            )}
                            {item.quantity === item.availableQty && item.availableQty > 0 && (
                              <QuantityInfo>ℹ️ Xuất hết tồn kho</QuantityInfo>
                            )}
                          </QuantityCell>
                        </Td>
                        <Td>
                          {item.trackingType === 'batch' && (
                            <TrackingCell>
                              <TrackingButton onClick={() => handleOpenBatchModal(item)}>
                                <FiLayers /> 
                                {item.batches && item.batches.length > 0 
                                  ? `${item.batches.length} lô` 
                                  : 'Chọn lô'}
                              </TrackingButton>
                              {item.batches && item.batches.length > 0 && (() => {
                                const expiringCount = item.batches.filter(b => {
                                  const batch = item.availableBatches?.find(ab => ab.batchNumber === b.batchNumber);
                                  if (batch?.expiryDate) {
                                    const daysUntil = Math.floor((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                    return daysUntil < 7;
                                  }
                                  return false;
                                }).length;
                                
                                if (expiringCount > 0) {
                                  return <ExpiryWarningBadge>⚠️ {expiringCount} lô sắp hết hạn</ExpiryWarningBadge>;
                                }
                                return null;
                              })()}
                            </TrackingCell>
                          )}
                          {item.trackingType === 'serial' && (
                            <TrackingInfo>
                              <FiHash />
                              {item.serials && item.serials.length > 0 
                                ? `${item.serials.length}/${item.quantity}` 
                                : '0/' + item.quantity}
                            </TrackingInfo>
                          )}
                          {item.trackingType === 'none' && (
                            <TrackingInfo>-</TrackingInfo>
                          )}
                        </Td>
                        <Td>
                          <SmallInput
                            type="number"
                            min="0"
                            value={item.sellingPrice}
                            onChange={(e) => handleItemChange(item.id, 'sellingPrice', parseInt(e.target.value) || 0)}
                          />
                        </Td>
                        <Td><Price>{item.totalValue.toLocaleString()}₫</Price></Td>
                        <Td>
                          <RemoveButton type="button" onClick={() => handleRemoveItem(item.id)}>
                            <FiX />
                          </RemoveButton>
                        </Td>
                      </tr>
                      
                      {/* Serial Number Input Row */}
                      {item.trackingType === 'serial' && (
                        <tr>
                          <Td colSpan={9} style={{ padding: '16px', background: '#f9fafb' }}>
                            <SerialNumberInput
                              productSku={item.sku}
                              productName={item.name}
                              requiredQuantity={item.quantity}
                              availableSerials={item.availableSerials}
                              onSerialChange={(serials) => handleSerialChange(item.id, serials)}
                              mode="outbound"
                            />
                          </Td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </ItemsTable>
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

                <CalcDivider />

                <CalcRow>
                  <CalcLabel>Giá vốn:</CalcLabel>
                  <CalcValue>{totalCost.toLocaleString()}₫</CalcValue>
                </CalcRow>

                <CalcRow profit={profit >= 0}>
                  <CalcLabel>Lợi nhuận:</CalcLabel>
                  <CalcValue>
                    {profit.toLocaleString()}₫ ({profitMargin}%)
                  </CalcValue>
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
                    active={formData.paymentMethods.includes('card')}
                    onClick={() => handlePaymentMethodToggle('card')}
                  >
                    💳 Thẻ
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

          {/* Shipping Integration - Only for online orders */}
          {formData.type === 'online_order' && formData.items.length > 0 && formData.customerAddress && (
            <ShippingSection
              outboundId={receiptNumber}
              customerName={formData.customerName}
              customerPhone={formData.customerPhone}
              customerAddress={formData.customerAddress}
              weight={formData.items.reduce((sum, item) => sum + (item.quantity * 100), 0)} // Estimate 100g per item
              onShippingCreated={(shippingInfo) => {
                console.log('Shipping created:', shippingInfo);
                // You can update formData with shipping info if needed
              }}
            />
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
              <FiUpload /> Lưu phiếu xuất kho
            </SubmitButton>
          </Actions>
        </Form>

        {/* Batch Selection Modal */}
        {showBatchModal && selectedItemForTracking && (
          <BatchSelectionModal
            isOpen={showBatchModal}
            onClose={() => {
              setShowBatchModal(false);
              setSelectedItemForTracking(null);
            }}
            productSku={selectedItemForTracking.sku}
            productName={selectedItemForTracking.name}
            availableBatches={selectedItemForTracking.availableBatches || []}
            requiredQuantity={selectedItemForTracking.quantity}
            onSelect={handleBatchSelect}
          />
        )}
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const ReceiptInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ReceiptNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
  font-family: 'Courier New', monospace;
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
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

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  
  svg {
    color: #6b7280;
  }
  
  input[type="date"] {
    border: none;
    background: transparent;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
    
    &:focus {
      outline: none;
    }
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  > div:first-child {
    flex: 1;
  }
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 10px 14px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  font-size: 13px;
  color: #1e40af;
  
  svg {
    flex-shrink: 0;
    font-size: 16px;
  }
`;

const AddNewButton = styled.button`
  padding: 10px 20px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  
  &:hover {
    background: #059669;
  }
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #374151;
`;

const Code = styled.code`
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  color: #ef4444;
`;

const StockBadge = styled.span<{ status: 'ok' | 'low' | 'out' }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'ok': return '#d1fae5';
      case 'low': return '#fef3c7';
      case 'out': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'ok': return '#059669';
      case 'low': return '#d97706';
      case 'out': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const SmallInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Price = styled.span`
  font-weight: 600;
  color: #111827;
`;

const RemoveButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: #fee2e2;
  }
`;

const CalcGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin-left: auto;
`;

const CalcRow = styled.div<{ highlight?: boolean; profit?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.highlight ? '16px' : '12px'};
  background: ${props => {
    if (props.highlight) return '#f0f9ff';
    if (props.profit !== undefined) {
      return props.profit ? '#f0fdf4' : '#fef2f2';
    }
    return 'transparent';
  }};
  border-radius: 8px;
  font-size: ${props => props.highlight ? '18px' : '15px'};
`;

const CalcLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
`;

const CalcValue = styled.div`
  font-weight: 600;
  color: #111827;
`;

const CalcDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
`;

const SmallSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  margin-left: 8px;
`;

const PaymentMethods = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const PaymentMethod = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  border: 2px solid ${props => props.active ? '#3b82f6' : '#d1d5db'};
  background: ${props => props.active ? '#eff6ff' : 'white'};
  color: ${props => props.active ? '#3b82f6' : '#6b7280'};
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 16px;
`;

const DebtAmount = styled.div<{ debt: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.debt ? '#fca5a5' : '#d1d5db'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.debt ? '#dc2626' : '#059669'};
  background: ${props => props.debt ? '#fef2f2' : '#f0fdf4'};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #dc2626;
  }
`;

const TrackingCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TrackingButton = styled.button`
  padding: 6px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  color: #1e40af;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  
  &:hover {
    background: #dbeafe;
    border-color: #93c5fd;
  }
  
  svg {
    font-size: 14px;
  }
`;

const ExpiryWarningBadge = styled.div`
  padding: 4px 8px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
`;

const QuantityCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const QuantityWarning = styled.div`
  font-size: 11px;
  color: #dc2626;
  font-weight: 500;
`;

const QuantityInfo = styled.div`
  font-size: 11px;
  color: #0369a1;
  font-weight: 500;
`;

const TrackingInfo = styled.div`
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 14px;
  }
`;

export default OutboundPage;
