import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import { findUserById } from '../../../lib/database'
import { getAllOrders } from '../../../lib/ordersDatabase'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    const user = await findUserById(decoded.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get all orders for this user
    const allOrders = await getAllOrders()
    const userOrders = allOrders.filter(order => order.userId === user.id)

    // Calculate total spent
    const totalSpent = userOrders.reduce((sum, order) => {
      if (order.status !== 'cancelled') {
        return sum + (order.total || 0)
      }
      return sum
    }, 0)

    // Get wishlist count
    let wishlistCount = 0
    try {
      const wishlistPath = path.join(process.cwd(), 'data', 'wishlist.json')
      if (fs.existsSync(wishlistPath)) {
        const wishlistData = JSON.parse(fs.readFileSync(wishlistPath, 'utf-8'))
        const userWishlist = wishlistData.find((w: any) => w.userId === user.id)
        wishlistCount = userWishlist?.items?.length || 0
      }
    } catch (error) {
      console.error('Error reading wishlist:', error)
    }

    // Get pending reviews count
    let pendingReviews = 0
    try {
      const reviewsPath = path.join(process.cwd(), 'data', 'reviews.json')
      if (fs.existsSync(reviewsPath)) {
        const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'))
        
        // Count delivered orders that haven't been reviewed
        const deliveredOrders = userOrders.filter(order => order.status === 'delivered')
        const reviewedOrderIds = reviewsData
          .filter((r: any) => r.userId === user.id)
          .map((r: any) => r.orderId)
        
        pendingReviews = deliveredOrders.filter(
          order => !reviewedOrderIds.includes(order.id)
        ).length
      }
    } catch (error) {
      console.error('Error reading reviews:', error)
    }

    // Get available coupons count
    let couponsCount = 0
    try {
      const couponsPath = path.join(process.cwd(), 'data', 'coupons.json')
      if (fs.existsSync(couponsPath)) {
        const couponsData = JSON.parse(fs.readFileSync(couponsPath, 'utf-8'))
        const coupons = couponsData.coupons || couponsData || []
        
        // Count active coupons for this user
        const now = new Date()
        couponsCount = coupons.filter((c: any) => 
          c.userId === user.id && 
          c.status === 'active' &&
          (!c.expiresAt || new Date(c.expiresAt) > now)
        ).length
      }
    } catch (error) {
      console.error('Error reading coupons:', error)
    }

    // Get recent orders (last 5)
    const recentOrders = userOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(order => {
        const productName = order.items?.[0]?.name || 'Sản phẩm'
        const daysAgo = Math.floor(
          (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        )
        const dateText = daysAgo === 0 ? 'Hôm nay' : 
                        daysAgo === 1 ? 'Hôm qua' : 
                        `${daysAgo} ngày trước`

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          productName,
          date: dateText,
          status: order.status,
          canReview: order.status === 'delivered'
        }
      })

    const stats = {
      totalOrders: userOrders.length,
      loyaltyPoints: user.loyaltyPoints || 0,
      totalSpent,
      wishlistCount,
      pendingReviews,
      couponsCount
    }

    res.status(200).json({
      success: true,
      stats,
      recentOrders
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
