import { ObjectId } from 'mongodb'

export interface OrderItem {
  productId: string
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
  address: string
  city: string
  district: string
  ward: string
  postalCode?: string
}

export interface MongoOrder {
  _id?: ObjectId
  id: string
  userId: string
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded'
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card' | 'momo'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: ShippingAddress
  notes?: string
  trackingNumber?: string
  createdAt: Date
  updatedAt: Date
  deliveredAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  paidAt?: Date
  transactionId?: string
  paymentFailureReason?: string
  verificationNote?: string
}

export interface WishlistItem {
  _id?: ObjectId
  id: string
  userId: string
  productId: string
  name: string
  price: number
  image: string
  addedAt: Date
}