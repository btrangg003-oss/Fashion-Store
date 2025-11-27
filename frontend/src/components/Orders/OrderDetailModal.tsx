import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPrinter, FiDownload, FiMessageSquare, FiStar } from 'react-icons/fi';
import OrderTimeline from './OrderTimeline';
import ReviewOrderModal from './ReviewOrderModal';

interface OrderDetailModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, newStatus: string) => void;
  onAddNote?: (orderId: string, note: string) => void;
  isAdmin?: boolean;
  onCancelOrder?: (orderId: string) => void;
  onReviewOrder?: (orderId: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
  isAdmin = false,
  onCancelOrder,
  onReviewOrder
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState(order?.status || '');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    // Import print function dynamically
    import('../../lib/printInvoice').then(({ printInvoice }) => {
      printInvoice(order);
    });
  };

  const handleDownloadInvoice = () => {
    // Logic xuất hóa đơn PDF
    console.log('Downloading invoice for order:', order.id);
  };

  const handleStatusUpdate = () => {
    if (onUpdateStatus && newStatus !== order.status) {
      onUpdateStatus(order.id, newStatus);
    }
  };

  const handleReorder = async () => {
    try {
      // Get cart from localStorage
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      let addedCount = 0;
      let outOfStockItems: string[] = [];
      let notFoundItems: string[] = [];
      
      // Verify products still exist before adding to cart
      for (const item of order.items) {
        try {
          // Use productId if available, otherwise use id
          const productId = item.productId || item.id;
          
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

  const handleAddNote = () => {
    if (onAddNote && note.trim()) {
      onAddNote(order.id, note);
      setNote('');
    }
  };

  const handleAddToWishlist = async () => {
    if (addingToWishlist) return;
    
    setAddingToWishlist(true);
    
    try {
      const token = localStorage.getItem('token');
      let addedCount = 0;
      let failedItems: string[] = [];
      
      for (const item of order.items) {
        try {
          const productId = item.productId || item.id;
          
          const response = await fetch('/api/wishlist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId,
              productName: item.name,
              productImage: item.image,
              price: item.price,
              originalPrice: item.originalPrice || item.price,
              inStock: true
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            addedCount++;
          } else {
            if (data.message && data.message.includes('đã có trong')) {
              // Already in wishlist, skip
              continue;
            }
            failedItems.push(item.name);
          }
        } catch (error) {
          console.error(`Error adding ${item.name} to wishlist:`, error);
          failedItems.push(item.name);
        }
      }
      
      if (addedCount > 0) {
        let message = `✅ Đã thêm ${addedCount} sản phẩm vào danh sách yêu thích!`;
        if (failedItems.length > 0) {
          message += `\n\nMột số sản phẩm không thể thêm:\n${failedItems.join(', ')}`;
        }
        alert(message);
      } else {
        alert('Tất cả sản phẩm đã có trong danh sách yêu thích hoặc không thể thêm.');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleSubmitReview = async (orderId: string, reviews: any[]) => {
    try {
      const token = localStorage.getItem('token');
      
      for (const review of reviews) {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId,
            productId: review.productId,
            rating: review.rating,
            comment: review.comment,
            images: review.images || []
          })
        });
      }
      
      alert(`Cảm ơn bạn đã đánh giá! Bạn nhận được ${reviews.length * 50} điểm thưởng.`);
      setShowReviewModal(false);
      
      // Refresh page to update review status
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting reviews:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Header>
              <HeaderLeft>
                <Title>Chi tiết đơn hàng #{order.orderNumber}</Title>
                <StatusBadge status={order.status}>
                  {getStatusText(order.status)}
                </StatusBadge>
              </HeaderLeft>
              <HeaderActions>
                <IconButton onClick={handlePrint} title="In hóa đơn">
                  <FiPrinter />
                </IconButton>
                <IconButton onClick={handleDownloadInvoice} title="Tải hóa đơn">
                  <FiDownload />
                </IconButton>
                <CloseButton onClick={onClose}>
                  <FiX />
                </CloseButton>
              </HeaderActions>
            </Header>

            <Tabs>
              <Tab
                active={activeTab === 'details'}
                onClick={() => setActiveTab('details')}
              >
                Chi tiết
              </Tab>
              <Tab
                active={activeTab === 'timeline'}
                onClick={() => setActiveTab('timeline')}
              >
                Theo dõi
              </Tab>
              <Tab
                active={activeTab === 'notes'}
                onClick={() => setActiveTab('notes')}
              >
                Ghi chú
              </Tab>
            </Tabs>

            <Content>
              {activeTab === 'details' && (
                <DetailsTab>
                  <Section>
                    <SectionTitle>Thông tin khách hàng</SectionTitle>
                    <InfoGrid>
                      <InfoItem>
                        <InfoLabel>Họ tên:</InfoLabel>
                        <InfoValue>{order.shippingAddress?.fullName || order.customerName}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Email:</InfoLabel>
                        <InfoValue>{order.customerEmail}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Số điện thoại:</InfoLabel>
                        <InfoValue>{order.shippingAddress?.phone || order.customerPhone}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Địa chỉ:</InfoLabel>
                        <InfoValue>
                          {order.shippingAddress?.address}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
                        </InfoValue>
                      </InfoItem>
                    </InfoGrid>
                  </Section>

                  <Section>
                    <SectionTitle>Sản phẩm</SectionTitle>
                    <ProductList>
                      {order.items?.map((item: any, index: number) => (
                        <ProductItem key={index}>
                          <ProductImage src={item.image?.url || item.image} alt={item.name} />
                          <ProductInfo>
                            <ProductName>{item.name}</ProductName>
                            {item.size && <ProductMeta>Size: {item.size}</ProductMeta>}
                            {item.color && <ProductMeta>Màu: {item.color}</ProductMeta>}
                            <ProductMeta>Số lượng: {item.quantity}</ProductMeta>
                          </ProductInfo>
                          <ProductPrice>
                            {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                          </ProductPrice>
                        </ProductItem>
                      ))}
                    </ProductList>
                  </Section>

                  <Section>
                    <SectionTitle>Thanh toán</SectionTitle>
                    <PaymentInfo>
                      <PaymentRow>
                        <span>Tạm tính:</span>
                        <span>{order.subtotal?.toLocaleString('vi-VN')}₫</span>
                      </PaymentRow>
                      <PaymentRow>
                        <span>Phí vận chuyển:</span>
                        <span>{(order.shipping || order.shippingFee || 0).toLocaleString('vi-VN')}₫</span>
                      </PaymentRow>
                      <PaymentRow total>
                        <span>Tổng cộng:</span>
                        <span>{order.total?.toLocaleString('vi-VN')}₫</span>
                      </PaymentRow>
                      <PaymentRow>
                        <span>Phương thức:</span>
                        <span>{getPaymentMethodText(order.paymentMethod)}</span>
                      </PaymentRow>
                      <PaymentRow>
                        <span>Trạng thái thanh toán:</span>
                        <StatusBadge status={order.paymentStatus || 'pending'}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </StatusBadge>
                      </PaymentRow>
                    </PaymentInfo>
                  </Section>

                  {isAdmin && (
                    <Section>
                      <SectionTitle>Cập nhật trạng thái</SectionTitle>
                      <StatusUpdateForm>
                        <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang xử lý</option>
                          <option value="shipping">Đang giao hàng</option>
                          <option value="delivered">Đã giao hàng</option>
                          <option value="cancelled">Đã hủy</option>
                        </Select>
                        <UpdateButton onClick={handleStatusUpdate}>
                          Cập nhật
                        </UpdateButton>
                      </StatusUpdateForm>
                    </Section>
                  )}

                  {!isAdmin && (
                    <Section>
                      <SectionTitle>Thao tác</SectionTitle>
                      <ActionButtons>
                        {order.status === 'pending' && onCancelOrder && (
                          <ActionButton danger onClick={() => onCancelOrder(order.id)}>
                            Hủy đơn hàng
                          </ActionButton>
                        )}
                        {order.status === 'delivered' && (
                          <ActionButton primary onClick={handleAddToWishlist} disabled={addingToWishlist}>
                            {addingToWishlist ? 'Đang thêm...' : '❤️ Yêu thích'}
                          </ActionButton>
                        )}
                        {order.status === 'delivered' && (
                          <ActionButton onClick={handleReorder}>
                            Mua lại
                          </ActionButton>
                        )}
                      </ActionButtons>
                    </Section>
                  )}
                </DetailsTab>
              )}

              {activeTab === 'timeline' && (
                <TimelineTab>
                  <OrderTimeline
                    currentStatus={order.status}
                    history={order.statusHistory}
                  />
                </TimelineTab>
              )}

              {activeTab === 'notes' && (
                <NotesTab>
                  <NoteForm>
                    <NoteTextarea
                      placeholder="Thêm ghi chú nội bộ..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <NoteButton onClick={handleAddNote}>
                      <FiMessageSquare /> Thêm ghi chú
                    </NoteButton>
                  </NoteForm>

                  {order.notes && (
                    <NotesList>
                      <NoteItem>
                        <NoteHeader>
                          <NoteAuthor>Admin</NoteAuthor>
                          <NoteTime>{new Date(order.createdAt).toLocaleString('vi-VN')}</NoteTime>
                        </NoteHeader>
                        <NoteContent>{order.notes}</NoteContent>
                      </NoteItem>
                    </NotesList>
                  )}
                </NotesTab>
              )}
            </Content>
          </Modal>
          
          <ReviewOrderModal
            order={order}
            isOpen={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            onSubmit={handleSubmitReview}
          />
        </>
      )}
    </AnimatePresence>
  );
};

function getStatusText(status: string) {
  const map: any = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };
  return map[status] || status;
}

function getPaymentMethodText(method: string) {
  const map: any = {
    cod: 'Thanh toán khi nhận hàng',
    banking: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    atm: 'Thẻ ATM',
    credit: 'Thẻ tín dụng'
  };
  return map[method] || method;
}

function getPaymentStatusText(status: string) {
  const map: any = {
    pending: 'Chờ thanh toán',
    processing: 'Đang xử lý',
    completed: 'Đã thanh toán',
    failed: 'Thất bại'
  };
  return map[status] || status;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Modal = styled(motion.div)`
  position: fixed !important;
  top: 5vh !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 95%;
    max-height: 95vh;
    top: 2.5vh !important;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const CloseButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 0, 0, 0.3);
  }
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 1rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#667eea' : '#666'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.active ? '#667eea' : 'transparent'};
  transition: all 0.3s;

  &:hover {
    background: white;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const DetailsTab = styled.div``;
const TimelineTab = styled.div``;
const NotesTab = styled.div``;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
`;

const ProductImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ProductMeta = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: #667eea;
  font-size: 1.1rem;
`;

const PaymentInfo = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
`;

const PaymentRow = styled.div<{ total?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: ${props => props.total ? '1.1rem' : '0.95rem'};
  font-weight: ${props => props.total ? '700' : '500'};
  color: ${props => props.total ? '#333' : '#666'};

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'delivered': case 'completed': return '#10b98120';
      case 'shipping': return '#3b82f620';
      case 'processing': return '#f59e0b20';
      case 'pending': return '#6b728020';
      case 'cancelled': case 'failed': return '#ef444420';
      default: return '#e5e7eb';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'delivered': case 'completed': return '#10b981';
      case 'shipping': return '#3b82f6';
      case 'processing': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'cancelled': case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const StatusUpdateForm = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const UpdateButton = styled.button`
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

const NoteForm = styled.div`
  margin-bottom: 2rem;
`;

const NoteTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const NoteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #5568d3;
  }
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NoteItem = styled.div`
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid #667eea;
`;

const NoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const NoteAuthor = styled.div`
  font-weight: 600;
  color: #333;
`;

const NoteTime = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const NoteContent = styled.div`
  color: #666;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ primary?: boolean; danger?: boolean }>`
  flex: 1;
  min-width: 150px;
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.primary ? '#667eea' : props.danger ? '#ef4444' : '#ddd'};
  background: ${props => props.primary ? '#667eea' : props.danger ? '#ef4444' : 'white'};
  color: ${props => (props.primary || props.danger) ? 'white' : '#333'};
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => 
      props.primary ? 'rgba(102, 126, 234, 0.3)' : 
      props.danger ? 'rgba(239, 68, 68, 0.3)' : 
      'rgba(0, 0, 0, 0.1)'
    };
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default OrderDetailModal;
