import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTruck, FiPackage, FiClock, FiCheckCircle, FiXCircle, FiEye, FiShoppingCart } from 'react-icons/fi';
import OrderDetailModal from '../Orders/OrderDetailModal';
import { Order } from '@/models/orders';

interface OrdersTabProps {
  userId: string;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ userId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [userId, filter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (filter !== 'all') params.append('status', filter);

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason: 'Khách hàng hủy đơn' })
      });

      const data = await res.json();

      if (data.success) {
        alert('Hủy đơn hàng thành công!');
        setShowDetailModal(false);
        fetchOrders(); // Refresh list
      } else {
        alert(data.message || 'Không thể hủy đơn hàng');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  const handleReorder = async (order: Order) => {
    try {
      // Get cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      let addedCount = 0;
      let outOfStockItems: string[] = [];
      let notFoundItems: string[] = [];
      
      // Verify products still exist before adding to cart
      for (const item of order.items) {
        try {
          // Use productId
          const productId = item.productId;
          
          // Check if product still exists
          const response = await fetch(`/api/products/${productId}`);
          
          if (!response.ok) {
            notFoundItems.push(item.name);
            continue;
          }
          
          const productData = await response.json();
          const product = productData.product;
          
          // Check if product is still available
          if (!product) {
            notFoundItems.push(item.name);
            continue;
          }
          
          if (product.stock === 0 || product.stock < item.quantity) {
            outOfStockItems.push(`${item.name} (Còn ${product.stock || 0} sản phẩm)`);
            continue;
          }
          
          // Find existing item in cart
          const existingItem = cart.find((cartItem: any) => 
            cartItem.id === productId && 
            cartItem.size === item.size && 
            cartItem.color === item.color
          );
          
          if (existingItem) {
            // Check if adding quantity exceeds stock
            const newQuantity = existingItem.quantity + item.quantity;
            if (newQuantity > product.stock) {
              outOfStockItems.push(`${item.name} (Vượt quá số lượng tồn kho)`);
              continue;
            }
            existingItem.quantity = newQuantity;
          } else {
            cart.push({
              id: productId,
              name: item.name,
              price: product.price || item.price,
              image: item.image || product.images?.[0],
              quantity: item.quantity,
              size: item.size,
              color: item.color
            });
          }
          
          addedCount++;
        } catch (error) {
          console.error(`Error adding item ${item.name}:`, error);
          notFoundItems.push(item.name);
        }
      }
      
      // Save cart
      if (addedCount > 0) {
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Dispatch cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      }
      
      // Show appropriate message
      if (addedCount > 0) {
        let message = `✅ Đã thêm ${addedCount} sản phẩm vào giỏ hàng!`;
        
        if (outOfStockItems.length > 0) {
          message += `\n\n⚠️ Sản phẩm hết hàng hoặc không đủ số lượng:\n• ${outOfStockItems.join('\n• ')}`;
        }
        
        if (notFoundItems.length > 0) {
          message += `\n\n❌ Sản phẩm không còn bán:\n• ${notFoundItems.join('\n• ')}`;
        }
        
        alert(message);
        
        // Redirect to cart
        window.location.href = '/cart';
      } else {
        let message = '❌ Không thể thêm sản phẩm vào giỏ hàng.\n\n';
        
        if (outOfStockItems.length > 0) {
          message += `Sản phẩm hết hàng:\n• ${outOfStockItems.join('\n• ')}\n\n`;
        }
        
        if (notFoundItems.length > 0) {
          message += `Sản phẩm không còn bán:\n• ${notFoundItems.join('\n• ')}`;
        }
        
        alert(message);
      }
    } catch (error) {
      console.error('Error reordering:', error);
      alert('❌ Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <FiCheckCircle />;
      case 'shipping': return <FiTruck />;
      case 'cancelled': return <FiXCircle />;
      default: return <FiPackage />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipping': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipping: 'Đang giao',
      delivered: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return map[status] || status;
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Đang tải đơn hàng...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Đơn hàng của tôi</Title>
        <FilterTabs>
          <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>
            Tất cả ({orders.length})
          </FilterTab>
          <FilterTab active={filter === 'pending'} onClick={() => setFilter('pending')}>
            Chờ xử lý
          </FilterTab>
          <FilterTab active={filter === 'shipping'} onClick={() => setFilter('shipping')}>
            Đang giao
          </FilterTab>
          <FilterTab active={filter === 'delivered'} onClick={() => setFilter('delivered')}>
            Hoàn thành
          </FilterTab>
          <FilterTab active={filter === 'cancelled'} onClick={() => setFilter('cancelled')}>
            Đã hủy
          </FilterTab>
        </FilterTabs>
      </Header>

      {orders.length === 0 ? (
        <EmptyState>
          <EmptyIcon><FiPackage /></EmptyIcon>
          <EmptyTitle>Chưa có đơn hàng nào</EmptyTitle>
          <EmptyText>Bạn chưa có đơn hàng nào. Hãy khám phá và mua sắm ngay!</EmptyText>
          <ShopButton onClick={() => window.location.href = '/products'}>
            Mua sắm ngay
          </ShopButton>
        </EmptyState>
      ) : (
        <OrdersList>
          {orders.map((order, index) => (
            <OrderCard
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <OrderHeader>
                <OrderInfo>
                  <OrderNumber>Đơn hàng #{order.orderNumber}</OrderNumber>
                  <OrderDate>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </OrderDate>
                </OrderInfo>
                <StatusBadge color={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusText(order.status)}</span>
                </StatusBadge>
              </OrderHeader>

              <OrderBody>
                <ProductsList>
                  {order.items?.slice(0, 2).map((item: any, idx: number) => (
                    <ProductItem key={idx}>
                      <ProductImage
                        src={item.image?.url || item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80';
                        }}
                      />
                      <ProductDetails>
                        <ProductName>{item.name}</ProductName>
                        <ProductMeta>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>Màu: {item.color}</span>}
                          <span>x{item.quantity}</span>
                        </ProductMeta>
                      </ProductDetails>
                      <ProductPrice>
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </ProductPrice>
                    </ProductItem>
                  ))}
                  {order.items?.length > 2 && (
                    <MoreProducts>
                      +{order.items.length - 2} sản phẩm khác
                    </MoreProducts>
                  )}
                </ProductsList>
              </OrderBody>

              <OrderFooter>
                <TotalAmount>
                  <span>Tổng tiền:</span>
                  <Amount>{order.total?.toLocaleString('vi-VN')}₫</Amount>
                </TotalAmount>
                <Actions>
                  <ActionButton primary onClick={() => handleViewDetails(order)}>
                    <FiEye /> Xem chi tiết
                  </ActionButton>
                  {order.status === 'delivered' && (
                    <ActionButton onClick={() => handleReorder(order)}>
                      <FiShoppingCart /> Mua lại
                    </ActionButton>
                  )}
                  {order.status === 'pending' && (
                    <ActionButton danger>
                      <FiXCircle /> Hủy đơn
                    </ActionButton>
                  )}
                </Actions>
              </OrderFooter>
            </OrderCard>
          ))}
        </OrdersList>
      )}

      <OrderDetailModal
        order={selectedOrder}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        isAdmin={false}
        onCancelOrder={handleCancelOrder}
      />
    </Container>
  );
};

