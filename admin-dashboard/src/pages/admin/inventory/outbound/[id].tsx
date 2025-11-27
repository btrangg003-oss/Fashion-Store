import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AdminLayout from '@/components/Admin/AdminLayout';
import PickingRouteDisplay from '@/components/Inventory/PickingRouteDisplay';
import { FiArrowLeft, FiPackage, FiUser, FiMapPin, FiDollarSign, FiClock, FiCheck } from 'react-icons/fi';

interface PickingTask {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  location: {
    warehouseZone: string;
    aisle: string;
    shelf: string;
    bin: string;
    level: number;
  };
  pickingOrder: number;
  picked: boolean;
  pickedAt?: string;
  pickedBy?: string;
  image?: string;
}

const OutboundDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [outbound, setOutbound] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pickingTasks, setPickingTasks] = useState<PickingTask[]>([]);
  const [showPicking, setShowPicking] = useState(false);

  useEffect(() => {
    if (id) {
      loadOutbound();
    }
  }, [id]);

  const loadOutbound = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inventory/movements?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOutbound(data);
        
        // Generate picking tasks if status is approved
        if (data.status === 'approved' || data.status === 'completed') {
          generatePickingTasks(data.items);
        }
      }
    } catch (error) {
      console.error('Error loading outbound:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePickingTasks = (items: any[]) => {
    // Generate picking tasks with optimized route
    const tasks: PickingTask[] = items.map((item, index) => ({
      id: `task_${index}`,
      productId: item.productId,
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      location: {
        warehouseZone: 'A', // Mock data - should come from inventory
        aisle: String(Math.floor(index / 3) + 1),
        shelf: String((index % 3) + 1),
        bin: String.fromCharCode(65 + (index % 3)),
        level: (index % 3) + 1
      },
      pickingOrder: index + 1,
      picked: false,
      image: item.image
    }));

    // Sort by zone, aisle, shelf for optimal route
    tasks.sort((a, b) => {
      if (a.location.warehouseZone !== b.location.warehouseZone) {
        return a.location.warehouseZone.localeCompare(b.location.warehouseZone);
      }
      if (a.location.aisle !== b.location.aisle) {
        return parseInt(a.location.aisle) - parseInt(b.location.aisle);
      }
      return parseInt(a.location.shelf) - parseInt(b.location.shelf);
    });

    // Update picking order after sort
    tasks.forEach((task, index) => {
      task.pickingOrder = index + 1;
    });

    setPickingTasks(tasks);
  };

  const handleTaskComplete = (taskId: string) => {
    setPickingTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, picked: true, pickedAt: new Date().toISOString() }
        : task
    ));
  };

  const handleAllComplete = () => {
    alert('✅ Đã lấy hàng xong! Chuyển sang bước đóng gói.');
    // Update outbound status to 'completed'
    // router.push('/admin/inventory/outbound');
  };

  const handleBack = () => {
    router.push('/admin/inventory/outbound');
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container>
          <LoadingText>Đang tải...</LoadingText>
        </Container>
      </AdminLayout>
    );
  }

  if (!outbound) {
    return (
      <AdminLayout>
        <Container>
          <ErrorText>Không tìm thấy phiếu xuất kho</ErrorText>
          <BackButton onClick={handleBack}>
            <FiArrowLeft /> Quay lại
          </BackButton>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container>
        <Header>
          <BackButton onClick={handleBack}>
            <FiArrowLeft /> Quay lại
          </BackButton>
          <HeaderTitle>
            <Title>Chi Tiết Phiếu Xuất Kho</Title>
            <ReceiptNumber>{outbound.receiptNumber}</ReceiptNumber>
          </HeaderTitle>
          <StatusBadge status={outbound.status}>
            {getStatusLabel(outbound.status)}
          </StatusBadge>
        </Header>

        {/* Show Picking Route if approved */}
        {(outbound.status === 'approved' || outbound.status === 'completed') && pickingTasks.length > 0 && (
          <PickingSection>
            <PickingHeader>
              <PickingTitle>
                <FiMapPin /> Lộ Trình Lấy Hàng
              </PickingTitle>
              {!showPicking && (
                <StartPickingButton onClick={() => setShowPicking(true)}>
                  Bắt đầu lấy hàng
                </StartPickingButton>
              )}
            </PickingHeader>

            {showPicking && (
              <PickingRouteDisplay
                tasks={pickingTasks}
                onTaskComplete={handleTaskComplete}
                onAllComplete={handleAllComplete}
              />
            )}
          </PickingSection>
        )}

        {/* Outbound Details */}
        <ContentGrid>
          <LeftColumn>
            {/* Customer Info */}
            {outbound.customerName && (
              <Card>
                <CardTitle>
                  <FiUser /> Thông Tin Khách Hàng
                </CardTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Họ tên:</InfoLabel>
                    <InfoValue>{outbound.customerName}</InfoValue>
                  </InfoItem>
                  {outbound.customerPhone && (
                    <InfoItem>
                      <InfoLabel>Số điện thoại:</InfoLabel>
                      <InfoValue>{outbound.customerPhone}</InfoValue>
                    </InfoItem>
                  )}
                  {outbound.customerAddress && (
                    <InfoItem>
                      <InfoLabel>Địa chỉ:</InfoLabel>
                      <InfoValue>{outbound.customerAddress}</InfoValue>
                    </InfoItem>
                  )}
                </InfoGrid>
              </Card>
            )}

            {/* Products */}
            <Card>
              <CardTitle>
                <FiPackage /> Sản Phẩm ({outbound.items?.length || 0})
              </CardTitle>
              <ProductsList>
                {outbound.items?.map((item: any, index: number) => (
                  <ProductItem key={index}>
                    <ProductInfo>
                      <ProductName>{item.name}</ProductName>
                      <ProductSKU>SKU: {item.sku}</ProductSKU>
                    </ProductInfo>
                    <ProductQuantity>x{item.quantity}</ProductQuantity>
                    <ProductPrice>{item.totalValue?.toLocaleString()}₫</ProductPrice>
                  </ProductItem>
                ))}
              </ProductsList>
            </Card>

            {/* Summary */}
            <Card>
              <CardTitle>
                <FiDollarSign /> Tổng Quan
              </CardTitle>
              <SummaryGrid>
                <SummaryRow>
                  <SummaryLabel>Tạm tính:</SummaryLabel>
                  <SummaryValue>{outbound.subtotal?.toLocaleString()}₫</SummaryValue>
                </SummaryRow>
                {outbound.vatAmount > 0 && (
                  <SummaryRow>
                    <SummaryLabel>VAT ({outbound.vatRate}%):</SummaryLabel>
                    <SummaryValue>{outbound.vatAmount?.toLocaleString()}₫</SummaryValue>
                  </SummaryRow>
                )}
                {outbound.discountAmount > 0 && (
                  <SummaryRow>
                    <SummaryLabel>Giảm giá:</SummaryLabel>
                    <SummaryValue discount>-{outbound.discountAmount?.toLocaleString()}₫</SummaryValue>
                  </SummaryRow>
                )}
                <SummaryDivider />
                <SummaryRow highlight>
                  <SummaryLabel><strong>Tổng cộng:</strong></SummaryLabel>
                  <SummaryValue><strong>{outbound.finalTotal?.toLocaleString()}₫</strong></SummaryValue>
                </SummaryRow>
              </SummaryGrid>
            </Card>
          </LeftColumn>

          <RightColumn>
            {/* Info */}
            <Card>
              <CardTitle>
                <FiClock /> Thông Tin
              </CardTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Ngày tạo:</InfoLabel>
                  <InfoValue>{new Date(outbound.createdAt).toLocaleString('vi-VN')}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Người tạo:</InfoLabel>
                  <InfoValue>{outbound.createdByName}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Trạng thái:</InfoLabel>
                  <InfoValue>
                    <StatusBadge status={outbound.status}>
                      {getStatusLabel(outbound.status)}
                    </StatusBadge>
                  </InfoValue>
                </InfoItem>
              </InfoGrid>

              {outbound.notes && (
                <NotesBox>
                  <NotesLabel>Ghi chú:</NotesLabel>
                  <NotesText>{outbound.notes}</NotesText>
                </NotesBox>
              )}
            </Card>
          </RightColumn>
        </ContentGrid>
      </Container>
    </AdminLayout>
  );
};

