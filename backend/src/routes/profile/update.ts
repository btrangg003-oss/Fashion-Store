import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { updateUser } from '../services/userOperations'

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

    const { displayName, gender, dateOfBirth, phone } = req.body

    // Validate input
    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
    }

    if (dateOfBirth) {
      const date = new Date(dateOfBirth)
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: 'Ngày sinh không hợp lệ' })
      }
    }

    // Parse displayName to firstName and lastName
    let firstName = undefined;
    let lastName = undefined;
    if (displayName) {
      const nameParts = displayName.trim().split(' ');
      if (nameParts.length === 1) {
        firstName = nameParts[0];
        lastName = '';
      } else {
        firstName = nameParts.slice(0, -1).join(' ');
        lastName = nameParts[nameParts.length - 1];
      }
    }

    // Update user
    const updatedUser = await updateUser(decoded.userId, {
      displayName,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phone,
      updatedAt: new Date().toISOString()
    })

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Remove sensitive data
    const { passwordHash, ...safeUser } = updatedUser

    res.status(200).json({
      message: 'Cập nhật thông tin thành công',
      user: safeUser
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
