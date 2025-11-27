import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser, FiPackage, FiStar, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  date: string;
  items: any[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
  orders?: Order[];
  suggestions?: string[];
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickResponses, setQuickResponses] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Load quick responses
    fetch('/api/chatbot/quick-responses')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuickResponses(data.responses);
        }
      })
      .catch(console.error);

    // Welcome message
    if (messages.length === 0) {
      const userName = user ? `${user.firstName} ${user.lastName}` : '';
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Chào${userName ? ` ${userName}` : ' bạn yêu'}! 💖\n\nEm là **Linh** - tư vấn viên thời trang của Fashion Store đây ạ! 🌟\nEm rất vui được tư vấn cho bạn hôm nay! ✨\n\n🎊 **KHUYẾN MÃI HOT HÔM NAY:**\n🔥 Giảm 50% toàn bộ BST Thu Đông\n🔥 Mua 2 tặng 1 - Áo thun basic\n🔥 Freeship đơn từ 500k\n🔥 Tặng voucher 100k cho đơn đầu tiên\n\n💁‍♀️ **Em có thể giúp bạn:**\n\n🛍️ **Tư vấn sản phẩm** - Bạn cứ nói em sẽ tìm món đẹp nhất!\n   • Áo sơ mi công sở sang chảnh\n   • Váy đầm dự tiệc lộng lẫy\n   • Quần jeans trendy\n   • Giày dép thời thượng\n\n👗 **Tư vấn phối đồ** - Mix sao cho đẹp & hợp dịp\n📏 **Tư vấn size** - Đảm bảo vừa vặn 100%\n💝 **Khuyến mãi & Deals** - Săn sale cực đã\n📦 **Tra đơn hàng** - Check nhanh trong 1 nốt nhạc\n\n💬 Bạn đang tìm món gì? Hoặc cần tư vấn phong cách nào?\nCứ nói thoải mái, em sẽ tư vấn tận tình cho bạn! 😊`,
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const chatMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          messages: chatMessages,
          includeContext: true
        })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          products: data.products,
          orders: data.orders,
          suggestions: data.suggestions
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, tôi gặp sự cố khi xử lý tin nhắn. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResponse = (question: string) => {
    sendMessage(question);
  };

  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'view_product':
        if (data?.productId) {
          router.push(`/products/${data.productId}`);
          setIsOpen(false);
        }
        break;
      case 'view_order':
        router.push('/profile?tab=orders');
        setIsOpen(false);
        break;
      case 'add_to_cart':
        if (data?.productId) {
          // Add to cart logic here
          sendMessage(`Thêm sản phẩm ${data.productId} vào giỏ hàng`);
        }
        break;
      case 'search':
        if (data?.query) {
          router.push(`/search?q=${encodeURIComponent(data.query)}`);
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };



  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setIsOpen(false);
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/profile?tab=orders`);
    setIsOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': '#f59e0b',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444'
    };
    return statusMap[status.toLowerCase()] || '#6b7280';
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ChatHeader>
              <HeaderInfo>
                <Avatar>🤖</Avatar>
                <div>
                  <HeaderTitle>Linh - Tư vấn viên</HeaderTitle>
                  <HeaderStatus>● Đang online</HeaderStatus>
                </div>
              </HeaderInfo>
              <CloseButton onClick={() => setIsOpen(false)}>
                <FiX />
              </CloseButton>
            </ChatHeader>

            <MessagesContainer>
              {messages.map((message) => (
                <MessageWrapper key={message.id}>
                  <MessageBubble isUser={message.role === 'user'}>
                    {message.role === 'assistant' && <BotIcon>🤖</BotIcon>}
                    <BubbleContent isUser={message.role === 'user'}>
                      {message.content}
                    </BubbleContent>
                    {message.role === 'user' && <UserIcon><FiUser /></UserIcon>}
                  </MessageBubble>

                  {/* Product Cards */}
                  {message.products && message.products.length > 0 && (
                    <ProductsGrid>
                      {message.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <ProductImage>
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#f3f4f6;color:#9ca3af;font-size:2rem;">📦</div>';
                                  }
                                }}
                              />
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: '#f3f4f6', color: '#9ca3af', fontSize: '2rem' }}>
                                📦
                              </div>
                            )}
                          </ProductImage>
                          <ProductInfo>
                            <ProductName>{product.name}</ProductName>
                            {product.category && (
                              <ProductCategory>{product.category}</ProductCategory>
                            )}
                            <ProductFooter>
                              <ProductPrice>{formatPrice(product.price)}</ProductPrice>
                              {product.rating && (
                                <ProductRating>
                                  <FiStar size={12} fill="#fbbf24" color="#fbbf24" />
                                  {product.rating.toFixed(1)}
                                </ProductRating>
                              )}
                            </ProductFooter>
                          </ProductInfo>
                        </ProductCard>
                      ))}
                    </ProductsGrid>
                  )}

                  {/* Order Cards */}
                  {message.orders && message.orders.length > 0 && (
                    <OrdersContainer>
                      {message.orders.map((order) => (
                        <OrderCard
                          key={order.id}
                          onClick={() => handleOrderClick(order.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <OrderHeader>
                            <OrderNumber>
                              <FiPackage size={16} />
                              #{order.orderNumber}
                            </OrderNumber>
                            <OrderStatus color={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </OrderStatus>
                          </OrderHeader>
                          <OrderDetails>
                            <OrderDate>{new Date(order.date).toLocaleDateString('vi-VN')}</OrderDate>
                            <OrderTotal>{formatPrice(order.total)}</OrderTotal>
                          </OrderDetails>
                          {order.items && order.items.length > 0 && (
                            <OrderItems>
                              {order.items.slice(0, 2).map((item, idx) => (
                                <OrderItem key={idx}>• {item.name}</OrderItem>
                              ))}
                              {order.items.length > 2 && (
                                <OrderItem>+{order.items.length - 2} sản phẩm khác</OrderItem>
                              )}
                            </OrderItems>
                          )}
                        </OrderCard>
                      ))}
                    </OrdersContainer>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <SuggestionsContainer>
                      {message.suggestions.map((suggestion, idx) => (
                        <SuggestionButton
                          key={idx}
                          onClick={() => sendMessage(suggestion)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {suggestion}
                        </SuggestionButton>
                      ))}
                    </SuggestionsContainer>
                  )}
                </MessageWrapper>
              ))}

              {isLoading && (
                <MessageBubble isUser={false}>
                  <BotIcon>🤖</BotIcon>
                  <BubbleContent isUser={false}>
                    <TypingIndicator>
                      <span></span>
                      <span></span>
                      <span></span>
                    </TypingIndicator>
                  </BubbleContent>
                </MessageBubble>
              )}

              {messages.length === 1 && quickResponses.length > 0 && (
                <QuickResponsesContainer>
                  <QuickTitle>Câu hỏi thường gặp:</QuickTitle>
                  {quickResponses.map((qr, index) => (
                    <QuickButton
                      key={index}
                      onClick={() => handleQuickResponse(qr.question)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {qr.question}
                    </QuickButton>
                  ))}
                </QuickResponsesContainer>
              )}

              <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputContainer>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
              />
              <SendButton
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiSend />
              </SendButton>
            </InputContainer>
          </ChatWindow>
        )}
      </AnimatePresence>

      <ChatButton
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 0 } : { rotate: 0 }}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
        {!isOpen && <Badge>AI</Badge>}
      </ChatButton>
    </>
  );
}