// Helper functions
const getStatusLabel = (status: string) => {
  const labels: any = {
    draft: '📝 Nháp',
    pending: '⏳ Chờ duyệt',
    approved: '✅ Đã duyệt',
    completed: '✔️ Hoàn thành',
    cancelled: '❌ Đã hủy'
  };
  return labels[status] || status;
};

// Styled Components
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  padding: 10px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #f9fafb;
  }
`;

const HeaderTitle = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const ReceiptNumber = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
  font-family: 'Courier New', monospace;
`;

const StatusBadge = styled.div<{ status: string }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  background: ${props => {
    switch (props.status) {
      case 'draft': return '#f3f4f6';
      case 'pending': return '#fef3c7';
      case 'approved': return '#d1fae5';
      case 'completed': return '#dbeafe';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'draft': return '#6b7280';
      case 'pending': return '#d97706';
      case 'approved': return '#059669';
      case 'completed': return '#2563eb';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const PickingSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PickingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PickingTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
`;

const StartPickingButton = styled.button`
  padding: 12px 24px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 15px;
  
  &:hover {
    background: #059669;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const RightColumn = styled.div`
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

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const InfoValue = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: #111827;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ProductName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
`;

const ProductSKU = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
`;

const ProductQuantity = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
`;

const ProductPrice = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  text-align: right;
  min-width: 100px;
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.highlight ? '12px' : '0'};
  background: ${props => props.highlight ? '#f0f9ff' : 'transparent'};
  border-radius: 8px;
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const SummaryValue = styled.div<{ discount?: boolean }>`
  font-size: 15px;
  font-weight: 600;
  color: ${props => props.discount ? '#ef4444' : '#111827'};
`;

const SummaryDivider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
`;

const NotesBox = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
`;

const NotesLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
`;

const NotesText = styled.div`
  font-size: 14px;
  color: #374151;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 16px;
  color: #6b7280;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 60px;
  font-size: 16px;
  color: #dc2626;
`;

export default OutboundDetailPage;
