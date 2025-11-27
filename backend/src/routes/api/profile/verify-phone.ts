import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'

// Mock OTP storage (in production, use Redis or database)
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

    const { phone } = req.body

    // Validate phone
    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ message: 'Số điện thoại không hợp lệ' })
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP (expires in 5 minutes)
    otpStore.set(`${decoded.userId}_${phone}`, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    })

    // In production, send SMS here
    console.log(`OTP for ${phone}: ${otp}`)

    res.status(200).json({
      message: 'OTP đã được gửi',
      // For development only - remove in production
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
