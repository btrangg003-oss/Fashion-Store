import fs from 'fs/promises'
import path from 'path'
import { Order, WishlistItem, OrdersData, UserStats } from '../types/orders'

const ORDERS_DB_PATH = process.env.ORDERS_DB_PATH || './data/orders.json'

// Initialize orders database if it doesn't exist
const initializeOrdersDatabase = async (): Promise<void> => {
  try {
    await fs.access(ORDERS_DB_PATH)
  } catch {
    const initialData: OrdersData = {
      orders: [],
      wishlist: []
    }
    
    // Ensure directory exists
    const dir = path.dirname(ORDERS_DB_PATH)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(ORDERS_DB_PATH, JSON.stringify(initialData, null, 2))
  }
}

// Read orders database
export const readOrdersDatabase = async (): Promise<OrdersData> => {
  await initializeOrdersDatabase()
  
  try {
    const data = await fs.readFile(ORDERS_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading orders database:', error)
    return { orders: [], wishlist: [] }
  }
}

// Write orders database
export const writeOrdersDatabase = async (data: OrdersData): Promise<void> => {
  try {
    await fs.writeFile(ORDERS_DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing orders database:', error)
    throw new Error('Orders database write failed')
  }
}

// Read all orders (alias for compatibility)
export const readOrders = async (): Promise<Order[]> => {
  const data = await readOrdersDatabase()
  return data.orders
}

// Orders operations
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const data = await readOrdersDatabase()
  return data.orders
    .filter(order => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Alias for compatibility
export const getOrdersByUserId = getUserOrders

export const getOrderById = async (orderId: string, userId?: string): Promise<Order | null> => {
  const data = await readOrdersDatabase()
  if (userId) {
    return data.orders.find(order => order.id === orderId && order.userId === userId) || null
  }
  return data.orders.find(order => order.id === orderId) || null
}

export const createOrder = async (order: any): Promise<any> => {
  const data = await readOrdersDatabase()
  
  // Generate ID if not provided
  if (!order.id && order.orderId) {
    order.id = order.orderId;
  } else if (!order.id) {
    order.id = generateOrderId();
  }
  
  // Set timestamps
  if (!order.createdAt) {
    order.createdAt = new Date().toISOString();
  }
  order.updatedAt = new Date().toISOString();
  
  data.orders.push(order)
  await writeOrdersDatabase(data)
  return order
}

export const updateOrderStatus = async (
  orderId: string, 
  userId: string, 
  status: Order['status'],
  additionalData?: Partial<Order>
): Promise<Order | null> => {
  const data = await readOrdersDatabase()
  
  // If userId is empty, it's an admin operation - don't filter by userId
  const orderIndex = userId 
    ? data.orders.findIndex(order => order.id === orderId && order.userId === userId)
    : data.orders.findIndex(order => order.id === orderId)
  
  if (orderIndex === -1) {
    return null
  }
  
  data.orders[orderIndex] = {
    ...data.orders[orderIndex],
    status,
    updatedAt: new Date().toISOString(),
    ...additionalData
  }
  
  await writeOrdersDatabase(data)
  return data.orders[orderIndex]
}

// Wishlist operations
export const getUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  const data = await readOrdersDatabase()
  return data.wishlist
    .filter(item => item.userId === userId)
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
}

export const addToWishlist = async (wishlistItem: WishlistItem): Promise<WishlistItem> => {
  const data = await readOrdersDatabase()
  
  // Remove existing item if already in wishlist
  data.wishlist = data.wishlist.filter(
    item => !(item.userId === wishlistItem.userId && item.productId === wishlistItem.productId)
  )
  
  data.wishlist.push(wishlistItem)
  await writeOrdersDatabase(data)
  return wishlistItem
}

export const removeFromWishlist = async (userId: string, productId: string): Promise<boolean> => {
  const data = await readOrdersDatabase()
  const initialLength = data.wishlist.length
  
  data.wishlist = data.wishlist.filter(
    item => !(item.userId === userId && item.productId === productId)
  )
  
  if (data.wishlist.length < initialLength) {
    await writeOrdersDatabase(data)
    return true
  }
  
  return false
}

export const isInWishlist = async (userId: string, productId: string): Promise<boolean> => {
  const data = await readOrdersDatabase()
  return data.wishlist.some(item => item.userId === userId && item.productId === productId)
}

// User statistics
export const getUserStats = async (userId: string): Promise<UserStats> => {
  const data = await readOrdersDatabase()
  
  const userOrders = data.orders.filter(order => order.userId === userId)
  const userWishlist = data.wishlist.filter(item => item.userId === userId)
  
  const totalOrders = userOrders.length
  const totalSpent = userOrders
    .filter(order => order.status === 'delivered')
    .reduce((sum, order) => sum + order.total, 0)
  
  // Calculate points (1 point per 1000 VND spent)
  const totalPoints = Math.floor(totalSpent / 1000)
  const totalWishlist = userWishlist.length
  
  return {
    totalOrders,
    totalSpent,
    totalPoints,
    totalWishlist
  }
}

// Admin operations
export const getAllOrders = async (): Promise<Order[]> => {
  const data = await readOrdersDatabase()
  return data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  const data = await readOrdersDatabase()
  return data.orders
    .filter(order => order.status === status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Utility functions
export const generateOrderNumber = (): string => {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  
  return `FS${year}${month}${day}${random}`
}

export const generateOrderId = (): string => {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export const generateWishlistId = (): string => {
  return `wish_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

export const formatPriceShort = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}M`
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)}K`
  }
  return price.toString()
}

// Admin update order function
export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
  const data = await readOrdersDatabase()
  const orderIndex = data.orders.findIndex(order => order.id === orderId)
  
  if (orderIndex === -1) {
    return null
  }
  
  data.orders[orderIndex] = {
    ...data.orders[orderIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  await writeOrdersDatabase(data)
  return data.orders[orderIndex]
}