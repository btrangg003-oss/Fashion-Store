import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiPhone, FiPackage, FiUser, FiCalendar, FiMessageSquare } from 'react-icons/fi';

interface RequestDetailModalProps {
  request: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!isOpen || !request) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email_change': return <FiMail />;
      case 'phone_change': return <FiPhone />;
      case 'return_exchange': return <FiPackage />;
      default: return <FiMessageSquare />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'email_change': return 'Đổi email';
      case 'phone_change': return 'Đổi số điện thoại';
      case 'return_exchange': return 'Hoàn trả/Đổi hàng';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <Modal
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <ModalHeader>
              <HeaderLeft>
                <TypeIcon>{getTypeIcon(request.type)}</TypeIcon>
                <HeaderInfo>
                  <ModalTitle>{getTypeName(request.type)}</ModalTitle>
                  <RequestId>#{request.id}</RequestId>
                </HeaderInfo>
              </HeaderLeft>
              <CloseButton onClick={onClose}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <Section>
                <SectionTitle>Thông tin chung</SectionTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel><FiCalendar /> Ngày tạo:</InfoLabel>
                    <InfoValue>{new Date(request.createdAt).toLocaleString('vi-VN')}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Trạng thái:</InfoLabel>
                    <StatusBadge color={getStatusColor(request.status)}>
                      {getStatusText(request.status)}
                    </StatusBadge>
                  </InfoItem>
                </InfoGrid>
              </Section>

              {request.type === 'email_change' && (
                <Section>
                  <SectionTitle>Chi tiết đổi email</SectionTitle>
                  <ChangeBox>
                    <ChangeItem>
                      <ChangeLabel>Email hiện tại:</ChangeLabel>
                      <ChangeValue>{request.data.currentEmail}</ChangeValue>
                    </ChangeItem>
                    <ChangeArrow>→</ChangeArrow>
                    <ChangeItem>
                      <ChangeLabel>Email mới:</ChangeLabel>
                      <ChangeValue highlight>{request.data.newEmail}</ChangeValue>
                    </ChangeItem>
                  </ChangeBox>
                </Section>
              )}

              {request.type === 'phone_change' && (
                <Section>
                  <SectionTitle>Chi tiết đổi số điện thoại</SectionTitle>
                  <ChangeBox>
                    <ChangeItem>
                      <ChangeLabel>SĐT hiện tại:</ChangeLabel>
                      <ChangeValue>{request.data.currentPhone || 'Chưa có'}</ChangeValue>
                    </ChangeItem>
                    <ChangeArrow>→</ChangeArrow>
                    <ChangeItem>
                      <ChangeLabel>SĐT mới:</ChangeLabel>
                      <ChangeValue highlight>{request.data.newPhone}</ChangeValue>
                    </ChangeItem>
                  </ChangeBox>
                </Section>
              )}

              {request.type === 'return_exchange' && request.data && (
                <Section>
                  <SectionTitle>Chi tiết đổi trả hàng</SectionTitle>
                  <ReturnInfo>
                    <ReturnItem>
                      <ReturnLabel>Đơn hàng:</ReturnLabel>
                      <ReturnValue>#{request.data.orderNumber}</ReturnValue>
                    </ReturnItem>
                    <ReturnItem>
                      <ReturnLabel>Mã trả hàng:</ReturnLabel>
                      <ReturnValue>#{request.data.returnNumber}</ReturnValue>
                    </ReturnItem>
                    <ReturnItem>
                      <ReturnLabel>Số lượng sản phẩm:</ReturnLabel>
                      <ReturnValue>{request.data.items?.length || 0} sản phẩm</ReturnValue>
                    </ReturnItem>
                    <ReturnItem>
                      <ReturnLabel>Hoàn tiền:</ReturnLabel>
                      <ReturnValue highlight>
                        {request.data.refundAmount?.toLocaleString('vi-VN')}₫
                      </ReturnValue>
                    </ReturnItem>
                  </ReturnInfo>

                  {request.data.items && request.data.items.length > 0 && (
                    <ProductsList>
                      <ProductsTitle>Sản phẩm:</ProductsTitle>
                      {request.data.items.map((item: any, idx: number) => (
                        <ProductItem key={idx}>
                          <ProductImage 
                            src={item.image} 
                            alt={item.productName}
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/60';
                            }}
                          />
                          <ProductDetails>
                            <ProductName>{item.productName}</ProductName>
                            <ProductMeta>
                              {item.size && `Size: ${item.size}`}
                              {item.color && ` • Màu: ${item.color}`}
                              {` • x${item.quantity}`}
                            </ProductMeta>
                          </ProductDetails>
                          <ProductPrice>
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </ProductPrice>
                        </ProductItem>
                      ))}
                    </ProductsList>
                  )}
                </Section>
              )}

              <Section>
                <SectionTitle>Lý do</SectionTitle>
                <ReasonBox>{request.reason}</ReasonBox>
              </Section>

              {request.adminNote && (
                <Section>
                  <SectionTitle>Ghi chú admin</SectionTitle>
                  <AdminNoteBox>{request.adminNote}</AdminNoteBox>
                </Section>
              )}

              {request.processedBy && (
                <Section>
                  <SectionTitle>Thông tin xử lý</SectionTitle>
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel><FiUser /> Người xử lý:</InfoLabel>
                      <InfoValue>{request.processedBy}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel><FiCalendar /> Thời gian xử lý:</InfoLabel>
                      <InfoValue>
                        {new Date(request.processedAt).toLocaleString('vi-VN')}
                      </InfoValue>
                    </InfoItem>
                  </InfoGrid>
                </Section>
              )}
            </ModalBody>

            {request.status === 'pending' && (onApprove || onReject) && (
              <ModalFooter>
                <FooterButton 
                  variant="secondary" 
                  onClick={onClose}
                >
                  Đóng
                </FooterButton>
                {onReject && (
                  <FooterButton 
                    variant="danger" 
                    onClick={() => {
                      onReject(request.id);
                      onClose();
                    }}
                  >
                    <FiX /> Từ chối
                  </FooterButton>
                )}
                {onApprove && (
                  <FooterButton 
                    variant="primary" 
                    onClick={() => {
                      onApprove(request.id);
                      onClose();
                    }}
                  >
                    <FiPackage /> Duyệt
                  </FooterButton>
                )}
              </ModalFooter>
            )}

            {request.status !== 'pending' && (
              <ModalFooter>
                <FooterButton 
                  variant="secondary" 
                  onClick={onClose}
                  style={{ marginLeft: 'auto' }}
                >
                  Đóng
                </FooterButton>
              </ModalFooter>
            )}
          </Modal>
        </>
      )}
    </AnimatePresence>
  );
};

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  backdrop-filter: blur(4px);
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 700px;
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
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TypeIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
`;

const HeaderInfo = styled.div``;

const ModalTitle = styled.h2`
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const RequestId = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  font-family: monospace;
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

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;

  svg {
    font-size: 1rem;
  }
