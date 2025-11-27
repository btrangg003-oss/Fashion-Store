import { useState, useEffect } from 'react'
import { UserStats } from '../models/orders'
import { formatPriceShort } from '../utils/formatPrice'

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setError(null)

      const response = await fetch('/api/user/stats', {
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.message || 'Failed to fetch user stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getFormattedStats = () => {
    if (!stats) return null

    return {
      orders: stats.totalOrders,
      spent: formatPriceShort(stats.totalSpent),
      points: stats.totalPoints,
      wishlist: stats.totalWishlist
    }
  }

  return {
    stats,
    formattedStats: getFormattedStats(),
    loading,
    error,
    refetch: fetchStats
  }
}