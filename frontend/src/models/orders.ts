export interface OrderItem {
  id?: string
  productId: string
  sku?: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  email?: string
  address: string
  city: string
  district: string
  ward: string
  postalCode?: string
}

export interface Order {
  id: string
  userId: string
  userEmail?: string
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  customerInfo?: {
    name: string
    phone: string
    email?: string
  }
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount?: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded'
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | 'momo'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: ShippingAddress
  notes?: string
  trackingNumber?: string
  
  inventoryStatus?: 'pending' | 'reserved' | 'picked' | 'packed' | 'shipped'
  outboundId?: string
  outboundNumber?: string
  reservedAt?: string
  pickedAt?: string
  packedAt?: string
  shippedAt?: string
  
  createdAt: string
  updatedAt: string
  deliveredAt?: string
  cancelledAt?: string
  cancelReason?: string
  paidAt?: string
  transactionId?: string
  paymentFailureReason?: string
  verificationNote?: string
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  name: string
  price: number
  image: string
  addedAt: string
}

export interface UserStats {
  totalOrders: number
  totalSpent: number
  totalPoints: number
  totalWishlist: number
}

export interface OrdersData {
  orders: Order[]
  wishlist: WishlistItem[]
}
