import { NextApiRequest, NextApiResponse } from 'next'

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
    // Clear the auth cookie
    res.setHeader('Set-Cookie', [
      'auth-token=; HttpOnly; Secure; SameSite=strict; Max-Age=0; Path=/'
    ])

    console.log('User logged out successfully')

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công!'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({
      success: false,
      message: 'Lỗi server. Vui lòng thử lại sau.',
      error: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : 'Unknown error') : undefined
    })
  }
}