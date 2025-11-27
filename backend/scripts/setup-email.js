#!/usr/bin/env node

const readline = require('readline')
const fs = require('fs')
const path = require('path')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function setupEmail() {
  console.log('🔧 Fashion Store Email Configuration Setup\n')
  
  console.log('📧 Gmail Setup Instructions:')
  console.log('1. Go to your Google Account settings')
  console.log('2. Security → 2-Step Verification → App passwords')
  console.log('3. Select "Mail" and generate an app password')
  console.log('4. Use that app password (not your regular Gmail password)\n')
  
  try {
    const emailUser = await question('Enter your Gmail address: ')
    const emailPass = await question('Enter your Gmail app password: ')
    const appUrl = await question('Enter your app URL (default: http://localhost:3000): ') || 'http://localhost:3000'
    
    // Read current .env.local
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = ''
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }
    
    // Update email configuration
    const updatedEnv = envContent
      .replace(/EMAIL_USER=.*/, `EMAIL_USER=${emailUser}`)
      .replace(/EMAIL_PASS=.*/, `EMAIL_PASS=${emailPass}`)
      .replace(/NEXT_PUBLIC_APP_URL=.*/, `NEXT_PUBLIC_APP_URL=${appUrl}`)
    
    // Write updated .env.local
    fs.writeFileSync(envPath, updatedEnv)
    
    console.log('\n✅ Email configuration updated!')
    console.log('📝 Updated .env.local file')
    console.log('\n🧪 Testing email configuration...')
    
    // Test email configuration
    await testEmailConfig(emailUser, emailPass)
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  } finally {
    rl.close()
  }
}

async function testEmailConfig(emailUser, emailPass) {
  try {
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    })
    
    // Verify configuration
    await transporter.verify()
    console.log('✅ Email configuration is valid!')
    
    // Send test email
    const testEmail = await question('Send test email? (y/n): ')
    
    if (testEmail.toLowerCase() === 'y') {
      const testRecipient = await question('Enter test email recipient: ')
      
      const mailOptions = {
        from: {
          name: 'Fashion Store',
          address: emailUser
        },
        to: testRecipient,
        subject: '🧪 Fashion Store Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">🎉 Email Configuration Successful!</h2>
            <p>Your Fashion Store email service is working correctly.</p>
            <p>This is a test email sent at: <strong>${new Date().toLocaleString()}</strong></p>
            <hr>
            <p style="color: #666; font-size: 0.9rem;">
              Fashion Store Authentication System<br>
              Email Service Test
            </p>
          </div>
        `
      }
      
      const info = await transporter.sendMail(mailOptions)
      console.log('✅ Test email sent successfully!')
      console.log('📧 Message ID:', info.messageId)
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message)
    console.log('\n🔍 Common issues:')
    console.log('- Make sure you use Gmail App Password, not regular password')
    console.log('- Enable 2-Factor Authentication on your Gmail account')
    console.log('- Check if "Less secure app access" is enabled (if needed)')
  }
}

// Run setup
setupEmail()