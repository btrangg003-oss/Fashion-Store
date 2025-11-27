import { Order } from '../models/orders'
import { updateOrderStatus, getOrderById } from './ordersDatabase'
import { sendOrderStatusEmail } from './emailService'

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded'

export interface OrderStatusTransition {
  from: OrderStatus
  to: OrderStatus
  allowedRoles: ('admin' | 'staff' | 'system')[]
  requiresConfirmation: boolean
  emailNotification: boolean
  description: string
}

// Define allowed status transitions
export const ORDER_STATUS_TRANSITIONS: OrderStatusTransition[] = [
  {
    from: 'pending',
    to: 'confirmed',
    allowedRoles: ['admin', 'staff', 'system'],
    requiresConfirmation: false,
    emailNotification: true,
    description: 'Xác nhận đơn hàng'
  },
  {
    from: 'pending',
    to: 'cancelled',
    allowedRoles: ['admin', 'staff'],
    requiresConfirmation: true,
    emailNotification: true,
    description: 'Hủy đơn hàng'
  },
  {
    from: 'confirmed',
    to: 'processing',
    allowedRoles: ['admin', 'staff'],
    requiresConfirmation: false,
    emailNotification: true,
    description: 'Bắt đầu xử lý đơn hàng'
  },
  {
    from: 'confirmed',
    to: 'cancelled',
    allowedRoles: ['admin', 'staff'],
    requiresConfirmation: true,
    emailNotification: true,
    description: 'Hủy đơn hàng đã xác nhận'
  },
  {
    from: 'processing',
    to: 'shipping',
    allowedRoles: ['admin', 'staff'],
    requiresConfirmation: false,
    emailNotification: true,
    description: 'Giao hàng'
  },
  {
    from: 'processing',
    to: 'cancelled',
    allowedRoles: ['admin'],
    requiresConfirmation: true,
    emailNotification: true,
    description: 'Hủy đơn hàng đang xử lý'
  },
  {
    from: 'shipping',
    to: 'delivered',
    allowedRoles: ['admin', 'staff', 'system'],
    requiresConfirmation: false,
    emailNotification: true,
    description: 'Giao hàng thành công'
  },
  {
    from: 'delivered',
    to: 'refunded',
    allowedRoles: ['admin'],
    requiresConfirmation: true,
    emailNotification: true,
    description: 'Hoàn tiền'
  }
]

// Get available transitions for current status
export const getAvailableTransitions = (
  currentStatus: OrderStatus,
  userRole: 'admin' | 'staff' | 'system'
): OrderStatusTransition[] => {
  return ORDER_STATUS_TRANSITIONS.filter(
    transition =>
      transition.from === currentStatus &&
      transition.allowedRoles.includes(userRole)
  )
}

// Validate status transition
export const canTransitionTo = (
  from: OrderStatus,
  to: OrderStatus,
  userRole: 'admin' | 'staff' | 'system'
): boolean => {
  const transition = ORDER_STATUS_TRANSITIONS.find(
    t => t.from === from && t.to === to
  )

  return transition ? transition.allowedRoles.includes(userRole) : false
}

