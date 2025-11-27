import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ResponsiveAdminLayout from '@/components/Admin/ResponsiveAdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FiCreditCard, FiDollarSign, FiCheckCircle, FiXCircle, 
  FiClock, FiFilter, FiDownload, FiRefreshCw, FiAlertCircle 
} from 'react-icons/fi';

interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: 'bank' | 'momo' | 'cod' | 'vnpay';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  completedAt?: string;
}

export default function PaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
      return;
    }
    fetchPayments();
  }, [user, loading, router]);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      const data = await res.json();
      setPayments(data.payments || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Đã xác thực thanh toán thành công!');
        fetchPayments();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Lỗi khi xác thực thanh toán');
    }
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Bạn có chắc muốn hoàn tiền giao dịch này?')) return;
    
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Đã hoàn tiền thành công!');
        fetchPayments();
      }
    } catch (error) {
      console.error('Error refunding payment:', error);
      alert('Lỗi khi hoàn tiền');
    }
  };

  const filteredPayments = payments.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    return true;
  });

  const getMethodName = (method: string) => {
    const methods: any = {
      bank: 'Chuyển khoản',
      momo: 'MoMo',
      cod: 'COD',
      vnpay: 'VNPay'
    };
    return methods[method] || method;
  };

  const getStatusText = (status: string) => {
    const statuses: any = {
      pending: 'Chờ xử lý',
      completed: 'Hoàn thành',
      failed: 'Thất bại',
      refunded: 'Đã hoàn tiền'
    };
    return statuses[status] || status;
  };

  if (loading || loadingData) {
    return (
      <ResponsiveAdminLayout>
        <LoadingContainer>Đang tải...</LoadingContainer>
      </ResponsiveAdminLayout>
    );
  }

  return (
    <ResponsiveAdminLayout>
      <Container>
        <Header>
          <Title>Quản Lý Thanh Toán</Title>
          <Actions>
            <RefreshButton onClick={fetchPayments}>
              <FiRefreshCw /> Làm mới
            </RefreshButton>
            <ExportButton>
              <FiDownload /> Xuất báo cáo
            </ExportButton>
          </Actions>
        </Header>

        {/* Stats Cards */}
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatIcon color="#10b981">
              <FiCheckCircle />
            </StatIcon>
            <StatContent>
              <StatLabel>Giao dịch thành công</StatLabel>
              <StatValue>{stats?.completed || 0}</StatValue>
              <StatAmount>{(stats?.completedAmount || 0).toLocaleString('vi-VN')} ₫</StatAmount>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatIcon color="#f59e0b">
              <FiClock />
            </StatIcon>
            <StatContent>
              <StatLabel>Chờ xử lý</StatLabel>
              <StatValue>{stats?.pending || 0}</StatValue>
              <StatAmount>{(stats?.pendingAmount || 0).toLocaleString('vi-VN')} ₫</StatAmount>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatIcon color="#ef4444">
              <FiXCircle />
            </StatIcon>
            <StatContent>
              <StatLabel>Thất bại</StatLabel>
              <StatValue>{stats?.failed || 0}</StatValue>
              <StatAmount>{(stats?.failedAmount || 0).toLocaleString('vi-VN')} ₫</StatAmount>
            </StatContent>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatIcon color="#3b82f6">
              <FiDollarSign />
            </StatIcon>
            <StatContent>
              <StatLabel>Tổng doanh thu</StatLabel>
              <StatValue>{payments.length}</StatValue>
              <StatAmount>{(stats?.totalAmount || 0).toLocaleString('vi-VN')} ₫</StatAmount>
            </StatContent>
          </StatCard>
        </StatsGrid>

        {/* Payment Methods Stats */}
        <MethodsSection>
          <SectionTitle>Thống kê theo phương thức</SectionTitle>
          <MethodsGrid>
            <MethodCard>
              <MethodIcon color="#3b82f6">
                <FiCreditCard />
              </MethodIcon>
              <MethodInfo>
                <MethodName>Chuyển khoản</MethodName>
                <MethodStats>
                  {payments.filter(p => p.method === 'bank').length} giao dịch
                </MethodStats>
                <MethodAmount>
                  {payments
                    .filter(p => p.method === 'bank' && p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString('vi-VN')} ₫
                </MethodAmount>
              </MethodInfo>
            </MethodCard>

            <MethodCard>
              <MethodIcon color="#d91f5a">
                <FiCreditCard />
              </MethodIcon>
              <MethodInfo>
                <MethodName>MoMo</MethodName>
                <MethodStats>
                  {payments.filter(p => p.method === 'momo').length} giao dịch
                </MethodStats>
                <MethodAmount>
                  {payments
                    .filter(p => p.method === 'momo' && p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString('vi-VN')} ₫
                </MethodAmount>
              </MethodInfo>
            </MethodCard>

            <MethodCard>
              <MethodIcon color="#10b981">
                <FiDollarSign />
              </MethodIcon>
              <MethodInfo>
                <MethodName>COD</MethodName>
                <MethodStats>
                  {payments.filter(p => p.method === 'cod').length} giao dịch
                </MethodStats>
                <MethodAmount>
                  {payments
                    .filter(p => p.method === 'cod' && p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString('vi-VN')} ₫
                </MethodAmount>
              </MethodInfo>
            </MethodCard>

            <MethodCard>
              <MethodIcon color="#f59e0b">
                <FiCreditCard />
              </MethodIcon>
              <MethodInfo>
                <MethodName>VNPay</MethodName>
                <MethodStats>
                  {payments.filter(p => p.method === 'vnpay').length} giao dịch
                </MethodStats>
                <MethodAmount>
                  {payments
                    .filter(p => p.method === 'vnpay' && p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toLocaleString('vi-VN')} ₫
                </MethodAmount>
              </MethodInfo>
            </MethodCard>
          </MethodsGrid>
        </MethodsSection>

        {/* Filters */}
        <Filters>
          <FilterGroup>
            <FilterLabel>Trạng thái:</FilterLabel>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Đã hoàn tiền</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Phương thức:</FilterLabel>
            <Select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="bank">Chuyển khoản</option>
              <option value="momo">MoMo</option>
              <option value="cod">COD</option>
              <option value="vnpay">VNPay</option>
            </Select>
          </FilterGroup>
        </Filters>

        {/* Payments Table */}
        <PaymentsSection>
          <SectionTitle>Danh sách giao dịch ({filteredPayments.length})</SectionTitle>
          
          {filteredPayments.length > 0 ? (
            <PaymentsTable>
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Phương thức</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <TransactionId>{payment.transactionId || payment.id.slice(0, 8)}</TransactionId>
                    </td>
                    <td>
                      <OrderLink onClick={() => router.push(`/admin/orders/${payment.orderId}`)}>
                        #{payment.orderNumber}
                      </OrderLink>
                    </td>
                    <td>
                      <CustomerInfo>
                        <CustomerName>{payment.customerName}</CustomerName>
                        <CustomerEmail>{payment.customerEmail}</CustomerEmail>
                      </CustomerInfo>
                    </td>
                    <td>
                      <MethodBadge method={payment.method}>
                        {getMethodName(payment.method)}
                      </MethodBadge>
                    </td>
                    <td>
                      <Amount>{payment.amount.toLocaleString('vi-VN')} ₫</Amount>
                    </td>
                    <td>
                      <StatusBadge status={payment.status}>
                        {getStatusText(payment.status)}
                      </StatusBadge>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleString('vi-VN')}</td>
                    <td>
                      <ActionButtons>
                        {payment.status === 'pending' && (
                          <ActionButton
                            color="#10b981"
                            onClick={() => handleVerifyPayment(payment.id)}
                            title="Xác thực"
                          >
                            <FiCheckCircle />
                          </ActionButton>
                        )}
                        {payment.status === 'completed' && (
                          <ActionButton
                            color="#ef4444"
                            onClick={() => handleRefund(payment.id)}
                            title="Hoàn tiền"
                          >
                            <FiRefreshCw />
                          </ActionButton>
                        )}
                      </ActionButtons>
                    </td>
                  </tr>
                ))}
              </tbody>
            </PaymentsTable>
          ) : (
            <EmptyState>
              <FiAlertCircle size={48} />
              <EmptyText>Không có giao dịch nào</EmptyText>
            </EmptyState>
          )}
        </PaymentsSection>
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
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #059669;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatAmount = styled.div`
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
  margin-top: 0.25rem;
`;

const MethodsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
`;

const MethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const MethodCard = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
`;

const MethodIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const MethodInfo = styled.div`
  flex: 1;
`;

const MethodName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const MethodStats = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const MethodAmount = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
`;

const Filters = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
`;

const PaymentsSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PaymentsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    border-bottom: 2px solid #e5e7eb;
  }

  td {
    padding: 1rem 0.75rem;
    font-size: 0.875rem;
    border-bottom: 1px solid #f3f4f6;
  }

  tr:hover {
    background: #f9fafb;
  }
`;

const TransactionId = styled.span`
  font-family: monospace;
  font-weight: 600;
  color: #6b7280;
`;

const OrderLink = styled.span`
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const CustomerInfo = styled.div``;

const CustomerName = styled.div`
  font-weight: 500;
  color: #1f2937;
`;

const CustomerEmail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const MethodBadge = styled.span<{ method: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.method) {
      case 'bank': return '#3b82f620';
      case 'momo': return '#d91f5a20';
      case 'cod': return '#10b98120';
      case 'vnpay': return '#f59e0b20';
      default: return '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.method) {
      case 'bank': return '#3b82f6';
      case 'momo': return '#d91f5a';
      case 'cod': return '#10b981';
      case 'vnpay': return '#f59e0b';
      default: return '#6b7280';
    }
  }};
`;

const Amount = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#10b98120';
      case 'pending': return '#f59e0b20';
      case 'failed': return '#ef444420';
      case 'refunded': return '#6b728020';
      default: return '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      case 'refunded': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ color: string }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.color};
    color: white;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
`;

const EmptyText = styled.p`
  margin-top: 1rem;
  font-size: 1.125rem;
  color: #6b7280;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
`;
