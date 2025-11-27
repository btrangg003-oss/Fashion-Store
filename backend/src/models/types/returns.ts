export interface Return {
  id: string
  returnNumber: string
  userId: string
  orderId: string
  orderNumber: string
  
  // Items
  items: ReturnItem[]
  
  // Reason
  reason: 'wrong_size' | 'defective' | 'not_as_described' | 'changed_mind' | 'other'
  reasonText: string
  description: string
  
  // Photos
  photos: string[]
  
  // Refund
  refundAmount: number
  refundMethod: 'wallet' | 'bank_transfer'
  refundStatus: 'pending' | 'processing' | 'completed'
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  
  // Admin response
  adminNote?: string
  rejectionReason?: string
  processedBy?: string
  processedAt?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  approvedAt?: string
  completedAt?: string
  cancelledAt?: string
}

export interface ReturnItem {
  productId: string
  productName: string
  image: string
  size?: string
  color?: string
  quantity: number
  price: number
  reason: string
}

export interface ReturnInput {
  orderId: string
  items: {
    productId: string
    productName: string
    image: string
    size?: string
    color?: string
    quantity: number
    price: number
    reason: string
  }[]
  reason: 'wrong_size' | 'defective' | 'not_as_described' | 'changed_mind' | 'other'
  reasonText: string
  description: string
  photos: string[]
  refundMethod: 'wallet' | 'bank_transfer'
}

export interface ReturnReason {
  value: string
  label: string
  icon: string
}

export const RETURN_REASONS: ReturnReason[] = [
  { value: 'wrong_size', label: 'Sai size/màu sắc', icon: '🔄' },
  { value: 'defective', label: 'Sản phẩm lỗi/hư hỏng', icon: '🔧' },
  { value: 'not_as_described', label: 'Không giống mô tả', icon: '📦' },
  { value: 'changed_mind', label: 'Đổi ý', icon: '💭' },
  { value: 'other', label: 'Lý do khác', icon: '❓' }
]

export const RETURN_STATUSES = {
  pending: { label: 'Chờ duyệt', color: '#f59e0b', icon: '⏳' },
  approved: { label: 'Đã duyệt', color: '#10b981', icon: '✅' },
  rejected: { label: 'Từ chối', color: '#ef4444', icon: '❌' },
  completed: { label: 'Hoàn thành', color: '#10b981', icon: '🎉' },
  cancelled: { label: 'Đã hủy', color: '#6b7280', icon: '🚫' }
}

export interface ReturnPolicy {
  timeLimit: number // days
  conditions: string[]
  excludedCategories: string[]
  refundMethods: string[]
}

export const DEFAULT_RETURN_POLICY: ReturnPolicy = {
  timeLimit: 7,
  conditions: [
    'Sản phẩm chưa qua sử dụng',
    'Còn nguyên tem mác, bao bì',
    'Có hóa đơn mua hàng',
    'Trong thời gian quy định'
  ],
  excludedCategories: [
    'Đồ lót, đồ bơi',
    'Mỹ phẩm, nước hoa',
    'Sản phẩm sale > 50%',
    'Phụ kiện cá nhân'
  ],
  refundMethods: [
    'Hoàn vào ví: Ngay lập tức',
    'Chuyển khoản: 3-5 ngày làm việc'
  ]
}
