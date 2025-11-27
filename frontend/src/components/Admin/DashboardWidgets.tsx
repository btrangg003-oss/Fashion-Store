import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiTrendingDown, FiDollarSign, 
  FiShoppingCart, FiUsers, FiPackage, FiAlertCircle 
} from 'react-icons/fi';

interface WidgetData {
  revenue: { value: number; change: number };
  orders: { value: number; change: number };
  customers: { value: number; change: number };
  products: { value: number; lowStock: number };
}

export default function DashboardWidgets() {
  const [data, setData] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard/widgets');
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <LoadingContainer>Đang tải...</LoadingContainer>;
  }

  return (
    <WidgetsGrid>
      <Widget
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <WidgetIcon color="#10b981">
          <FiDollarSign />
        </WidgetIcon>
        <WidgetContent>
          <WidgetLabel>Doanh thu</WidgetLabel>
          <WidgetValue>{data.revenue.value.toLocaleString('vi-VN')} ₫</WidgetValue>
          <WidgetChange positive={data.revenue.change > 0}>
            {data.revenue.change > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(data.revenue.change)}% so với tháng trước
          </WidgetChange>
        </WidgetContent>
      </Widget>

      <Widget
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <WidgetIcon color="#3b82f6">
          <FiShoppingCart />
        </WidgetIcon>
        <WidgetContent>
          <WidgetLabel>Đơn hàng</WidgetLabel>
          <WidgetValue>{data.orders.value}</WidgetValue>
          <WidgetChange positive={data.orders.change > 0}>
            {data.orders.change > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(data.orders.change)}% so với tháng trước
          </WidgetChange>
        </WidgetContent>
      </Widget>

      <Widget
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <WidgetIcon color="#8b5cf6">
          <FiUsers />
        </WidgetIcon>
        <WidgetContent>
          <WidgetLabel>Khách hàng</WidgetLabel>
          <WidgetValue>{data.customers.value}</WidgetValue>
          <WidgetChange positive={data.customers.change > 0}>
            {data.customers.change > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {Math.abs(data.customers.change)}% so với tháng trước
          </WidgetChange>
        </WidgetContent>
      </Widget>

      <Widget
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <WidgetIcon color="#f59e0b">
          <FiPackage />
        </WidgetIcon>
        <WidgetContent>
          <WidgetLabel>Sản phẩm</WidgetLabel>
          <WidgetValue>{data.products.value}</WidgetValue>
          {data.products.lowStock > 0 && (
            <WidgetAlert>
              <FiAlertCircle />
              {data.products.lowStock} sản phẩm sắp hết hàng
            </WidgetAlert>
          )}
        </WidgetContent>
      </Widget>
    </WidgetsGrid>
  );
}

const LoadingContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;

const WidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Widget = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const WidgetIcon = styled.div<{ color: string }>`
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

const WidgetContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const WidgetLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const WidgetValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
`;

const WidgetChange = styled.div<{ positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  font-weight: 500;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const WidgetAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #f59e0b;
  font-weight: 500;
  margin-top: 0.25rem;

  svg {
    width: 14px;
    height: 14px;
  }
`;
