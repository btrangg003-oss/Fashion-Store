import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { readOrdersDatabase, writeOrdersDatabase } from '../services/ordersDatabase'
import { WishlistItem } from '../models/orders'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    // GET - List wishlist
    if (req.method === 'GET') {
      const data = await readOrdersDatabase()
      const wishlist = data.wishlist.filter(item => item.userId === decoded.userId)

      return res.status(200).json({
        success: true,
        wishlist
      })
    }

    // POST - Add to wishlist
    if (req.method === 'POST') {
      const { productId, productName, productImage, price, originalPrice, inStock } = req.body

      if (!productId || !productName) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      const data = await readOrdersDatabase()

      // Check if already in wishlist
      const exists = data.wishlist.some(
        item => item.userId === decoded.userId && item.productId === productId
      )

      if (exists) {
        return res.status(400).json({ message: 'Sản phẩm đã có trong danh sách yêu thích' })
      }

      const newItem: WishlistItem = {
        id: `wish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: decoded.userId,
        productId,
        productName,
        productImage,
        price,
        originalPrice,
        inStock: inStock !== false,
        addedAt: new Date().toISOString()
      }

      data.wishlist.push(newItem)
      await writeOrdersDatabase(data)

      return res.status(201).json({
        success: true,
        message: 'Đã thêm vào danh sách yêu thích',
        item: newItem
      })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error: any) {
    console.error('Wishlist API error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
