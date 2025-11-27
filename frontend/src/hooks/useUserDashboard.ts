import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface DashboardStats {
  totalOrders: number
  loyaltyPoints: number
  totalSpent: number
  wishlistCount: number
  pendingReviews: number
  couponsCount: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  productName: string
  date: string
  status: string
  canReview: boolean
}

export const useUserDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    loyaltyPoints: 0,
    totalSpent: 0,
    wishlistCount: 0,
    pendingReviews: 0,
    couponsCount: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user stats
      const statsResponse = await fetch('/api/profile/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
        setRecentOrders(statsData.recentOrders || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatPoints = (points: number) => {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`
    } else if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`
    }
    return points.toString()
  }

  return {
    stats,
    recentOrders,
    loading,
    formatCurrency,
    formatPoints,
    refresh: fetchDashboardData
  }
}
