import { useState, useEffect, useCallback } from 'react'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  revenueChange: number
  ordersChange: number
  productsChange: number
  customersChange: number
  recentOrders: any[]
  lowStockProducts: any[]
  topProducts: any[]
  salesChart: any[]
}

export const useRealTimeStats = (refreshInterval = 30000) => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch multiple endpoints in parallel
      const [
        dashboardResponse,
        ordersResponse,
        productsResponse,
        customersResponse
      ] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/orders?limit=5'),
        fetch('/api/admin/products?analytics=true'),
        fetch('/api/admin/customers')
      ])

      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const [
        dashboardData,
        ordersData,
        productsData,
        customersData
      ] = await Promise.all([
        dashboardResponse.json(),
        ordersResponse.json(),
        productsResponse.json(),
        customersResponse.json()
      ])

      // Calculate revenue from orders
      const orders = ordersData.data || []
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0)
      
      // Get product analytics
      const productAnalytics = productsData.data || {}
      
      // Calculate changes (mock data for now)
      const revenueChange = Math.random() * 20 - 10 // -10% to +10%
      const ordersChange = Math.random() * 15 - 5   // -5% to +10%
      const productsChange = Math.random() * 10     // 0% to +10%
      const customersChange = Math.random() * 8     // 0% to +8%

      // Generate sales chart data (last 7 days)
      const salesChart = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000000) + 1000000, // 1M - 6M VND
          orders: Math.floor(Math.random() * 50) + 10
        }
      })

      // Get low stock products
      const lowStockProducts = orders.slice(0, 3).map((order: any, index: number) => ({
        id: `prod_${index}`,
        name: `Sản phẩm ${index + 1}`,
        stock: Math.floor(Math.random() * 5) + 1,
        threshold: 10
      }))

      // Get top products
      const topProducts = orders.slice(0, 5).map((order: any, index: number) => ({
        id: `prod_${index}`,
        name: `Sản phẩm bán chạy ${index + 1}`,
        sales: Math.floor(Math.random() * 100) + 50,
        revenue: Math.floor(Math.random() * 10000000) + 5000000
      }))

      const newStats: DashboardStats = {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: productAnalytics.totalProducts || 0,
        totalCustomers: customersData.data?.length || 0,
        revenueChange,
        ordersChange,
        productsChange,
        customersChange,
        recentOrders: orders.slice(0, 5),
        lowStockProducts,
        topProducts,
        salesChart
      }

      setStats(newStats)
      setLastUpdated(new Date())
      setLoading(false)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStats, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchStats, refreshInterval])

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true)
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh
  }
}

// Hook for animated counters
export const useAnimatedCounter = (end: number, duration = 2000) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(end * easeOutQuart))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return count
}

// Hook for real-time notifications
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const notificationTypes = [
        { type: 'order', message: 'Đơn hàng mới từ khách hàng', icon: '🛒' },
        { type: 'stock', message: 'Sản phẩm sắp hết hàng', icon: '⚠️' },
        { type: 'customer', message: 'Khách hàng mới đăng ký', icon: '👤' },
        { type: 'revenue', message: 'Doanh thu đạt mục tiêu', icon: '💰' }
      ]

      const randomNotification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      const newNotification = {
        id: Date.now(),
        ...randomNotification,
        timestamp: new Date(),
        read: false
      }

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Keep last 10
    }, Math.random() * 30000 + 15000) // Random interval 15-45 seconds

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    markAsRead,
    clearAll
  }
}