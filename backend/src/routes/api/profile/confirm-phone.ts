import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { updateUser } from '../services/userOperations'

// Mock OTP storage (same as verify-phone.ts)
const otpStore = new Map<string, { otp: string, expires: number }>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { phone, otp } = req.body

    // Validate input
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Thiếu thông tin' })
    }

    if (!/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ' })
    }

    // Check OTP
    const key = `${decoded.userId}_${phone}`
    const storedOtp = otpStore.get(key)

    if (!storedOtp) {
      return res.status(400).json({ message: 'Mã OTP không tồn tại hoặc đã hết hạn' })
    }

    if (Date.now() > storedOtp.expires) {
      otpStore.delete(key)
      return res.status(400).json({ message: 'Mã OTP đã hết hạn' })
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Mã OTP không đúng' })
    }

    // OTP is valid, update user
    const updatedUser = await updateUser(decoded.userId, {
      phone,
      phoneVerified: true,
      updatedAt: new Date().toISOString()
    })

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Clear OTP
    otpStore.delete(key)

    // Remove sensitive data
    const { passwordHash, ...safeUser } = updatedUser

    res.status(200).json({
      message: 'Xác minh số điện thoại thành công',
      user: safeUser
    })
  } catch (error) {
    console.error('Confirm phone error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