const Container = styled.div``;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterTab = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
    background: ${props => props.active ? '#5568d3' : '#f5f5f5'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #666;
  margin-bottom: 2rem;
`;

const ShopButton = styled.button`
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled(motion.div)`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
`;

const OrderInfo = styled.div``;

const OrderNumber = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 0.25rem;
`;

const OrderDate = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const StatusBadge = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.color}20;
  color: ${props => props.color};
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;

  svg {
    font-size: 1rem;
  }
`;

const OrderBody = styled.div`
  padding: 1.25rem;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
`;

const ProductMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #999;

  span {
    &:not(:last-child)::after {
      content: '•';
      margin-left: 1rem;
    }
  }
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: #667eea;
  font-size: 0.95rem;
`;

const MoreProducts = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
  font-size: 0.85rem;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TotalAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
`;

const Amount = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ primary?: boolean; danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.primary ? '#667eea' : props.danger ? '#ef4444' : '#e0e0e0'};
  background: ${props => props.primary ? '#667eea' : 'white'};
  color: ${props => props.primary ? 'white' : props.danger ? '#ef4444' : '#666'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.primary ? '#5568d3' : props.danger ? '#fee' : '#f5f5f5'};
    transform: translateY(-1px);
  }

  svg {
    font-size: 1rem;
  }
`;

export default OrdersTab;
