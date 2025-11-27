import { NextApiRequest, NextApiResponse } from 'next'
import { createOrder, generateOrderNumber, generateOrderId } from '../../../lib/ordersDatabase'
import { verifyToken } from '../../../lib/auth'
import { findUserById } from '../../../lib/database'
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '../../../lib/emailService'
import { Order, OrderItem, ShippingAddress } from '../../../types/orders'

interface CreateOrderRequest {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    console.log('Processing order request...');
    
    // Get token from cookie or header
    const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '')
    console.log('Auth token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided'
      })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid token'
      })
    }

    const { items, shippingAddress, paymentMethod, notes }: CreateOrderRequest = req.body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required'
      })
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      })
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      })
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = subtotal > 500000 ? 0 : 30000 // Free shipping over 500k VND
    const tax = 0 // No tax for now
    const total = subtotal + shipping + tax

    // Create order object
    const newOrder: Order = {
      id: generateOrderId(),
      userId: payload.userId,
      orderNumber: generateOrderNumber(),
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      subtotal,
      shipping,
      tax,
      total,
      status: 'processing', // Start with processing status
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      shippingAddress,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save order to database
    const createdOrder = await createOrder(newOrder)

    console.log(`Order created successfully: ${createdOrder.orderNumber} for user ${payload.userId}`)

    // Send order confirmation email to user and notify admin
    try {
      const user = await findUserById(payload.userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Send order confirmation email directly to customer
      const customerEmailResult = await sendOrderConfirmationEmail(
        user.email,
        user.firstName,
        {
          orderNumber: createdOrder.orderNumber,
          total: createdOrder.total,
          items: createdOrder.items.map((item: unknown) => ({ name: (item as any).name, quantity: (item as any).quantity, price: (item as any).price }))
        }
      )
      console.log('Customer confirmation email sent:', customerEmailResult)

      // Send notification email to admin
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail) {
        const adminEmailResult = await sendAdminNewOrderEmail(
          adminEmail,
          {
            orderNumber: createdOrder.orderNumber,
            total: createdOrder.total,
            userEmail: user.email
          }
        )
        console.log('Admin notification email sent:', adminEmailResult)
      }
    } catch (e) {
      console.error('Failed to queue order emails:', e)
      // Log detailed error for debugging
      if (e instanceof Error) {
        console.error('Error details:', {
          message: e.message,
          stack: e.stack,
          name: e.name
        })
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: createdOrder
      }
    })

  } catch (error) {
    console.error('Create order error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}