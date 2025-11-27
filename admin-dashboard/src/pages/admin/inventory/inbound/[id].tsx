import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import { FiArrowLeft, FiEdit, FiCheck, FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { StockMovement } from '@/models/inventory';

const InboundDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [movement, setMovement] = useState<StockMovement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMovement();
    }
  }, [id]);

  const loadMovement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/movements?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setMovement(data);
      } else {
        alert('Không tìm thấy phiếu');
        router.back();
      }
    } catch (error) {
      console.error('Error loading movement:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Xác nhận duyệt phiếu nhập kho này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/movements/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Duyệt phiếu thành công!');
        loadMovement();
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Export to PDF or Excel
    alert('Tính năng xuất file đang được phát triển');
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingState>Đang tải...</LoadingState>
        </Container>
      </AdminLayout>
    );
  }

  if (!movement) {
    return (
      <AdminLayout>
        <Container>
          <EmptyState>Không tìm thấy phiếu</EmptyState>
        </Container>
      </AdminLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: '📝 Nháp', color: '#6b7280', bg: '#f3f4f6' },
      pending: { label: '⏳ Chờ duyệt', color: '#d97706', bg: '#fef3c7' },
      approved: { label: '✅ Đã duyệt', color: '#059669', bg: '#d1fae5' },
      completed: { label: '✔️ Hoàn thành', color: '#2563eb', bg: '#dbeafe' }
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  const statusBadge = getStatusBadge(movement.status);

  return (
    <AdminLayout>
      <Container>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => router.back()}>
              <FiArrowLeft /> Quay lại
            </BackButton>
            <TitleSection>
              <Title>⬇️ Chi Tiết Phiếu Nhập Kho</Title>
              <ReceiptNumber>{movement.receiptNumber}</ReceiptNumber>
            </TitleSection>
          </HeaderLeft>
          <HeaderRight>
            <StatusBadge color={statusBadge.color} bg={statusBadge.bg}>
              {statusBadge.label}
            </StatusBadge>
            {movement.status === 'draft' && (
              <EditButton onClick={() => router.push(`/admin/inventory/inbound/${id}?mode=edit`)}>
                <FiEdit /> Chỉnh sửa
              </EditButton>
            )}
            {(movement.status === 'pending' || movement.status === 'draft') && (
              <ApproveButton onClick={handleApprove}>
                <FiCheck /> Duyệt phiếu
              </ApproveButton>
            )}
            <IconButton onClick={handlePrint} title="In phiếu">
              <FiPrinter />
            </IconButton>
            <IconButton onClick={handleExport} title="Xuất file">
              <FiDownload />
            </IconButton>
          </HeaderRight>
        </Header>

        <Grid>
          {/* Basic Info */}
          <Card>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Mã phiếu:</InfoLabel>
                <InfoValue><Code>{movement.receiptNumber}</Code></InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Ngày nhập:</InfoLabel>
                <InfoValue>{new Date(movement.receiptDate).toLocaleDateString('vi-VN')}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Loại nhập:</InfoLabel>
                <InfoValue>
                  {movement.subType === 'new_stock' && '📦 Nhập mới'}
                  {movement.subType === 'return' && '↩️ Hoàn hàng'}
                  {movement.subType === 'adjustment' && '🔧 Điều chỉnh'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Nhà cung cấp:</InfoLabel>
                <InfoValue>{movement.supplierName || '-'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Số hóa đơn:</InfoLabel>
                <InfoValue>{movement.invoiceNumber || '-'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Người tạo:</InfoLabel>
                <InfoValue>{movement.createdByName || movement.createdBy}</InfoValue>
              </InfoItem>
            </InfoGrid>
            {movement.notes && (
              <NotesSection>
                <InfoLabel>Ghi chú:</InfoLabel>
                <Notes>{movement.notes}</Notes>
              </NotesSection>
            )}
          </Card>

          {/* Items List */}
          <Card fullWidth>
            <CardTitle>Danh sách sản phẩm ({movement.items?.length || 0})</CardTitle>
            
            {movement.items?.map((item, index) => (
              <ItemCard key={item.productId || index}>
                <ItemHeader>
                  <ItemNumber>{index + 1}</ItemNumber>
                  <ItemInfo>
                    <ItemName>{item.name}</ItemName>
                    <ItemSKU>SKU: {item.sku}</ItemSKU>
                  </ItemInfo>
                  <ItemStats>
                    <StatItem>
                      <StatLabel>Số lượng:</StatLabel>
                      <StatValue>{item.quantity}</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Giá nhập:</StatLabel>
                      <StatValue>{item.costPrice?.toLocaleString()}₫</StatValue>
                    </StatItem>
                    <StatItem>
                      <StatLabel>Thành tiền:</StatLabel>
                      <StatValue highlight>{item.totalValue?.toLocaleString()}₫</StatValue>
                    </StatItem>
                  </ItemStats>
                </ItemHeader>

                {/* Batch Info */}
                {item.trackingType === 'batch' && (item.batchNumber || item.batches) && (
                  <TrackingSection>
                    <TrackingTitle>🏷️ Thông tin lô hàng</TrackingTitle>
                    {item.batchNumber ? (
                      <BatchInfo>
                        <BatchField>
                          <FieldLabel>Số lô:</FieldLabel>
                          <FieldValue><Code>{item.batchNumber}</Code></FieldValue>
                        </BatchField>
                        {item.manufactureDate && (
                          <BatchField>
                            <FieldLabel>Ngày sản xuất:</FieldLabel>
                            <FieldValue>{new Date(item.manufactureDate).toLocaleDateString('vi-VN')}</FieldValue>
                          </BatchField>
                        )}
                        {item.expiryDate && (
                          <BatchField>
                            <FieldLabel>Hạn sử dụng:</FieldLabel>
                            <FieldValue>{new Date(item.expiryDate).toLocaleDateString('vi-VN')}</FieldValue>
                          </BatchField>
                        )}
                      </BatchInfo>
                    ) : item.batches && item.batches.length > 0 && (
                      <BatchList>
                        {item.batches.map((batch: any, idx: number) => (
                          <BatchChip key={idx}>
                            <Code>{batch.batchNumber}</Code>
                            <span>× {batch.quantity}</span>
                          </BatchChip>
                        ))}
                      </BatchList>
                    )}
                  </TrackingSection>
                )}

                {/* Serial Info */}
                {item.trackingType === 'serial' && item.serials && item.serials.length > 0 && (
                  <TrackingSection>
                    <TrackingTitle>#️⃣ Serial Numbers ({item.serials.length})</TrackingTitle>
                    <SerialGrid>
                      {item.serials.map((serial: any, idx: number) => (
                        <SerialChip key={idx}>
                          <Code>{typeof serial === 'string' ? serial : serial.serialNumber}</Code>
                        </SerialChip>
                      ))}
                    </SerialGrid>
                  </TrackingSection>
                )}
              </ItemCard>
            ))}
          </Card>

          {/* Photos */}
          {movement.photos && movement.photos.length > 0 && (
            <Card fullWidth>
              <CardTitle>📷 Ảnh xác minh ({movement.photos.length})</CardTitle>
              <PhotoGrid>
                {movement.photos.map((photo: any, index: number) => (
                  <PhotoCard key={photo.id || index}>
                    <PhotoImage src={photo.url} alt={`Photo ${index + 1}`} />
                    <PhotoInfo>
                      <PhotoType>
                        {photo.type === 'before' && '📦 Trước đóng gói'}
                        {photo.type === 'after' && '✅ Sau đóng gói'}
                        {photo.type === 'label' && '🏷️ Nhãn'}
                        {photo.type === 'quality' && '🔍 Kiểm tra'}
                      </PhotoType>
                      <PhotoTime>{new Date(photo.uploadedAt).toLocaleString('vi-VN')}</PhotoTime>
                    </PhotoInfo>
                  </PhotoCard>
                ))}
              </PhotoGrid>
            </Card>
          )}

          {/* Calculation */}
          <Card>
            <CardTitle>Tính toán</CardTitle>
            <CalcGrid>
              <CalcRow>
                <CalcLabel>Tạm tính:</CalcLabel>
                <CalcValue>{(movement.subtotal || 0).toLocaleString()}₫</CalcValue>
              </CalcRow>
              {movement.vatAmount && movement.vatAmount > 0 && (
                <CalcRow>
                  <CalcLabel>VAT ({movement.vatRate}%):</CalcLabel>
                  <CalcValue>+{movement.vatAmount.toLocaleString()}₫</CalcValue>
                </CalcRow>
              )}
              {movement.discountAmount && movement.discountAmount > 0 && (
                <CalcRow>
                  <CalcLabel>Giảm giá:</CalcLabel>
                  <CalcValue>-{movement.discountAmount.toLocaleString()}₫</CalcValue>
                </CalcRow>
              )}
              <CalcRow highlight>
                <CalcLabel><strong>Tổng cộng:</strong></CalcLabel>
                <CalcValue><strong>{(movement.finalTotal || 0).toLocaleString()}₫</strong></CalcValue>
              </CalcRow>
            </CalcGrid>
          </Card>

          {/* Payment */}
          <Card>
            <CardTitle>Thanh toán</CardTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Phương thức:</InfoLabel>
                <InfoValue>
                  {Array.isArray(movement.paymentMethod) 
                    ? movement.paymentMethod.map(m => {
                        if (m === 'cash') return '💵 Tiền mặt';
                        if (m === 'transfer') return '🏦 Chuyển khoản';
                        if (m === 'debt') return '📝 Công nợ';
                        return m;
                      }).join(', ')
                    : movement.paymentMethod || '-'
                  }
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Đã thanh toán:</InfoLabel>
                <InfoValue>{(movement.paidAmount || 0).toLocaleString()}₫</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Còn nợ:</InfoLabel>
                <DebtValue debt={(movement.debtAmount || 0) > 0}>
                  {(movement.debtAmount || 0).toLocaleString()}₫
                </DebtValue>
              </InfoItem>
            </InfoGrid>
          </Card>

          {/* History */}
          {movement.history && movement.history.length > 0 && (
            <Card fullWidth>
              <CardTitle>Lịch sử thay đổi</CardTitle>
              <Timeline>
                {movement.history.map((event, index) => (
                  <TimelineItem key={index}>
                    <TimelineDot />
                    <TimelineContent>
                      <TimelineAction>{event.action}</TimelineAction>
                      <TimelineInfo>
                        <span>{event.byName || event.by}</span>
                        <span>•</span>
                        <span>{new Date(event.at).toLocaleString('vi-VN')}</span>
                      </TimelineInfo>
                      {event.note && <TimelineNote>{event.note}</TimelineNote>}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>
          )}
        </Grid>
      </Container>
    </AdminLayout>
  );
};

// Styled Components
const Container = styled.div`padding: 24px; max-width: 1400px; margin: 0 auto;`;
const Header = styled.div`display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;`;
const HeaderLeft = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const HeaderRight = styled.div`display: flex; gap: 12px; align-items: center;`;
const BackButton = styled.button`
  padding: 8px 16px; background: white; color: #374151; border: 1px solid #d1d5db; border-radius: 8px;
  font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
  &:hover { background: #f9fafb; }
`;
const TitleSection = styled.div``;
const Title = styled.h1`font-size: 28px; font-weight: 700; color: #111827; margin: 0 0 4px 0;`;
const ReceiptNumber = styled.div`
  font-size: 16px; font-weight: 600; color: #3b82f6; font-family: 'Courier New', monospace;
`;
const StatusBadge = styled.div<{ color: string; bg: string }>`
  padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600;
  background: ${props => props.bg}; color: ${props => props.color};
`;
const EditButton = styled.button`
  padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 8px;
  font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
  &:hover { background: #d97706; }
`;
const ApproveButton = styled.button`
  padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px;
  font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px;
  &:hover { background: #059669; }
`;
const IconButton = styled.button`
  width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
  background: white; color: #6b7280; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer;
  &:hover { background: #f9fafb; }
`;

const Grid = styled.div`display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; @media (max-width: 1024px) { grid-template-columns: 1fr; }`;
const Card = styled.div<{ fullWidth?: boolean }>`
  background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  ${props => props.fullWidth && 'grid-column: 1 / -1;'}
`;
const CardTitle = styled.h3`
  font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 20px 0;
  padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;
`;

const InfoGrid = styled.div`display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;`;
const InfoItem = styled.div``;
const InfoLabel = styled.div`font-size: 13px; color: #6b7280; margin-bottom: 4px;`;
const InfoValue = styled.div`font-size: 15px; color: #111827; font-weight: 500;`;
const Code = styled.code`
  padding: 4px 8px; background: #f3f4f6; border-radius: 4px; font-size: 13px;
  font-family: 'Courier New', monospace; color: #3b82f6;
`;
const NotesSection = styled.div`margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;`;
const Notes = styled.p`font-size: 14px; color: #374151; margin: 8px 0 0 0; line-height: 1.6;`;

const Table = styled.table`width: 100%; border-collapse: collapse;`;
const Th = styled.th`
  text-align: left; padding: 12px; background: #f9fafb; font-size: 13px; font-weight: 600;
  color: #6b7280; border-bottom: 2px solid #e5e7eb;
`;
const Td = styled.td`padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #374151;`;
const Price = styled.span`font-weight: 600; color: #111827;`;

const CalcGrid = styled.div`display: flex; flex-direction: column; gap: 12px;`;
const CalcRow = styled.div<{ highlight?: boolean }>`
  display: flex; justify-content: space-between; align-items: center;
  padding: ${props => props.highlight ? '16px' : '12px'};
  background: ${props => props.highlight ? '#f0f9ff' : 'transparent'};
  border-radius: 8px; font-size: ${props => props.highlight ? '18px' : '15px'};
`;
const CalcLabel = styled.div`color: #374151;`;
const CalcValue = styled.div`font-weight: 600; color: #111827;`;
const DebtValue = styled.div<{ debt: boolean }>`
  font-weight: 600; color: ${props => props.debt ? '#dc2626' : '#059669'};
`;

const Timeline = styled.div`display: flex; flex-direction: column; gap: 16px;`;
const TimelineItem = styled.div`display: flex; gap: 16px;`;
const TimelineDot = styled.div`
  width: 12px; height: 12px; border-radius: 50%; background: #3b82f6; margin-top: 4px; flex-shrink: 0;
`;
const TimelineContent = styled.div`flex: 1;`;
const TimelineAction = styled.div`font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 4px;`;
const TimelineInfo = styled.div`
  font-size: 13px; color: #6b7280; display: flex; gap: 8px; margin-bottom: 4px;
`;
const TimelineNote = styled.div`font-size: 14px; color: #374151; font-style: italic;`;

const LoadingState = styled.div`padding: 60px; text-align: center; color: #6b7280; font-size: 16px;`;
const EmptyState = styled.div`padding: 60px; text-align: center; color: #6b7280; font-size: 16px;`;

export default InboundDetailPage;


// New styled components for batch/serial/photos
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
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
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
  flex-shrink: 0;
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

const ItemStats = styled.div`
  display: flex;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const StatValue = styled.div<{ highlight?: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.highlight ? '#1e40af' : '#111827'};
`;

const TrackingSection = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
`;

const TrackingTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
`;

const BatchInfo = styled.div`
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
  gap: 4px;
`;

const FieldLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const FieldValue = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #111827;
`;

const BatchList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const BatchChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  font-size: 13px;
  
  span {
    color: #92400e;
    font-weight: 600;
  }
`;

const SerialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
`;

const SerialChip = styled.div`
  padding: 8px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  text-align: center;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const PhotoCard = styled.div`
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: white;
  
  &:hover {
    border-color: #3b82f6;
  }
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const PhotoInfo = styled.div`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PhotoType = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
`;

const PhotoTime = styled.div`
  font-size: 11px;
  color: #6b7280;
`;
