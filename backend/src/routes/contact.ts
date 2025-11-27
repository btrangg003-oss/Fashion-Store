import { NextApiRequest, NextApiResponse } from 'next'

interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'POST':
      try {
        const { name, email, phone, subject, message }: ContactForm = req.body

        // Validate required fields
        if (!name || !email || !subject || !message) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
          })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Email không hợp lệ'
          })
        }

        // Simulate sending email (in real app, you would use a service like SendGrid, Nodemailer, etc.)
        console.log('Contact form submission:', {
          name,
          email,
          phone,
          subject,
          message,
          timestamp: new Date().toISOString()
        })

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        res.status(200).json({
          success: true,
          message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.'
        })
      } catch (error) {
        console.error('Contact form error:', error)
        res.status(500).json({
          success: false,
          message: 'Có lỗi xảy ra. Vui lòng thử lại sau.'
        })
      }
      break

    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}