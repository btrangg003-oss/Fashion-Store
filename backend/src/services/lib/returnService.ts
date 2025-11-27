import fs from 'fs/promises'
import path from 'path'
import { Return, ReturnInput } from '../models/returns'
import { getOrderById } from './ordersDatabase'

const RETURNS_PATH = process.env.RETURNS_PATH || './data/returns.json'

interface ReturnsData {
  returns: Return[]
}

// Initialize database
const initializeDatabase = async (): Promise<void> => {
  try {
    await fs.access(RETURNS_PATH)
  } catch {
    const initialData: ReturnsData = { returns: [] }
    const dir = path.dirname(RETURNS_PATH)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(RETURNS_PATH, JSON.stringify(initialData, null, 2))
  }
}

// Read database
const readDatabase = async (): Promise<ReturnsData> => {
  await initializeDatabase()
  try {
    const data = await fs.readFile(RETURNS_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading returns:', error)
    return { returns: [] }
  }
}

// Export readDatabase for external use
export { readDatabase }

// Write database
const writeDatabase = async (data: ReturnsData): Promise<void> => {
  try {
    await fs.writeFile(RETURNS_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing returns:', error)
    throw new Error('Failed to save returns')
  }
}

// Generate return number
const generateReturnNumber = (): string => {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `RT${timestamp}${random}`
}

// Generate return ID
const generateReturnId = (): string => {
  return `return_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Check if order is eligible for return
export const checkReturnEligibility = async (orderId: string): Promise<{
  eligible: boolean
  reason?: string
}> => {
  const order = await getOrderById(orderId)
  
  if (!order) {
    return { eligible: false, reason: 'Đơn hàng không tồn tại' }
  }
  
  if (order.status !== 'delivered') {
    return { eligible: false, reason: 'Chỉ có thể trả hàng đã giao' }
  }
  
  // Check time limit (7 days)
  const deliveredDate = new Date(order.deliveredAt || order.updatedAt)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysDiff > 7) {
    return { eligible: false, reason: 'Đã quá thời hạn trả hàng (7 ngày)' }
  }
  
  return { eligible: true }
}

// Create return request
export const createReturn = async (
  userId: string,
  input: ReturnInput
): Promise<Return> => {
  const data = await readDatabase()
  
  // Check eligibility
  const eligibility = await checkReturnEligibility(input.orderId)
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason)
  }
  
  // Get order
  const order = await getOrderById(input.orderId)
  if (!order) {
    throw new Error('Đơn hàng không tồn tại')
  }
  
  if (order.userId !== userId) {
    throw new Error('Không có quyền trả hàng này')
  }
  
  // Calculate refund amount
  const refundAmount = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  const newReturn: Return = {
    id: generateReturnId(),
    returnNumber: generateReturnNumber(),
    userId,
    orderId: input.orderId,
    orderNumber: order.orderNumber,
    items: input.items,
    reason: input.reason,
    reasonText: input.reasonText,
    description: input.description,
    photos: input.photos,
    refundAmount,
    refundMethod: input.refundMethod,
    refundStatus: 'pending',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  data.returns.push(newReturn)
  await writeDatabase(data)
  
  return newReturn
}

// Get user returns
export const getUserReturns = async (userId: string, status?: string): Promise<Return[]> => {
  const data = await readDatabase()
  let returns = data.returns.filter(r => r.userId === userId)
  
  if (status) {
    returns = returns.filter(r => r.status === status)
  }
  
  // Sort by creation date (newest first)
  returns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return returns
}

// Get return by ID
export const getReturnById = async (id: string): Promise<Return | null> => {
  const data = await readDatabase()
  return data.returns.find(r => r.id === id) || null
}

// Update return
export const updateReturn = async (
  id: string,
  updates: Partial<Return>
): Promise<Return | null> => {
  const data = await readDatabase()
  const index = data.returns.findIndex(r => r.id === id)
  
  if (index === -1) {
    return null
  }
  
  data.returns[index] = {
    ...data.returns[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  await writeDatabase(data)
  return data.returns[index]
}

// Cancel return (by user)
export const cancelReturn = async (id: string, userId: string): Promise<Return | null> => {
  const returnItem = await getReturnById(id)
  
  if (!returnItem) {
    throw new Error('Yêu cầu trả hàng không tồn tại')
  }
  
  if (returnItem.userId !== userId) {
    throw new Error('Không có quyền hủy yêu cầu này')
  }
  
  if (returnItem.status !== 'pending') {
    throw new Error('Chỉ có thể hủy yêu cầu đang chờ duyệt')
  }
  
  return await updateReturn(id, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString()
  })
}

// Delete return (only for rejected/completed/cancelled)
export const deleteReturn = async (id: string): Promise<boolean> => {
  const data = await readDatabase()
  const index = data.returns.findIndex(r => r.id === id)
  
  if (index === -1) {
    throw new Error('Yêu cầu trả hàng không tồn tại')
  }
  
  const returnItem = data.returns[index]
  
  if (returnItem.status !== 'rejected' && returnItem.status !== 'completed' && returnItem.status !== 'cancelled') {
    throw new Error('Chỉ có thể xóa yêu cầu đã bị từ chối, đã hoàn thành hoặc đã hủy')
  }
  
  data.returns.splice(index, 1)
  await writeDatabase(data)
  
  return true
}

// Validate return input
export const validateReturnInput = (input: Partial<ReturnInput>): string[] => {
  const errors: string[] = []
  
  if (!input.orderId) {
    errors.push('Vui lòng chọn đơn hàng')
  }
  
  if (!input.items || input.items.length === 0) {
    errors.push('Vui lòng chọn ít nhất 1 sản phẩm')
  }
  
  if (!input.reason) {
    errors.push('Vui lòng chọn lý do trả hàng')
  }
  
  if (!input.description || input.description.trim().length < 20) {
    errors.push('Mô tả phải có ít nhất 20 ký tự')
  }
  
  if (!input.refundMethod) {
    errors.push('Vui lòng chọn phương thức hoàn tiền')
  }
  
  if (input.photos && input.photos.length > 5) {
    errors.push('Tối đa 5 ảnh')
  }
  
  return errors
}
