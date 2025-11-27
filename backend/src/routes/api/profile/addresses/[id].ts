import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import {
  getAddressById,
  updateAddress,
  deleteAddress,
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

    // PUT - Update address
    if (req.method === 'PUT') {
      const updates: Partial<AddressInput> = req.body

      // Validate if there are location updates
      if (updates.street || updates.province || updates.district || updates.ward) {
        const errors = validateAddressInput({ ...address, ...updates })
        if (errors.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors
          })
        }
      }

      const updated = await updateAddress(id, updates)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật địa chỉ thành công',
        address: updated
      })
    }

    // DELETE - Delete address
    if (req.method === 'DELETE') {
      await deleteAddress(id)

      return res.status(200).json({
        success: true,
        message: 'Xóa địa chỉ thành công'
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
