import { useState } from 'react'
import Image from 'next/image'
import styled from 'styled-components'
import { FiPackage, FiHeart, FiUser, FiSettings, FiClipboard, FiTruck, FiCheck, FiClock, FiX, FiEye } from 'react-icons/fi'
import { useOrders } from '../../hooks/useOrders'
import { useWishlist } from '../../hooks/useWishlist'
import { formatPrice } from '../../utils/formatPrice'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  background: white;
  min-height: 600px;
`

const Sidebar = styled.div`
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px 0;
`

const SidebarItem = styled.div<{ isActive: boolean }>`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: ${props => props.isActive ? '#ee4d2d' : '#333'};
  background: ${props => props.isActive ? '#fff5f5' : 'transparent'};
  border-right: ${props => props.isActive ? '2px solid #ee4d2d' : '2px solid transparent'};
  
  &:hover {
    background: #f5f5f5;
  }
  
  svg {
    font-size: 1.1rem;
  }
  
  span {
    font-size: 0.9rem;
  }
`

const Content = styled.div`
  flex: 1;
  padding: 20px;
`

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #666;
  
  .icon {
    width: 100px;
    height: 100px;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 2rem;
    color: #ccc;
  }
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
  }
`

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const OrderCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
`

const OrderInfo = styled.div`
  h4 {
    margin: 0 0 4px 0;
    font-size: 0.9rem;
    color: #333;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
  }
`

const OrderStatus = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => {
    switch (props.status) {
      case 'delivered':
        return 'background: #e8f5e9; color: #2e7d32;'
      case 'shipping':
        return 'background: #e3f2fd; color: #1976d2;'
      case 'processing':
        return 'background: #fff3e0; color: #f57c00;'
      case 'cancelled':
        return 'background: #ffebee; color: #d32f2f;'
      default:
        return 'background: #f5f5f5; color: #666;'
    }
  }}
`

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const OrderItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const ItemImage = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
`

const ItemInfo = styled.div`
  flex: 1;
  
  .item-name {
    font-size: 0.9rem;
    color: #333;
    margin-bottom: 4px;
    font-weight: 500;
  }
  
  .item-details {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 4px;
  }
  
  .item-price {
    font-size: 0.9rem;
    color: #ee4d2d;
    font-weight: 600;
  }
`

const OrderActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background: #ee4d2d;
    color: white;
    border: 1px solid #ee4d2d;
    
    &:hover {
      background: #d73527;
    }
  ` : `
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`

const ProfileForm = styled.div`
  max-width: 600px;
  
  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 1.2rem;
  }
  
  .subtitle {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 30px;
  }
`

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.9rem;
    color: #333;
    font-weight: 500;
  }
  
  input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: #ee4d2d;
    }
    
    &:disabled {
      background: #f5f5f5;
      color: #999;
    }
  }
`

const SaveButton = styled.button`
  background: #ee4d2d;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #d73527;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`



