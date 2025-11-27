import { useState } from 'react'
import { Order, ShippingAddress } from '../models/orders'

interface CreateOrderData {
  items: {
    productId: string
    name: string
    price: number
    quantity: number
    size?: string
    color?: string
    image: string
  }[]
  shippingAddress: ShippingAddress
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card'
  notes?: string
}

export const useCreateOrder = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (data.success) {
        console.log('Order created successfully:', data.data.order)
        return data.data.order
      } else {
        setError(data.message || 'Failed to create order')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Create order error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<Order | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/orders/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ orderId, status, paymentStatus })
      })

      const data = await response.json()

      if (data.success) {
        console.log('Order status updated successfully:', data.data.order)
        return data.data.order
      } else {
        setError(data.message || 'Failed to update order status')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Update order status error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createOrder,
    updateOrderStatus,
    loading,
    error
  }
}