import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'
import {
  createReturn,
  getUserReturns,
  validateReturnInput
} from '../../../lib/returnService'
import { ReturnInput } from '../../../types/returns'

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