const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState('orders')
  const { orders, loading: ordersLoading, error: ordersError } = useOrders()
  const { wishlist, loading: wishlistLoading, error: wishlistError } = useWishlist()

  const menuItems = [
    { id: 'profile', label: 'Tài Khoản Của Tôi', icon: FiUser },
    { id: 'orders', label: 'Đơn Mua', icon: FiPackage },
    { id: 'notifications', label: 'Thông Báo', icon: FiClipboard },
    { id: 'vouchers', label: 'Kho Voucher', icon: FiHeart },
    { id: 'settings', label: 'Cài Đặt', icon: FiSettings }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FiCheck />
      case 'shipping':
        return <FiTruck />
      case 'processing':
        return <FiClock />
      case 'cancelled':
        return <FiX />
      default:
        return <FiPackage />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Đã giao'
      case 'shipping':
        return 'Đang giao'
      case 'processing':
        return 'Đang xử lý'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Chưa xác định'
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'orders':
        if (ordersLoading) {
          return (
            <EmptyState>
              <div className="icon">
                <FiPackage />
              </div>
              <h3>Đang tải đơn hàng...</h3>
            </EmptyState>
          )
        }

        if (ordersError) {
          return (
            <EmptyState>
              <div className="icon">
                <FiPackage />
              </div>
              <h3>Lỗi khi tải đơn hàng</h3>
              <p>{ordersError}</p>
            </EmptyState>
          )
        }

        if (orders.length === 0) {
          return (
            <EmptyState>
              <div className="icon">
                <FiPackage />
              </div>
              <h3>Chưa có đơn hàng</h3>
              <p>Bạn chưa có đơn hàng nào</p>
            </EmptyState>
          )
        }

        return (
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Đơn hàng của tôi ({orders.length})</h3>
            <OrdersList>
              {orders.map((order) => (
                <OrderCard key={order.id}>
                  <OrderHeader>
                    <OrderInfo>
                      <h4>Đơn hàng #{order.orderNumber}</h4>
                      <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </OrderInfo>
                    <OrderStatus status={order.status}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </OrderStatus>
                  </OrderHeader>

                  <OrderItems>
                    {order.items.map((item, index) => (
                      <OrderItem key={index}>
                        <ItemImage>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </ItemImage>
                        <ItemInfo>
                          <div className="item-name">{item.name}</div>
                          <div className="item-details">
                            {item.size && `Size: ${item.size}`} {item.size && item.color && '•'} {item.color && `Màu: ${item.color}`}
                            <br />Số lượng: {item.quantity}
                          </div>
                          <div className="item-price">{formatPrice(item.price)}</div>
                        </ItemInfo>
                      </OrderItem>
                    ))}
                  </OrderItems>

                  <div style={{
                    textAlign: 'right',
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0',
                    fontSize: '0.9rem',
                    color: '#333'
                  }}>
                    <strong>Tổng tiền: {formatPrice(order.total)}</strong>
                  </div>

                  <OrderActions>
                    <ActionButton>
                      <FiEye style={{ marginRight: '4px' }} />
                      Xem chi tiết
                    </ActionButton>
                    {order.status === 'delivered' && (
                      <>
                        <ActionButton variant="primary">Mua lại</ActionButton>
                        <ActionButton>Đánh giá</ActionButton>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <ActionButton>Hủy đơn hàng</ActionButton>
                    )}
                  </OrderActions>
                </OrderCard>
              ))}
            </OrdersList>
          </div>
        )

      case 'vouchers':
        if (wishlistLoading) {
          return (
            <EmptyState>
              <div className="icon">
                <FiHeart />
              </div>
              <h3>Đang tải voucher...</h3>
            </EmptyState>
          )
        }

        if (wishlistError) {
          return (
            <EmptyState>
              <div className="icon">
                <FiHeart />
              </div>
              <h3>Lỗi khi tải voucher</h3>
              <p>{wishlistError}</p>
            </EmptyState>
          )
        }

        if (wishlist.length === 0) {
          return (
            <EmptyState>
              <div className="icon">
                <FiHeart />
              </div>
              <h3>Chưa có voucher</h3>
              <p>Bạn chưa có voucher nào</p>
            </EmptyState>
          )
        }

        return (
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Kho voucher ({wishlist.length})</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {wishlist.map((item) => (
                <div key={item.id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  background: 'white'
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{
                      position: 'relative',
                      width: '80px',
                      height: '80px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: '#f5f5f5'
                    }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.9rem',
                        color: '#333',
                        fontWeight: '500'
                      }}>
                        {item.name}
                      </h4>
                      <div style={{
                        fontSize: '1rem',
                        color: '#ee4d2d',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        {formatPrice(item.price)}
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        marginBottom: '12px'
                      }}>
                        Đã thêm: {new Date(item.addedAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <ActionButton variant="primary" style={{ fontSize: '0.8rem' }}>
                          Thêm vào giỏ
                        </ActionButton>
                        <ActionButton style={{ fontSize: '0.8rem' }}>
                          Xóa
                        </ActionButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'profile':
        return (
          <ProfileForm>
            <h3>Hồ Sơ Của Tôi</h3>
            <p className="subtitle">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>

            <FormGroup>
              <label>Tên</label>
              <input type="text" placeholder="Nhập tên của bạn" />
            </FormGroup>

            <FormGroup>
              <label>Họ</label>
              <input type="text" placeholder="Nhập họ của bạn" />
            </FormGroup>

            <FormGroup>
              <label>Email</label>
              <input type="email" disabled placeholder="email@example.com" />
            </FormGroup>

            <FormGroup>
              <label>Số điện thoại</label>
              <input type="tel" placeholder="Nhập số điện thoại" />
            </FormGroup>

            <FormGroup>
              <label>Giới tính</label>
              <select style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}>
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label>Ngày sinh</label>
              <input type="date" />
            </FormGroup>

            <SaveButton>Lưu</SaveButton>
          </ProfileForm>
        )

      case 'notifications':
        return (
          <EmptyState>
            <div className="icon">
              <FiClipboard />
            </div>
            <h3>Chưa có thông báo</h3>
            <p>Bạn chưa có thông báo nào</p>
          </EmptyState>
        )

      case 'settings':
        return (
          <div>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Cài Đặt</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Privacy Settings */}
              <div style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '1rem' }}>
                  Quyền riêng tư
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: '0.9rem', color: '#333' }}>
                      Cho phép nhận email khuyến mãi
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span style={{ fontSize: '0.9rem', color: '#333' }}>
                      Cho phép nhận thông báo đẩy
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" />
                    <span style={{ fontSize: '0.9rem', color: '#333' }}>
                      Hiển thị thông tin công khai
                    </span>
                  </label>
                </div>
              </div>

              {/* Security Settings */}
              <div style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '1rem' }}>
                  Bảo mật
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <ActionButton style={{ alignSelf: 'flex-start' }}>
                    Đổi mật khẩu
                  </ActionButton>
                  <ActionButton style={{ alignSelf: 'flex-start' }}>
                    Thiết lập xác thực 2 bước
                  </ActionButton>
                  <ActionButton style={{ alignSelf: 'flex-start' }}>
                    Xem thiết bị đã đăng nhập
                  </ActionButton>
                </div>
              </div>

              {/* Account Actions */}
              <div style={{
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#333', fontSize: '1rem' }}>
                  Tài khoản
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <ActionButton style={{ alignSelf: 'flex-start' }}>
                    Tải xuống dữ liệu cá nhân
                  </ActionButton>
                  <ActionButton style={{
                    alignSelf: 'flex-start',
                    background: '#d32f2f',
                    borderColor: '#d32f2f',
                    color: 'white'
                  }}>
                    Xóa tài khoản
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Container>
      <Sidebar>
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            isActive={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          >
            <item.icon />
            <span>{item.label}</span>
          </SidebarItem>
        ))}
      </Sidebar>

      <Content>
        {renderContent()}
      </Content>
    </Container>
  )
}

export default ProfileTabs