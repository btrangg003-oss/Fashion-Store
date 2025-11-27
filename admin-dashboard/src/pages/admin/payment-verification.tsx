import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { FiCheckCircle, FiXCircle, FiSearch, FiRefreshCw } from 'react-icons/fi';

export default function PaymentVerificationPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('pending');
    const [verifying, setVerifying] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/payments');
            const data = await res.json();

            if (data.success) {
                let filtered = data.data;
                if (filterStatus !== 'all') {
                    filtered = filtered.filter((o: any) => o.paymentStatus === filterStatus);
                }
                setOrders(filtered);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPayment = async (orderId: string, transactionId: string) => {
        if (!confirm('Xác nhận đã nhận được thanh toán cho đơn hàng này?')) {
            return;
        }

        try {
            setVerifying(orderId);
            const res = await fetch(`/api/admin/payments/${orderId}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId })
            });

            const data = await res.json();

            if (data.success) {
                alert('Xác nhận thanh toán thành công!');
                fetchOrders();
            } else {
                alert('Lỗi: ' + data.error);
            }
        } catch (error) {
            alert('Có lỗi xảy ra khi xác nhận thanh toán');
        } finally {
            setVerifying(null);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ResponsiveAdminLayout>
            <Container>
                <Header>
                    <Title>Xác Nhận Thanh Toán</Title>
                    <RefreshButton onClick={fetchOrders}>
                        <FiRefreshCw />
                        Làm mới
                    </RefreshButton>
                </Header>

                <FilterBar>
                    <SearchBox>
                        <FiSearch />
                        <SearchInput
                            type="text"
                            placeholder="Tìm kiếm theo mã đơn, tên, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </SearchBox>

                    <FilterButtons>
                        <FilterButton
                            active={filterStatus === 'all'}
                            onClick={() => setFilterStatus('all')}
                        >
                            Tất cả
                        </FilterButton>
                        <FilterButton
                            active={filterStatus === 'pending'}
                            onClick={() => setFilterStatus('pending')}
                        >
                            Chờ xác nhận
                        </FilterButton>
                        <FilterButton
                            active={filterStatus === 'paid'}
                            onClick={() => setFilterStatus('paid')}
                        >
                            Đã thanh toán
                        </FilterButton>
                    </FilterButtons>
                </FilterBar>

                {loading ? (
                    <LoadingState>Đang tải...</LoadingState>
                ) : filteredOrders.length === 0 ? (
                    <EmptyState>Không có đơn hàng nào</EmptyState>
                ) : (
                    <OrdersGrid>
                        {filteredOrders.map((order) => (
                            <OrderCard key={order.id}>
                                <OrderHeader>
                                    <OrderNumber>#{order.orderNumber}</OrderNumber>
                                    <StatusBadge status={order.paymentStatus}>
                                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                    </StatusBadge>
                                </OrderHeader>

                                <OrderInfo>
                                    <InfoRow>
                                        <Label>Khách hàng:</Label>
                                        <Value>{order.customerInfo?.name}</Value>
                                    </InfoRow>
                                    <InfoRow>
                                        <Label>Email:</Label>
                                        <Value>{order.customerInfo?.email}</Value>
                                    </InfoRow>
                                    <InfoRow>
                                        <Label>Số điện thoại:</Label>
                                        <Value>{order.customerInfo?.phone}</Value>
                                    </InfoRow>
                                    <InfoRow>
                                        <Label>Phương thức:</Label>
                                        <Value>
                                            {order.paymentMethod === 'bank' && 'Chuyển khoản'}
                                            {order.paymentMethod === 'momo' && 'MoMo'}
                                            {order.paymentMethod === 'cod' && 'COD'}
                                        </Value>
                                    </InfoRow>
                                    <InfoRow>
                                        <Label>Tổng tiền:</Label>
                                        <Amount>{order.total?.toLocaleString('vi-VN')} ₫</Amount>
                                    </InfoRow>
                                    {order.transactionId && (
                                        <InfoRow>
                                            <Label>Mã GD:</Label>
                                            <Value>{order.transactionId}</Value>
                                        </InfoRow>
                                    )}
                                    <InfoRow>
                                        <Label>Ngày đặt:</Label>
                                        <Value>{new Date(order.createdAt).toLocaleString('vi-VN')}</Value>
                                    </InfoRow>
                                </OrderInfo>

                                {order.paymentStatus === 'pending' && order.paymentMethod !== 'cod' && (
                                    <ActionButtons>
                                        <VerifyButton
                                            onClick={() => handleVerifyPayment(order.id, `TXN${Date.now()}`)}
                                            disabled={verifying === order.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiCheckCircle />
                                            {verifying === order.id ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                                        </VerifyButton>
                                    </ActionButtons>
                                )}

                                {order.paymentStatus === 'paid' && (
                                    <PaidInfo>
                                        <FiCheckCircle />
                                        Đã xác nhận lúc {new Date(order.paidAt).toLocaleString('vi-VN')}
                                    </PaidInfo>
                                )}
                            </OrderCard>
                        ))}
                    </OrdersGrid>
                )}
            </Container>
        </ResponsiveAdminLayout>
    );
}

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1f2937;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #1f2937;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? '#000' : 'white'};
  color: ${props => props.active ? 'white' : '#1f2937'};
  border: 2px solid ${props => props.active ? '#000' : '#e5e7eb'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #000;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    border-color: #000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
`;

const OrderNumber = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => props.status === 'paid' ? '#d1fae5' : '#fef3c7'};
  color: ${props => props.status === 'paid' ? '#065f46' : '#92400e'};
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Label = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const Value = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const Amount = styled.span`
  color: #ef4444;
  font-weight: 700;
  font-size: 1.125rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #f3f4f6;
`;

const VerifyButton = styled(motion.button)`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaidInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 1rem;
`;