`;

const InfoValue = styled.div`
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border: 2px solid ${props => props.color}30;
  border-radius: 9999px;
  font-size: 0.813rem;
  font-weight: 600;
  width: fit-content;
`;

const ChangeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ChangeItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ChangeLabel = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;
`;

const ChangeValue = styled.div<{ highlight?: boolean }>`
  font-size: 1rem;
  color: ${props => props.highlight ? '#3b82f6' : '#111827'};
  font-weight: ${props => props.highlight ? 600 : 500};
  word-break: break-all;
`;

const ChangeArrow = styled.div`
  font-size: 1.5rem;
  color: #3b82f6;
  font-weight: 700;

  @media (max-width: 640px) {
    transform: rotate(90deg);
  }
`;

const ReturnInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ReturnItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ReturnLabel = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  font-weight: 500;
`;

const ReturnValue = styled.div<{ highlight?: boolean }>`
  font-size: 0.938rem;
  color: ${props => props.highlight ? '#10b981' : '#111827'};
  font-weight: ${props => props.highlight ? 700 : 500};
`;

const ProductsList = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const ProductsTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const ProductMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ProductPrice = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
`;

const ReasonBox = styled.div`
  padding: 1rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.6;
`;

const AdminNoteBox = styled.div`
  padding: 1rem;
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #991b1b;
  line-height: 1.6;
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

const FooterButton = styled.button<{ variant: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: ${props => 
    props.variant === 'secondary' ? '1px solid #d1d5db' : 'none'
  };
  background: ${props => 
    props.variant === 'primary' ? '#10b981' :
    props.variant === 'danger' ? '#ef4444' :
    'white'
  };
  color: ${props => 
    props.variant === 'secondary' ? '#374151' : 'white'
  };
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => 
      props.variant === 'primary' ? '#059669' :
      props.variant === 'danger' ? '#dc2626' :
      '#f9fafb'
    };
    transform: translateY(-1px);
  }

  svg {
    font-size: 1rem;
  }
`;

export default RequestDetailModal;
