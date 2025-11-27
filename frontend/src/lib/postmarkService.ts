import { ServerClient } from 'postmark'

// Create a client instance
const client = new ServerClient(process.env.POSTMARK_API_KEY || '')

// Send verification email
export const sendVerificationEmail = async (to: string, verificationCode: string) => {
  try {
    const response = await client.sendEmail({
      From: process.env.EMAIL_FROM || 'noreply@fashionstore.com',
      To: to,
      Subject: 'Verify your Fashion Store account',
      TextBody: `Your verification code is: ${verificationCode}`,
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Verify Your Account</h1>
          <p>Your verification code is: <strong>${verificationCode}</strong></p>
        </div>
      `,
      MessageStream: 'outbound'
    })
    console.log('Verification email sent:', response)
    return { success: true, messageId: response.MessageID }
  } catch (error) {
    console.error('Error sending verification email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send order confirmation email
export const sendOrderConfirmationEmail = async (to: string, orderDetails: any) => {
  try {
    const response = await client.sendEmail({
      From: process.env.EMAIL_FROM || 'noreply@fashionstore.com',
      To: to,
      Subject: 'Order Confirmation - Fashion Store',
      TextBody: `Thank you for your order #${orderDetails.orderNumber}`,
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1>Thank You for Your Order!</h1>
          <p>Your order #${orderDetails.orderNumber} has been confirmed.</p>
          <h2>Order Details</h2>
          <ul>
            ${orderDetails.items.map((item: any) => `
              <li>${item.name} x ${item.quantity} - $${item.price.toFixed(2)}</li>
            `).join('')}
          </ul>
          <p><strong>Total: $${orderDetails.total.toFixed(2)}</strong></p>
        </div>
      `,
      MessageStream: 'outbound'
    })
    console.log('Order confirmation email sent:', response)
    return { success: true, messageId: response.MessageID }
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}