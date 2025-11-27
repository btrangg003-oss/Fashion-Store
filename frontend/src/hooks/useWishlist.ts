import { useState, useEffect } from 'react'
import { WishlistItem } from '../models/orders'

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/wishlist', {
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setWishlist(data.data)
      } else {
        setError(data.message || 'Failed to fetch wishlist')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (productId: string, name: string, price: number, image: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, name, price, image })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchWishlist() // Refresh wishlist
        return true
      } else {
        setError(data.message || 'Failed to add to wishlist')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchWishlist() // Refresh wishlist
        return true
      } else {
        setError(data.message || 'Failed to remove from wishlist')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return false
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    refetch: fetchWishlist
  }
}