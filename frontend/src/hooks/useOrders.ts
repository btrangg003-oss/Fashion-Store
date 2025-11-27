import { useState, useEffect } from 'react'
import { Order } from '../models/orders'

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/orders', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.data)
      } else {
        setError(data.message || 'Failed to fetch orders')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders
  }
}