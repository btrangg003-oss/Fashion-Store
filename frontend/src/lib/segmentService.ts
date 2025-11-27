// Customer Segmentation Service
export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    minSpent?: number;
    maxSpent?: number;
    minOrders?: number;
    maxOrders?: number;
    daysSinceLastOrder?: number;
    registeredDaysAgo?: number;
  };
  color: string;
  icon: string;
}

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  {
    id: 'vip',
    name: 'VIP',
    description: 'Khách hàng chi tiêu trên 10 triệu',
    criteria: { minSpent: 10000000 },
    color: '#fbbf24',
    icon: '👑'
  },
  {
    id: 'regular',
    name: 'Thường xuyên',
    description: 'Chi tiêu 1-10 triệu',
    criteria: { minSpent: 1000000, maxSpent: 10000000 },
    color: '#3b82f6',
    icon: '⭐'
  },
  {
    id: 'new',
    name: 'Mới',
    description: 'Đăng ký dưới 30 ngày',
    criteria: { registeredDaysAgo: 30 },
    color: '#10b981',
    icon: '🆕'
  },
  {
    id: 'inactive',
    name: 'Không hoạt động',
    description: 'Không mua hàng trên 90 ngày',
    criteria: { daysSinceLastOrder: 90 },
    color: '#ef4444',
    icon: '😴'
  },
  {
    id: 'potential',
    name: 'Tiềm năng',
    description: '2-5 đơn hàng, có thể trở thành VIP',
    criteria: { minOrders: 2, maxOrders: 5, minSpent: 2000000 },
    color: '#8b5cf6',
    icon: '🚀'
  }
];

export const segmentCustomers = (customers: any[]): Record<string, any[]> => {
  const segments: Record<string, any[]> = {};
  
  CUSTOMER_SEGMENTS.forEach(segment => {
    segments[segment.id] = customers.filter(customer => {
      const { criteria } = segment;
      
      // Check spent criteria
      if (criteria.minSpent && customer.totalSpent < criteria.minSpent) return false;
      if (criteria.maxSpent && customer.totalSpent > criteria.maxSpent) return false;
      
      // Check orders criteria
      if (criteria.minOrders && customer.totalOrders < criteria.minOrders) return false;
      if (criteria.maxOrders && customer.totalOrders > criteria.maxOrders) return false;
      
      // Check days since last order
      if (criteria.daysSinceLastOrder) {
        const lastOrder = customer.lastOrderDate ? new Date(customer.lastOrderDate) : null;
        if (!lastOrder) return false;
        const daysSince = Math.floor((Date.now() - lastOrder.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince < criteria.daysSinceLastOrder) return false;
      }
      
      // Check registration date
      if (criteria.registeredDaysAgo) {
        const registered = new Date(customer.createdAt);
        const daysAgo = Math.floor((Date.now() - registered.getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo > criteria.registeredDaysAgo) return false;
      }
      
      return true;
    });
  });
  
  return segments;
};

export const getSegmentStats = (segments: Record<string, any[]>) => {
  return CUSTOMER_SEGMENTS.map(segment => ({
    ...segment,
    count: segments[segment.id]?.length || 0,
    totalValue: segments[segment.id]?.reduce((sum, c) => sum + (c.totalSpent || 0), 0) || 0
  }));
};
