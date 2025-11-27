import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import {
  getUserAddresses,
  createAddress,
  validateAddressInput
} from '../../../../lib/addressService'
import { AddressInput } from '../../../../types/address'

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

    // GET - List all addresses
    if (req.method === 'GET') {
      const addresses = await getUserAddresses(decoded.userId)
      return res.status(200).json({
        success: true,
        addresses
      })
    }

    // POST - Create new address
    if (req.method === 'POST') {
      const input: AddressInput = req.body

      // Validate input
      const errors = validateAddressInput(input)
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu không hợp lệ',
          errors
        })
      }

      const address = await createAddress(decoded.userId, input)

      return res.status(201).json({
        success: true,
        message: 'Thêm địa chỉ thành công',
        address
      })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error: any) {
    console.error('Address API error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
