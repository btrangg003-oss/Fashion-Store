import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { 
  FiSearch, FiFilter, FiDownload, FiEdit, FiTrash2,
  FiPrinter, FiRefreshCw, FiPlus, FiPackage, FiHash, FiSave
} from 'react-icons/fi';
import { InventoryItem } from '@/models/inventory';
import BatchDetailsModal from '@/components/Inventory/BatchDetailsModal';
import SerialDetailsModal from '@/components/Inventory/SerialDetailsModal';

const StockManagement = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Modals
  const [batchModal, setBatchModal] = useState<{
    isOpen: boolean;
    item: InventoryItem | null;
  }>({ isOpen: false, item: null });
  
  const [serialModal, setSerialModal] = useState<{
    isOpen: boolean;
    item: InventoryItem | null;
  }>({ isOpen: false, item: null });

  const [bulkEditModal, setBulkEditModal] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    field: 'category',
    value: ''
  });

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, statusFilter, categoryFilter]);

  const fetchStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/stock', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const handleExport = () => {
    const itemsToExport = selectedItems.length > 0 
      ? filteredItems.filter(item => selectedItems.includes(item.id))
      : filteredItems;

    const csvContent = [
      ['SKU', 'Tên sản phẩm', 'Danh mục', 'Số lượng', 'Vị trí', 'Giá nhập', 'Giá bán', 'Trạng thái', 'Barcode'],
      ...itemsToExport.map(item => [
        item.sku,
        item.name,
        item.category,
        item.quantity,
        item.location,
        item.costPrice,
        item.sellingPrice,
        getStatusBadge(item.status).label,
        item.barcode || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ton-kho-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrintBarcodes = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm để in mã vạch');
      return;
    }

    const itemsToPrint = filteredItems.filter(item => selectedItems.includes(item.id));
    
    // Open print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>In Mã Vạch</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: Arial, sans-serif; }
          .barcode-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 10mm; 
            padding: 10mm;
          }
          .barcode-item {
            border: 1px solid #ddd;
            padding: 8mm;
            text-align: center;
            page-break-inside: avoid;
          }
          .barcode-item h3 { margin: 0 0 4mm 0; font-size: 14pt; }
          .barcode-item .sku { font-size: 12pt; font-weight: bold; margin: 2mm 0; }
          .barcode-item .barcode { 
            font-family: 'Libre Barcode 128', monospace; 
            font-size: 36pt; 
            margin: 4mm 0;
          }
          .barcode-item .price { font-size: 16pt; font-weight: bold; color: #e11d48; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="no-print" onclick="window.print()" style="padding: 10px 20px; margin: 10px; font-size: 16px; cursor: pointer;">
          🖨️ In
        </button>
        <div class="barcode-grid">
          ${itemsToPrint.map(item => `
            <div class="barcode-item">
              <h3>${item.name}</h3>
              <div class="sku">SKU: ${item.sku}</div>
              <div class="barcode">${item.barcode || item.sku}</div>
              <div class="price">${formatPrice(item.sellingPrice)}</div>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      in_stock: { label: 'Còn hàng', color: '#10b981' },
      low_stock: { label: 'Sắp hết', color: '#f59e0b' },
      out_of_stock: { label: 'Hết hàng', color: '#ef4444' },
      overstock: { label: 'Tồn nhiều', color: '#8b5cf6' }
    };
    return config[status as keyof typeof config] || config.in_stock;
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  const handleViewBatches = (item: InventoryItem) => {
    setBatchModal({ isOpen: true, item });
  };

  const handleViewSerials = (item: InventoryItem) => {
    setSerialModal({ isOpen: true, item });
  };

  const handleBulkEdit = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm để chỉnh sửa');
      return;
    }
    setBulkEditModal(true);
  };

  const handleBulkEditSave = async () => {
    if (!bulkEditData.value) {
      alert('Vui lòng nhập giá trị');
      return;
    }

    if (!confirm(`Cập nhật ${bulkEditData.field} cho ${selectedItems.length} sản phẩm?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemIds: selectedItems,
          field: bulkEditData.field,
          value: bulkEditData.value
        })
      });

      if (response.ok) {
        alert('Cập nhật thành công!');
        setBulkEditModal(false);
        setSelectedItems([]);
        fetchStock();
      } else {
        alert('Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const hasExpiringBatches = (item: InventoryItem) => {
    if (!item.batches || item.batches.length === 0) return false;
    const now = Date.now();
    return item.batches.some(batch => {
      if (!batch.expiryDate) return false;
      const daysUntil = Math.floor((new Date(batch.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    });
  };

  const getExpiringBatchesCount = (item: InventoryItem) => {
    if (!item.batches) return 0;
    const now = Date.now();
    return item.batches.filter(batch => {
      if (!batch.expiryDate) return false;
      const daysUntil = Math.floor((new Date(batch.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    }).length;
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingMessage>Đang tải...</LoadingMessage>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <Title>📦 Quản Lý Tồn Kho</Title>
          <HeaderActions>
            <ActionButton onClick={() => window.location.href = '/admin/inventory/inbound'}>
              <FiPlus /> Nhập kho
            </ActionButton>
          </HeaderActions>
        </Header>

        <Toolbar>
          <SearchBox>
            <FiSearch />
            <SearchInput
              type="text"
              placeholder="Tìm theo tên, SKU, barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          <Filters>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="in_stock">Còn hàng</option>
              <option value="low_stock">Sắp hết</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="overstock">Tồn nhiều</option>
            </FilterSelect>

            <FilterSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </FilterSelect>
          </Filters>

          <ToolbarActions>
            <IconButton onClick={handleExport} title="Xuất Excel">
              <FiDownload />
            </IconButton>
            {selectedItems.length > 0 && (
              <IconButton onClick={handlePrintBarcodes} title="In mã vạch">
                <FiPrinter />
              </IconButton>
            )}
            <IconButton onClick={fetchStock} title="Làm mới">
              <FiRefreshCw />
            </IconButton>
          </ToolbarActions>
        </Toolbar>

        {selectedItems.length > 0 && (
          <SelectionInfo>
            Đã chọn {selectedItems.length} sản phẩm
            <BulkActions>
              <BulkButton onClick={handleBulkEdit}>
                <FiEdit /> Chỉnh sửa hàng loạt
              </BulkButton>
              <BulkButton onClick={handlePrintBarcodes}>
                <FiPrinter /> In mã vạch
              </BulkButton>
              <BulkButton onClick={handleExport}>
                <FiDownload /> Xuất Excel
              </BulkButton>
            </BulkActions>
          </SelectionInfo>
        )}

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <Checkbox
                    type="checkbox"
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Danh mục</th>
                <th>Số lượng</th>
                <th>Vị trí</th>
                <th>Giá nhập</th>
                <th>Giá bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const statusConfig = getStatusBadge(item.status);
                return (
                  <tr key={item.id}>
                    <td>
                      <Checkbox
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                    </td>
                    <td>
                      <ProductCell>
                        {item.image && <ProductImage src={item.image} alt={item.name} />}
                        <div>
                          <ProductName>{item.name}</ProductName>
                          {item.trackingType === 'batch' && item.batches && item.batches.length > 0 && (
                            <TrackingInfo>
                              <FiPackage size={12} /> {item.batches.length} lô hàng
                              {hasExpiringBatches(item) && (
                                <ExpiryWarning>
                                  ⚠️ {getExpiringBatchesCount(item)} lô sắp hết hạn
                                </ExpiryWarning>
                              )}
                            </TrackingInfo>
                          )}
                          {item.trackingType === 'serial' && item.serials && item.serials.length > 0 && (
                            <TrackingInfo>
                              <FiHash size={12} /> {item.serials.length} serial
                            </TrackingInfo>
                          )}
                        </div>
                      </ProductCell>
                    </td>
                    <td><Code>{item.sku}</Code></td>
                    <td>{item.category}</td>
                    <td>
                      <QuantityCell status={item.status}>
                        {item.quantity}
                      </QuantityCell>
                    </td>
                    <td>{item.location}</td>
                    <td>{formatPrice(item.costPrice)}</td>
                    <td>{formatPrice(item.sellingPrice)}</td>
                    <td>
                      <StatusBadge color={statusConfig.color}>
                        {statusConfig.label}
                      </StatusBadge>
                    </td>
                    <td>
                      <Actions>
                        {item.trackingType === 'batch' && item.batches && item.batches.length > 0 && (
                          <ViewButton onClick={() => handleViewBatches(item)} title="Xem lô hàng">
                            <FiPackage /> Lô hàng
                          </ViewButton>
                        )}
                        {item.trackingType === 'serial' && item.serials && item.serials.length > 0 && (
                          <ViewButton onClick={() => handleViewSerials(item)} title="Xem serial">
                            <FiHash /> Serial
                          </ViewButton>
                        )}
                        <ActionIcon title="Chỉnh sửa">
                          <FiEdit />
                        </ActionIcon>
                        <ActionIcon title="Xóa" danger>
                          <FiTrash2 />
                        </ActionIcon>
                      </Actions>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>

        {filteredItems.length === 0 && (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyText>Không tìm thấy sản phẩm nào</EmptyText>
          </EmptyState>
        )}

        {/* Batch Details Modal */}
        {batchModal.item && (
          <BatchDetailsModal
            isOpen={batchModal.isOpen}
            onClose={() => setBatchModal({ isOpen: false, item: null })}
            productId={batchModal.item.productId}
            productName={batchModal.item.name}
            productSku={batchModal.item.sku}
            batches={batchModal.item.batches || []}
          />
        )}

        {/* Serial Details Modal */}
        {serialModal.item && (
          <SerialDetailsModal
            isOpen={serialModal.isOpen}
            onClose={() => setSerialModal({ isOpen: false, item: null })}
            productId={serialModal.item.productId}
            productName={serialModal.item.name}
            sku={serialModal.item.sku}
            serials={serialModal.item.serials || []}
          />
        )}

        {/* Bulk Edit Modal */}
        {bulkEditModal && (
          <Modal>
            <ModalOverlay onClick={() => setBulkEditModal(false)} />
            <ModalContent>
              <ModalHeader>
                <ModalTitle>✏️ Chỉnh Sửa Hàng Loạt</ModalTitle>
                <CloseButton onClick={() => setBulkEditModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalBody>
                <FormGroup>
                  <Label>Đã chọn: {selectedItems.length} sản phẩm</Label>
                </FormGroup>
                <FormGroup>
                  <Label>Trường cần cập nhật</Label>
                  <Select
                    value={bulkEditData.field}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, field: e.target.value })}
                  >
                    <option value="category">Danh mục</option>
                    <option value="location">Vị trí kho</option>
                    <option value="status">Trạng thái</option>
                    <option value="costPrice">Giá nhập</option>
                    <option value="sellingPrice">Giá bán</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <Label>Giá trị mới</Label>
                  {bulkEditData.field === 'status' ? (
                    <Select
                      value={bulkEditData.value}
                      onChange={(e) => setBulkEditData({ ...bulkEditData, value: e.target.value })}
                    >
                      <option value="">-- Chọn trạng thái --</option>
                      <option value="in_stock">Còn hàng</option>
                      <option value="low_stock">Sắp hết</option>
                      <option value="out_of_stock">Hết hàng</option>
                      <option value="overstock">Tồn nhiều</option>
                    </Select>
                  ) : bulkEditData.field === 'costPrice' || bulkEditData.field === 'sellingPrice' ? (
                    <Input
                      type="number"
                      placeholder="Nhập giá..."
                      value={bulkEditData.value}
                      onChange={(e) => setBulkEditData({ ...bulkEditData, value: e.target.value })}
                    />
                  ) : (
                    <Input
                      type="text"
                      placeholder="Nhập giá trị..."
                      value={bulkEditData.value}
                      onChange={(e) => setBulkEditData({ ...bulkEditData, value: e.target.value })}
                    />
                  )}
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <CancelButton onClick={() => setBulkEditModal(false)}>
                  Hủy
                </CancelButton>
                <SaveButton onClick={handleBulkEditSave}>
                  <FiSave /> Lưu thay đổi
                </SaveButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </AdminLayout>
  );
};

const Container = styled.div`
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const Toolbar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f9fafb;
  border-radius: 8px;
  
  svg {
    color: #6b7280;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 14px;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterSelect = styled.select`
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ToolbarActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const SelectionInfo = styled.div`
  background: #eff6ff;
  color: #1e40af;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const BulkActions = styled.div`
  display: flex;
  gap: 8px;
`;

const BulkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  color: #1e40af;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dbeafe;
    border-color: #3b82f6;
  }
  
  svg {
    font-size: 14px;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 16px;
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
    border-bottom: 2px solid #e5e7eb;
  }
  
  td {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }
  
  tr:hover {
    background: #f9fafb;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ProductCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const Code = styled.code`
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
`;

const QuantityCell = styled.div<{ status: string }>`
  font-weight: 600;
  color: ${props => {
    if (props.status === 'out_of_stock') return '#ef4444';
    if (props.status === 'low_stock') return '#f59e0b';
    return '#111827';
  }};
`;

const StatusBadge = styled.span<{ color: string }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.color}15;
  color: ${props => props.color};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionIcon = styled.button<{ danger?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: ${props => props.danger ? '#ef4444' : '#6b7280'};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.danger ? '#fef2f2' : '#f3f4f6'};
  }
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dbeafe;
  }
  
  svg {
    font-size: 14px;
  }
`;

const TrackingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  
  svg {
    color: #9ca3af;
  }
`;

const ExpiryWarning = styled.span`
  padding: 2px 6px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

const EmptyText = styled.div`
  font-size: 16px;
  color: #6b7280;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 80px 20px;
  font-size: 18px;
  color: #6b7280;
`;

// Modal Components
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 28px;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  max-height: calc(90vh - 180px);
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
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

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #2563eb;
  }
`;

export default StockManagement;
