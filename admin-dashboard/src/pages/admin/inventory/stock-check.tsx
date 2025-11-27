import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { 
  FiSearch, FiCamera, FiCheck, FiX, FiSave, FiDownload,
  FiAlertCircle, FiBarcode, FiPlus, FiMinus
} from 'react-icons/fi';

interface StockCheckItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  location: string;
  checked: boolean;
  note?: string;
}

const StockCheckPage = () => {
  const [items, setItems] = useState<StockCheckItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockCheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [checkSession, setCheckSession] = useState({
    id: '',
    startTime: new Date().toISOString(),
    checker: '',
    status: 'in_progress'
  });

  useEffect(() => {
    loadStockForCheck();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, showOnlyDifferences]);

  const loadStockForCheck = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/stock', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const checkItems: StockCheckItem[] = data.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          sku: item.sku,
          barcode: item.barcode,
          systemQuantity: item.quantity,
          actualQuantity: item.quantity,
          difference: 0,
          location: item.location,
          checked: false,
          note: ''
        }));
        setItems(checkItems);
      }
    } catch (error) {
      console.error('Error loading stock:', error);
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

    if (showOnlyDifferences) {
      filtered = filtered.filter(item => item.difference !== 0);
    }

    setFilteredItems(filtered);
  };

  const handleActualQuantityChange = (id: string, value: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const actualQuantity = Math.max(0, value);
        return {
          ...item,
          actualQuantity,
          difference: actualQuantity - item.systemQuantity,
          checked: true
        };
      }
      return item;
    }));
  };

  const handleNoteChange = (id: string, note: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, note } : item
    ));
  };

  const handleScanBarcode = () => {
    alert('Chức năng quét mã vạch sẽ được tích hợp với máy quét hoặc camera');
  };

  const handleSaveCheck = async () => {
    if (!confirm('Bạn có chắc muốn lưu kết quả kiểm kho?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory/stock-check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session: checkSession,
          items: items.filter(item => item.checked)
        })
      });

      if (response.ok) {
        alert('Lưu kết quả kiểm kho thành công!');
        loadStockForCheck();
      } else {
        alert('Có lỗi xảy ra khi lưu');
      }
    } catch (error) {
      console.error('Error saving check:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleExportReport = () => {
    const csvContent = [
      ['SKU', 'Tên sản phẩm', 'Tồn hệ thống', 'Tồn thực tế', 'Chênh lệch', 'Vị trí', 'Ghi chú'],
      ...items.map(item => [
        item.sku,
        item.name,
        item.systemQuantity,
        item.actualQuantity,
        item.difference,
        item.location,
        item.note || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kiem-kho-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const stats = {
    total: items.length,
    checked: items.filter(i => i.checked).length,
    differences: items.filter(i => i.difference !== 0).length,
    positive: items.filter(i => i.difference > 0).length,
    negative: items.filter(i => i.difference < 0).length
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
          <HeaderLeft>
            <Title>✅ Kiểm Kho</Title>
            <Subtitle>So sánh tồn thực tế với tồn hệ thống</Subtitle>
          </HeaderLeft>
          <HeaderRight>
            <ScanButton onClick={handleScanBarcode}>
              <FiBarcode /> Quét mã vạch
            </ScanButton>
            <ExportButton onClick={handleExportReport}>
              <FiDownload /> Xuất báo cáo
            </ExportButton>
            <SaveButton onClick={handleSaveCheck}>
              <FiSave /> Lưu kết quả
            </SaveButton>
          </HeaderRight>
        </Header>

        {/* Statistics */}
        <StatsGrid>
          <StatCard>
            <StatLabel>Tổng sản phẩm</StatLabel>
            <StatValue>{stats.total}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Đã kiểm</StatLabel>
            <StatValue color="#10b981">{stats.checked}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Có chênh lệch</StatLabel>
            <StatValue color="#f59e0b">{stats.differences}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Thừa</StatLabel>
            <StatValue color="#3b82f6">{stats.positive}</StatValue>
          </StatCard>
          <StatCard>
            <StatLabel>Thiếu</StatLabel>
            <StatValue color="#ef4444">{stats.negative}</StatValue>
          </StatCard>
        </StatsGrid>

        {/* Toolbar */}
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

          <FilterCheckbox>
            <input
              type="checkbox"
              checked={showOnlyDifferences}
              onChange={(e) => setShowOnlyDifferences(e.target.checked)}
            />
            <label>Chỉ hiện chênh lệch</label>
          </FilterCheckbox>
        </Toolbar>

        {/* Table */}
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Sản phẩm</Th>
                <Th>SKU</Th>
                <Th>Vị trí</Th>
                <Th>Tồn hệ thống</Th>
                <Th>Tồn thực tế</Th>
                <Th>Chênh lệch</Th>
                <Th>Ghi chú</Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <Td>
                    <ProductName>{item.name}</ProductName>
                  </Td>
                  <Td><Code>{item.sku}</Code></Td>
                  <Td>{item.location}</Td>
                  <Td>
                    <SystemQuantity>{item.systemQuantity}</SystemQuantity>
                  </Td>
                  <Td>
                    <QuantityInput>
                      <QuantityButton
                        onClick={() => handleActualQuantityChange(item.id, item.actualQuantity - 1)}
                      >
                        <FiMinus />
                      </QuantityButton>
                      <QuantityValue
                        type="number"
                        value={item.actualQuantity}
                        onChange={(e) => handleActualQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      />
                      <QuantityButton
                        onClick={() => handleActualQuantityChange(item.id, item.actualQuantity + 1)}
                      >
                        <FiPlus />
                      </QuantityButton>
                    </QuantityInput>
                  </Td>
                  <Td>
                    <Difference value={item.difference}>
                      {item.difference > 0 && '+'}
                      {item.difference}
                    </Difference>
                  </Td>
                  <Td>
                    <NoteInput
                      type="text"
                      placeholder="Ghi chú..."
                      value={item.note}
                      onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    />
                  </Td>
                  <Td>
                    <StatusIcon checked={item.checked}>
                      {item.checked ? <FiCheck /> : <FiAlertCircle />}
                    </StatusIcon>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {filteredItems.length === 0 && (
          <EmptyState>
            <EmptyIcon>📦</EmptyIcon>
            <EmptyText>Không tìm thấy sản phẩm nào</EmptyText>
          </EmptyState>
        )}
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`padding: 24px; max-width: 1600px; margin: 0 auto;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;`;
const HeaderLeft = styled.div``;
const HeaderRight = styled.div`display: flex; gap: 12px;`;
const Title = styled.h1`font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 4px 0;`;
const Subtitle = styled.p`font-size: 14px; color: #6b7280; margin: 0;`;

const ScanButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #8b5cf6;
  color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;
  &:hover { background: #7c3aed; }
`;

const ExportButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #10b981;
  color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;
  &:hover { background: #059669; }
`;

const SaveButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #3b82f6;
  color: white; border: none; border-radius: 8px; font-weight: 500; cursor: pointer;
  &:hover { background: #2563eb; }
`;

const StatsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`font-size: 13px; color: #6b7280; margin-bottom: 8px;`;
const StatValue = styled.div<{ color?: string }>`
  font-size: 28px; font-weight: 700; color: ${props => props.color || '#111827'};
`;

const Toolbar = styled.div`
  background: white; border-radius: 12px; padding: 16px; margin-bottom: 16px;
  display: flex; gap: 16px; align-items: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchBox = styled.div`
  flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 16px;
  background: #f9fafb; border-radius: 8px;
  svg { color: #6b7280; }
`;

const SearchInput = styled.input`
  flex: 1; border: none; background: none; outline: none; font-size: 14px;
  &::placeholder { color: #9ca3af; }
`;

const FilterCheckbox = styled.label`
  display: flex; align-items: center; gap: 8px; font-size: 14px; color: #374151; cursor: pointer;
  input { width: 18px; height: 18px; cursor: pointer; }
`;

const TableContainer = styled.div`
  background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Table = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  text-align: left; padding: 16px; background: #f9fafb; font-weight: 600; color: #374151;
  font-size: 14px; border-bottom: 2px solid #e5e7eb;
`;
const Td = styled.td`padding: 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;`;

const ProductName = styled.div`font-weight: 500; color: #111827;`;
const Code = styled.code`
  padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 13px;
  font-family: 'Courier New', monospace;
`;

const SystemQuantity = styled.div`font-weight: 600; color: #6b7280;`;

const QuantityInput = styled.div`
  display: flex; align-items: center; gap: 8px; width: fit-content;
`;

const QuantityButton = styled.button`
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: #f3f4f6; border: none; border-radius: 6px; cursor: pointer; color: #374151;
  &:hover { background: #e5e7eb; }
`;

const QuantityValue = styled.input`
  width: 80px; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;
  text-align: center; font-weight: 600; font-size: 14px;
  &:focus { outline: none; border-color: #3b82f6; }
`;

const Difference = styled.div<{ value: number }>`
  font-weight: 700; font-size: 16px;
  color: ${props => {
    if (props.value > 0) return '#10b981';
    if (props.value < 0) return '#ef4444';
    return '#6b7280';
  }};
`;

const NoteInput = styled.input`
  width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px;
  &:focus { outline: none; border-color: #3b82f6; }
`;

const StatusIcon = styled.div<{ checked: boolean }>`
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: ${props => props.checked ? '#d1fae5' : '#fef3c7'};
  color: ${props => props.checked ? '#059669' : '#d97706'};
  font-size: 18px;
`;

const EmptyState = styled.div`
  text-align: center; padding: 80px 20px; background: white; border-radius: 12px;
`;

const EmptyIcon = styled.div`font-size: 64px; margin-bottom: 16px;`;
const EmptyText = styled.div`font-size: 16px; color: #6b7280;`;
const LoadingMessage = styled.div`text-align: center; padding: 80px 20px; font-size: 18px; color: #6b7280;`;

export default StockCheckPage;
