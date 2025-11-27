import { NextApiRequest, NextApiResponse } from 'next'

interface NewsletterSubscription {
  email: string
}

// Simulate a simple in-memory storage (in real app, use database)
const subscribers: string[] = []

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const { email }: NewsletterSubscription = req.body

        // Validate email
        if (!email) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập email'
          })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Email không hợp lệ'
          })
        }

        // Check if already subscribed
        if (subscribers.includes(email)) {
          return res.status(400).json({
            success: false,
            message: 'Email này đã được đăng ký'
          })
        }

        // Add to subscribers
        subscribers.push(email)

        console.log('Newsletter subscription:', {
          email,
          timestamp: new Date().toISOString(),
          totalSubscribers: subscribers.length
        })

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500))

        res.status(200).json({
          success: true,
          message: 'Đăng ký thành công! Cảm ơn bạn đã quan tâm.'
        })
      } catch (error) {
        console.error('Newsletter subscription error:', error)
        res.status(500).json({
          success: false,
          message: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
        })
      }
      break

    case 'GET':
      // Get subscriber count (for admin purposes)
      res.status(200).json({
        success: true,
        data: {
          totalSubscribers: subscribers.length,
          subscribers: subscribers // In real app, don't expose emails
        }
      })
      break

    default:
      res.setHeader('Allow', ['POST', 'GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}