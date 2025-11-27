import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiUser, FiMapPin, FiShoppingBag, FiFileText,
  FiMail, FiPhone, FiCalendar, FiDollarSign
} from 'react-icons/fi';
import { getTierInfo, getSegmentInfo } from '@/services/customerTiers';

interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tier?: string;
  segment?: string;
  status?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  lastOrderDate?: string;
  dateOfBirth?: string;
  gender?: string;
  notes?: string;
  addresses?: any[];
}

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'info' | 'addresses' | 'orders' | 'notes';

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customer && activeTab === 'orders') {
      fetchOrders();
    }
  }, [isOpen, customer, activeTab]);

  const fetchOrders = async () => {
    if (!customer) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  const tierInfo = customer.tier ? getTierInfo(customer.tier as any) : null;
  const segmentInfo = customer.segment ? getSegmentInfo(customer.segment as any) : null;
  const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                <UserIcon><FiUser /></UserIcon>
                <div>
                  <ModalTitle>{fullName}</ModalTitle>
                  <ModalSubtitle>{customer.email}</ModalSubtitle>
                </div>
              </HeaderLeft>
              <CloseButton onClick={onClose}>
                <FiX size={24} />
              </CloseButton>
            </ModalHeader>

            <TabsContainer>
              <Tab active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
                <FiUser /> Thông tin
              </Tab>
              <Tab active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')}>
                <FiMapPin /> Địa chỉ
              </Tab>
              <Tab active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
                <FiShoppingBag /> Đơn hàng
              </Tab>
              <Tab active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
                <FiFileText /> Ghi chú
              </Tab>
            </TabsContainer>

            <ModalBody>
              {activeTab === 'info' && (
                <InfoTab>
                  <Section>
                    <SectionTitle>Thông tin cá nhân</SectionTitle>
                    <InfoGrid>
                      <InfoItem>
                        <InfoLabel>Họ tên</InfoLabel>
                        <InfoValue>{fullName}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Email</InfoLabel>
                        <InfoValue>{customer.email}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Số điện thoại</InfoLabel>
                        <InfoValue>{customer.phone || 'Chưa cập nhật'}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Ngày sinh</InfoLabel>
                        <InfoValue>
                          {customer.dateOfBirth ? formatDate(customer.dateOfBirth) : 'Chưa cập nhật'}
                        </InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Giới tính</InfoLabel>
                        <InfoValue>
                          {customer.gender === 'male' ? 'Nam' : 
                           customer.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                        </InfoValue>
                      </InfoItem>
                    </InfoGrid>
                  </Section>

                  <Section>
                    <SectionTitle>Thống kê</SectionTitle>
                    <StatsGrid>
                      <StatCard>
                        <StatIcon color="#3b82f6"><FiShoppingBag /></StatIcon>
                        <StatValue>{customer.totalOrders || 0}</StatValue>
                        <StatLabel>Đơn hàng</StatLabel>
                      </StatCard>
                      <StatCard>
                        <StatIcon color="#10b981"><FiDollarSign /></StatIcon>
                        <StatValue>{formatCurrency(customer.totalSpent || 0)}</StatValue>
                        <StatLabel>Tổng chi tiêu</StatLabel>
                      </StatCard>
                      <StatCard>
                        <StatIcon color="#f59e0b"><FiCalendar /></StatIcon>
                        <StatValue>
                          {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'Chưa có'}
                        </StatValue>
                        <StatLabel>Đơn hàng cuối</StatLabel>
                      </StatCard>
                    </StatsGrid>
                  </Section>

                  <Section>
                    <SectionTitle>Hạng & Phân loại</SectionTitle>
                    <TierSegmentGrid>
                      {tierInfo && (
                        <TierCard color={tierInfo.color} bgColor={tierInfo.bgColor}>
                          <CardLabel>Hạng khách hàng</CardLabel>
                          <TierIcon>{tierInfo.icon}</TierIcon>
                          <TierName>{tierInfo.name}</TierName>
                          <TierMinSpent>
                            Chi tiêu tối thiểu: {tierInfo.minSpent.toLocaleString('vi-VN')}đ
                          </TierMinSpent>
                          <TierBenefits>
                            {tierInfo.benefits.map((benefit, index) => (
                              <BenefitItem key={index}>✓ {benefit}</BenefitItem>
                            ))}
                          </TierBenefits>
                        </TierCard>
                      )}
                      
                      {segmentInfo && (
                        <SegmentCard color={segmentInfo.color} bgColor={segmentInfo.bgColor}>
                          <CardLabel>Phân loại</CardLabel>
                          <SegmentIcon>{segmentInfo.icon}</SegmentIcon>
                          <SegmentName>{segmentInfo.name}</SegmentName>
                          <SegmentDescription>{segmentInfo.description}</SegmentDescription>
                        </SegmentCard>
                      )}
                    </TierSegmentGrid>
                  </Section>
                </InfoTab>
              )}

              {activeTab === 'addresses' && (
                <AddressesTab>
                  {customer.addresses && customer.addresses.length > 0 ? (
                    customer.addresses.map((address, index) => (
                      <AddressCard key={index}>
                        <AddressHeader>
                          <FiMapPin />
                          <span>Địa chỉ {index + 1}</span>
                        </AddressHeader>
                        <AddressContent>
                          <p><strong>{address.fullName}</strong></p>
                          <p>{address.phone}</p>
                          <p>{address.address}</p>
                          <p>{address.ward}, {address.district}</p>
                          <p>{address.city}</p>
                        </AddressContent>
                      </AddressCard>
                    ))
                  ) : (
                    <EmptyState>
                      <FiMapPin size={48} />
                      <p>Chưa có địa chỉ nào</p>
                    </EmptyState>
                  )}
                </AddressesTab>
              )}

              {activeTab === 'orders' && (
                <OrdersTab>
                  {loading ? (
                    <LoadingState>Đang tải...</LoadingState>
                  ) : orders.length > 0 ? (
                    <OrdersList>
                      {orders.map((order) => (
                        <OrderCard key={order.id}>
                          <OrderHeader>
                            <OrderNumber>#{order.orderNumber}</OrderNumber>
                            <OrderStatus status={order.status}>
                              {order.status === 'delivered' ? 'Đã giao' :
                               order.status === 'shipping' ? 'Đang giao' :
                               order.status === 'processing' ? 'Đang xử lý' :
                               order.status === 'cancelled' ? 'Đã hủy' : order.status}
                            </OrderStatus>
                          </OrderHeader>
                          <OrderInfo>
                            <OrderDate>{formatDate(order.createdAt)}</OrderDate>
                            <OrderTotal>{formatCurrency(order.total)}</OrderTotal>
                          </OrderInfo>
                        </OrderCard>
                      ))}
                    </OrdersList>
                  ) : (
                    <EmptyState>
                      <FiShoppingBag size={48} />
                      <p>Chưa có đơn hàng nào</p>
                    </EmptyState>
                  )}
                </OrdersTab>
              )}

              {activeTab === 'notes' && (
                <NotesTab>
                  <NotesContent>
                    {customer.notes || 'Chưa có ghi chú'}
                  </NotesContent>
                </NotesTab>
              )}
            </ModalBody>
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
  transform: translate(-50%, -50%) !important;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0 !important;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const ModalSubtitle = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
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

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem 0;
  border-bottom: 1px solid #e5e7eb;
  background: white;
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: ${props => props.active ? '#3b82f6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#2563eb' : '#f3f4f6'};
    color: ${props => props.active ? 'white' : '#111827'};
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const InfoTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div``;

const SectionTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 0.938rem;
  color: #111827;
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  text-align: center;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
`;

const TierSegmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CardLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
`;

const TierCard = styled.div<{ color: string; bgColor: string }>`
  padding: 2rem;
  background: ${props => props.bgColor};
  border: 2px solid ${props => props.color}40;
  border-radius: 12px;
  text-align: center;
`;

const TierIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const TierName = styled.h4`
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const TierMinSpent = styled.div`
  font-size: 0.813rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const TierBenefits = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
`;

const BenefitItem = styled.li`
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SegmentCard = styled.div<{ color: string; bgColor: string }>`
  padding: 2rem;
  background: ${props => props.bgColor};
  border: 2px solid ${props => props.color}40;
  border-radius: 12px;
  text-align: center;
`;

const SegmentIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SegmentName = styled.h4`
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
`;

const SegmentDescription = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
`;

const AddressesTab = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const AddressCard = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`;

const AddressHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #111827;
`;

const AddressContent = styled.div`
  p {
    margin: 0.5rem 0;
    font-size: 0.875rem;
    color: #374151;
  }
`;

const OrdersTab = styled.div``;

const LoadingState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #6b7280;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderCard = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #111827;
`;

const OrderStatus = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'delivered': return '#d1fae5';
      case 'shipping': return '#dbeafe';
      case 'processing': return '#fef3c7';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': return '#065f46';
      case 'shipping': return '#1e40af';
      case 'processing': return '#92400e';
      case 'cancelled': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const OrderInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OrderDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const OrderTotal = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #059669;
`;

const NotesTab = styled.div``;

const NotesContent = styled.div`
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  min-height: 200px;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.6;
  white-space: pre-wrap;
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

export default CustomerDetailModal;
