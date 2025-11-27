import { NextApiRequest, NextApiResponse } from 'next'
import * as nodemailer from 'nodemailer'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Debug endpoints not available in production'
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { testEmail } = req.body

    // Check environment variables
    const emailConfig = {
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '***configured***' : 'NOT_SET'
    }

    console.log('📧 Email Configuration Check:', emailConfig)

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env.local',
        config: emailConfig
      })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true, // Enable debug logs
      logger: true
    })

    // Test connection
    console.log('🔍 Testing email connection...')
    await transporter.verify()
    console.log('✅ Email connection verified!')

    // Send test email if requested
    if (testEmail) {
      console.log(`📤 Sending test email to: ${testEmail}`)
      
      const mailOptions = {
        from: {
          name: 'Fashion Store Debug',
          address: process.env.EMAIL_USER
        },
        to: testEmail,
        subject: '🧪 Fashion Store Email Debug Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea; text-align: center;">🎉 Email Service Working!</h2>
            <p>Your Fashion Store email service is configured correctly and working.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>📊 Configuration Details:</h3>
              <ul>
                <li><strong>Service:</strong> ${process.env.EMAIL_SERVICE}</li>
                <li><strong>Host:</strong> ${process.env.EMAIL_HOST}</li>
                <li><strong>Port:</strong> ${process.env.EMAIL_PORT}</li>
                <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2d5a2d;">
                ✅ <strong>Success!</strong> Your email verification system is ready to use.
              </p>
            </div>
            
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 0.9rem; text-align: center;">
              Fashion Store Authentication System<br>
              Email Debug Test - ${new Date().toISOString()}
            </p>
          </div>
        `,
        text: `
Fashion Store Email Debug Test

Your email service is working correctly!

Configuration:
- Service: ${process.env.EMAIL_SERVICE}
- Host: ${process.env.EMAIL_HOST}
- Port: ${process.env.EMAIL_PORT}
- From: ${process.env.EMAIL_USER}
- Timestamp: ${new Date().toLocaleString()}

This is a debug test email sent at ${new Date().toISOString()}
        `
      }

      const info = await transporter.sendMail(mailOptions)
      console.log('✅ Test email sent successfully!')
      console.log('📧 Message ID:', info.messageId)

      return res.status(200).json({
        success: true,
        message: 'Email test successful!',
        data: {
          messageId: info.messageId,
          config: emailConfig,
          testEmail,
          timestamp: new Date().toISOString()
        }
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Email configuration verified successfully!',
      data: {
        config: emailConfig,
        verified: true,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Email test failed:', error)
    
    let errorMessage = 'Email test failed'
    const suggestions = []

    if (error instanceof Error) {
      errorMessage = error.message
      
      if (error.message.includes('Invalid login')) {
        suggestions.push('Use Gmail App Password instead of regular password')
        suggestions.push('Enable 2-Factor Authentication on Gmail')
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        suggestions.push('Check your internet connection')
        suggestions.push('Verify SMTP host and port settings')
      }
      
      if (error.message.includes('authentication')) {
        suggestions.push('Double-check EMAIL_USER and EMAIL_PASS in .env.local')
        suggestions.push('Make sure EMAIL_PASS is the App Password, not regular password')
      }
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      suggestions,
      config: {
        service: process.env.EMAIL_SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? 'SET' : 'NOT_SET'
      },
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}