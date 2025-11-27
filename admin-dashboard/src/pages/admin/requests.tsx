import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import RequestDetailModal from '@/components/Admin/RequestDetailModal';
import { FiMail, FiPhone, FiPackage, FiClock, FiCheck, FiX, FiEye, FiUser } from 'react-icons/fi';

const RequestsPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const res = await fetch(`/api/admin/requests?${params}`);
      const data = await res.json();

      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!confirm('Bạn có chắc muốn duyệt yêu cầu này?')) return;

    try {
      // Check if it's a return request (starts with 'return_')
      const isReturnRequest = requestId.startsWith('return_');
      
      const res = await fetch('/api/admin/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: 'approved'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Đã duyệt yêu cầu');
        fetchRequests();
      } else {
        alert(data.error || data.message || 'Lỗi khi duyệt yêu cầu');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Lỗi khi duyệt yêu cầu');
    }
  };

  const handleReject = async (requestId: string) => {
    const adminNote = prompt('Lý do từ chối:');
    if (!adminNote) return;

    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: 'rejected',
          adminNote
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Đã từ chối yêu cầu');
        fetchRequests();
      } else {
        alert(data.error || data.message || 'Lỗi khi từ chối yêu cầu');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Lỗi khi từ chối yêu cầu');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email_change': return <FiMail />;
      case 'phone_change': return <FiPhone />;
      case 'return_exchange': return <FiPackage />;
      default: return <FiMail />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'email_change': return 'Đổi email';
      case 'phone_change': return 'Đổi SĐT';
      case 'return_exchange': return 'Hoàn trả/Đổi hàng';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Chờ xử lý' },
      approved: { bg: '#d1fae5', color: '#065f46', text: 'Đã duyệt' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Từ chối' },
      completed: { bg: '#dbeafe', color: '#1e40af', text: 'Hoàn thành' }
    };

    const style = colors[status] || colors.pending;

    return (
      <StatusBadge bg={style.bg} color={style.color}>
        {style.text}
      </StatusBadge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>Quản lý yêu cầu khách hàng</Title>
        </Header>

        <FilterSection>
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
            Tất cả ({requests.length})
          </FilterButton>
          <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>
            <FiClock /> Chờ xử lý
          </FilterButton>
          <FilterButton active={filter === 'approved'} onClick={() => setFilter('approved')}>
            <FiCheck /> Đã duyệt
          </FilterButton>
          <FilterButton active={filter === 'rejected'} onClick={() => setFilter('rejected')}>
            <FiX /> Từ chối
          </FilterButton>
        </FilterSection>

        {loading ? (
          <LoadingState>Đang tải...</LoadingState>
        ) : requests.length === 0 ? (
          <EmptyState>
            <FiMail size={48} />
            <p>Chưa có yêu cầu nào</p>
          </EmptyState>
        ) : (
          <RequestsList>
            {requests.map((request) => (
              <RequestCard key={request.id}>
                <RequestHeader>
                  <TypeIcon>{getTypeIcon(request.type)}</TypeIcon>
                  <RequestInfo>
                    <RequestType>{getTypeName(request.type)}</RequestType>
                    <RequestDate>{formatDate(request.createdAt)}</RequestDate>
                  </RequestInfo>
                  {getStatusBadge(request.status)}
                </RequestHeader>

                <RequestBody>
                  {request.type === 'email_change' && (
                    <ChangeInfo>
                      <ChangeLabel>Email hiện tại:</ChangeLabel>
                      <ChangeValue>{request.data.currentEmail}</ChangeValue>
                      <ChangeArrow>→</ChangeArrow>
                      <ChangeLabel>Email mới:</ChangeLabel>
                      <ChangeValue highlight>{request.data.newEmail}</ChangeValue>
                    </ChangeInfo>
                  )}

                  {request.type === 'phone_change' && (
                    <ChangeInfo>
                      <ChangeLabel>SĐT hiện tại:</ChangeLabel>
                      <ChangeValue>{request.data.currentPhone || 'Chưa có'}</ChangeValue>
                      <ChangeArrow>→</ChangeArrow>
                      <ChangeLabel>SĐT mới:</ChangeLabel>
                      <ChangeValue highlight>{request.data.newPhone}</ChangeValue>
                    </ChangeInfo>
                  )}

                  {request.type === 'return_exchange' && request.data && (
                    <ChangeInfo>
                      <ChangeLabel>Đơn hàng:</ChangeLabel>
                      <ChangeValue>#{request.data.orderNumber}</ChangeValue>
                      <ChangeArrow>•</ChangeArrow>
                      <ChangeLabel>Số lượng SP:</ChangeLabel>
                      <ChangeValue highlight>{request.data.items?.length || 0} sản phẩm</ChangeValue>
                      <ChangeArrow>•</ChangeArrow>
                      <ChangeLabel>Hoàn tiền:</ChangeLabel>
                      <ChangeValue highlight>{request.data.refundAmount?.toLocaleString('vi-VN')}₫</ChangeValue>
                    </ChangeInfo>
                  )}

                  <ReasonSection>
                    <ReasonLabel>Lý do:</ReasonLabel>
                    <ReasonText>{request.reason}</ReasonText>
                  </ReasonSection>

                  {request.adminNote && (
                    <AdminNoteSection>
                      <AdminNoteLabel>Ghi chú admin:</AdminNoteLabel>
                      <AdminNoteText>{request.adminNote}</AdminNoteText>
                    </AdminNoteSection>
                  )}
                </RequestBody>

                {request.status === 'pending' && (
                  <RequestActions>
                    <ViewButton onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailModal(true);
                    }}>
                      <FiEye /> Xem
                    </ViewButton>
                    <ApproveButton onClick={() => handleApprove(request.id)}>
                      <FiCheck /> Duyệt
                    </ApproveButton>
                    <RejectButton onClick={() => handleReject(request.id)}>
                      <FiX /> Từ chối
                    </RejectButton>
                  </RequestActions>
                )}
              </RequestCard>
            ))}
          </RequestsList>
        )}

        <RequestDetailModal
          request={selectedRequest}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </Container>
    </ResponsiveAdminLayout>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #2c3e50;
  margin: 0;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    background: ${props => props.active ? '#2563eb' : '#eff6ff'};
  }