// Process order status change
export const processOrderStatusChange = async (
  orderId: string,
  newStatus: OrderStatus,
  userId: string,
  userRole: 'admin' | 'staff' | 'system',
  notes?: string,
  trackingNumber?: string
): Promise<{ success: boolean; message: string; order?: Order }> => {
  try {
    // Get current order
    const currentOrder = await getOrderById(orderId, userId)
    if (!currentOrder) {
      return { success: false, message: 'Đơn hàng không tồn tại' }
    }

    // Check if transition is allowed
    if (!canTransitionTo(currentOrder.status as OrderStatus, newStatus, userRole)) {
      return { success: false, message: 'Không thể chuyển trạng thái này' }
    }

    // Get transition details
    const transition = ORDER_STATUS_TRANSITIONS.find(
      t => t.from === currentOrder.status && t.to === newStatus
    )

    if (!transition) {
      return { success: false, message: 'Chuyển trạng thái không hợp lệ' }
    }

    // Update order status
    const additionalData: Partial<Order> = {
      notes: notes || currentOrder.notes,
      trackingNumber: trackingNumber || currentOrder.trackingNumber
    }

    const updatedOrder = await updateOrderStatus(orderId, userId, newStatus, additionalData)

    if (!updatedOrder) {
      return { success: false, message: 'Không thể cập nhật đơn hàng' }
    }

    // Send email notification if required
    if (transition.emailNotification) {
      try {
        // Get user email from order - in real app, fetch from user database
        const userEmail = 'customer@example.com' // TODO: Get from user database
        const userName = updatedOrder.shippingAddress.fullName.split(' ')[0] || 'Customer'

        await sendOrderStatusEmail(userEmail, userName, {
          orderNumber: updatedOrder.orderNumber,
          status: getStatusDisplayName(newStatus)
        })
      } catch (emailError) {
        console.error('Failed to send status email:', emailError)
        // Don't fail the entire operation if email fails
      }
    }

    // Log status change
    await logOrderStatusChange(orderId, currentOrder.status as OrderStatus, newStatus, userId, notes)

    return {
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành "${getStatusDisplayName(newStatus)}"`,
      order: updatedOrder
    }

  } catch (error) {
    console.error('Order status change error:', error)
    return {
      success: false,
      message: 'Lỗi hệ thống khi cập nhật trạng thái'
    }
  }
}

// Get status display name in Vietnamese
export const getStatusDisplayName = (status: OrderStatus): string => {
  const statusNames: Record<OrderStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền'
  }

  return statusNames[status] || status
}

// Get status color for UI
export const getStatusColor = (status: OrderStatus): string => {
  const statusColors: Record<OrderStatus, string> = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipping: '#06b6d4',
    delivered: '#10b981',
    cancelled: '#ef4444',
    refunded: '#6b7280'
  }

  return statusColors[status] || '#6b7280'
}

// Log order status changes for audit trail
const logOrderStatusChange = async (
  orderId: string,
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  userId: string,
  notes?: string
): Promise<void> => {
  const logEntry = {
    orderId,
    fromStatus,
    toStatus,
    userId,
    notes,
    timestamp: new Date().toISOString()
  }

  // In a real app, you'd save this to a database
  console.log('Order status change log:', logEntry)
}

// Auto-transition orders based on time or conditions
export const processAutoTransitions = async (): Promise<void> => {
  try {
    // This would run as a scheduled job
    // Example: Auto-confirm orders after payment verification
    // Example: Auto-cancel orders after 24 hours without payment

    console.log('Processing auto-transitions...')

    // Implementation would go here

  } catch (error) {
    console.error('Auto-transition error:', error)
  }
}

// Bulk status update
export const bulkUpdateOrderStatus = async (
  orderIds: string[],
  newStatus: OrderStatus,
  userId: string,
  userRole: 'admin' | 'staff' | 'system',
  notes?: string
): Promise<{ success: number; failed: number; errors: string[] }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  for (const orderId of orderIds) {
    try {
      const result = await processOrderStatusChange(orderId, newStatus, userId, userRole, notes)
      if (result.success) {
        results.success++
      } else {
        results.failed++
        results.errors.push(`${orderId}: ${result.message}`)
      }
    } catch (error) {
      results.failed++
      results.errors.push(`${orderId}: Lỗi hệ thống`)
    }
  }

  return results
}

// Get order statistics by status
export const getOrderStatusStats = async (): Promise<Record<OrderStatus, number>> => {
  // This would query the database for actual counts
  // For now, return mock data
  return {
    pending: 12,
    confirmed: 8,
    processing: 15,
    shipping: 23,
    delivered: 156,
    cancelled: 7,
    refunded: 3
  }
}