const ChatButton = styled(motion.button)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  border: 2px solid white;
`;

const ChatWindow = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 24px;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  z-index: 999;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100vw - 32px);
    height: calc(100vh - 140px);
    right: 16px;
    bottom: 90px;
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const HeaderTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
`;

const HeaderStatus = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const BotIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const UserIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MessageContent = styled.div<{ isUser: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: ${props => props.isUser ? '70%' : '85%'};
`;

const BubbleContent = styled.div<{ isUser: boolean }>`
  background: ${props => props.isUser ? '#667eea' : 'white'};
  color: ${props => props.isUser ? 'white' : '#1f2937'};
  padding: 0.75rem 1rem;
  border-radius: 16px;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 0.25rem 0;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    animation: typing 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-10px);
    }
  }
`;

// Product Cards Styles
const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-left: 2.5rem;
`;

const ProductCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  background: #f3f4f6;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ProductInfo = styled.div`
  padding: 0.75rem;
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProductCategory = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const ProductFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductPrice = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #667eea;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
`;

// Order Cards Styles
const OrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-left: 2.5rem;
`;

const OrderCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const OrderNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const OrderStatus = styled.span<{ color: string }>`
  background: ${props => props.color}20;
  color: ${props => props.color};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const OrderDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const OrderDate = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const OrderTotal = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
`;

const OrderItem = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

// Suggestions Styles
const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-left: 2.5rem;
`;

const SuggestionButton = styled(motion.button)`
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.5rem 0.75rem;
  border-radius: 16px;
  font-size: 0.75rem;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const QuickResponsesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const QuickTitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const QuickButton = styled(motion.button)`
  background: white;
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: #1f2937;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: #f3f4f6;
  }
`;

const InputContainer = styled.div`
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  outline: none;
  font-size: 0.875rem;

  &:focus {
    border-color: #667eea;
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const SendButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #5568d3;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;
