import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../../lib/auth'
import { getAddressById, setDefaultAddress } from '../../../../../lib/addressService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { id } = req.query

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid address ID' })
    }

    // Check if address exists and belongs to user
    const address = await getAddressById(id)
    if (!address) {
      return res.status(404).json({ message: 'Địa chỉ không tồn tại' })
    }

    if (address.userId !== decoded.userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' })
    }

    // Set as default
    const success = await setDefaultAddress(decoded.userId, id)

    if (!success) {
      return res.status(500).json({ message: 'Không thể đặt địa chỉ mặc định' })
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đặt làm địa chỉ mặc định'
    })
  } catch (error: any) {
    console.error('Set default address error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}
