import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import {
  createReturn,
  getUserReturns,
  validateReturnInput
} from '../services/returnService'
import { ReturnInput } from '../models/returns'

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

    // GET - List user returns
    if (req.method === 'GET') {
      const { status } = req.query
      const returns = await getUserReturns(
        decoded.userId,
        typeof status === 'string' ? status : undefined
      )

      return res.status(200).json({
        success: true,
        returns
      })
    }

    // POST - Create return request
    if (req.method === 'POST') {
      const input: ReturnInput = req.body

      // Validate input
      const errors = validateReturnInput(input)
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors
        })
      }

      const returnRequest = await createReturn(decoded.userId, input)

      // Send email notifications
      try {
        const { sendRequestCreatedEmail, sendAdminNotificationEmail } = await import('../../../lib/requestNotifications')
        const { readDatabase } = await import('../../../lib/database')
        const { readRequests } = await import('../../../lib/requestsDatabase')
        const { readDatabase: readReturnsDB } = await import('../../../lib/returnService')
        
        // Get user info
        const database = await readDatabase()
        const user = database.users.find((u: any) => u.id === decoded.userId)
        const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng' : 'Khách hàng'
        const userEmail = user?.email || decoded.email

        // Send email to customer
        await sendRequestCreatedEmail(
          userEmail,
          userName,
          'return_exchange',
          returnRequest.id,
          {
            orderId: returnRequest.orderId,
            orderNumber: returnRequest.orderNumber,
            returnNumber: returnRequest.returnNumber,
            action: 'return',
            items: returnRequest.items,
            reason: returnRequest.reason,
            reasonText: returnRequest.reasonText,
            refundAmount: returnRequest.refundAmount
          }
        )

        // Count pending requests for admin email
        const allRequestsData = readRequests()
        const allRequests = allRequestsData.requests || []
        
        // Count returns
        const returnsData = await readReturnsDB()
        const allReturns = returnsData.returns || []
        
        const pendingCounts = {
          email: allRequests.filter((r: any) => r.type === 'email_change' && r.status === 'pending').length,
          phone: allRequests.filter((r: any) => r.type === 'phone_change' && r.status === 'pending').length,
          return: allReturns.filter((r: any) => r.status === 'pending').length
        }

        // Send email to admin
        await sendAdminNotificationEmail(
          'return_exchange',
          userName,
          userEmail,
          returnRequest.id,
          pendingCounts
        )
      } catch (emailError) {
        console.error('Error sending notification emails:', emailError)
        // Don't fail the request if email fails
      }

      return res.status(201).json({
        success: true,
        message: 'Tạo yêu cầu trả hàng thành công',
        return: returnRequest
      })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error: any) {
    console.error('Returns API error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