`;

const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #9ca3af;

  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RequestCard = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

const RequestHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const TypeIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
`;

const RequestInfo = styled.div`
  flex: 1;
`;

const RequestType = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const RequestDate = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const StatusBadge = styled.span<{ bg: string; color: string }>`
  padding: 0.375rem 0.75rem;
  background: ${props => props.bg};
  color: ${props => props.color};
  border-radius: 9999px;
  font-size: 0.813rem;
  font-weight: 600;
`;

const RequestBody = styled.div`
  padding: 1.5rem;
`;

const ChangeInfo = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto auto 1fr;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ChangeLabel = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;
`;

const ChangeValue = styled.div<{ highlight?: boolean }>`
  font-size: 0.875rem;
  color: ${props => props.highlight ? '#3b82f6' : '#111827'};
  font-weight: ${props => props.highlight ? 600 : 400};
`;

const ChangeArrow = styled.div`
  font-size: 1.25rem;
  color: #3b82f6;
  text-align: center;
`;

const ReasonSection = styled.div`
  margin-bottom: 1rem;
`;

const ReasonLabel = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const ReasonText = styled.div`
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
`;

const AdminNoteSection = styled.div`
  padding: 1rem;
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
`;

const AdminNoteLabel = styled.div`
  font-size: 0.813rem;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const AdminNoteText = styled.div`
  font-size: 0.875rem;
  color: #78350f;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ApproveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  background: #10b981;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #059669;
  }
`;

const RejectButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

// Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  backdrop-filter: blur(4px);
`;

const DetailModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;

  svg {
    font-size: 1.5rem;
    color: #3b82f6;
  }
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
    color: #111827;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  min-width: 120px;
`;

const InfoValue = styled.div`
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 1.5rem 0;
`;

const DetailSection = styled.div`
  margin-bottom: 1rem;
`;

const DetailLabel = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div<{ highlight?: boolean }>`
  font-size: 0.938rem;
  color: ${props => props.highlight ? '#3b82f6' : '#111827'};
  font-weight: ${props => props.highlight ? 600 : 400};
`;

const ReasonBox = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
`;

const AdminNoteBox = styled.div`
  padding: 1rem;
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #78350f;
  line-height: 1.6;
`;

const ProductsSection = styled.div`
  margin-top: 0.5rem;
`;

const ProductItem = styled.div`
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

export default RequestsPage;
