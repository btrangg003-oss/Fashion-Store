/**
 * Test script for request notification emails
 * Tests email sending for customer requests (email change, phone change, return/exchange)
 */

const { sendRequestCreatedEmail, sendAdminNotificationEmail } = require('../lib/requestNotifications');

async function testRequestEmails() {
  console.log('🧪 Testing Request Notification Emails...\n');

  try {
    // Test 1: Email Change Request
    console.log('📧 Test 1: Email Change Request');
    await sendRequestCreatedEmail(
      'customer@example.com',
      'Nguyễn Văn A',
      'email_change',
      'REQ-123456',
      {
        currentEmail: 'old@example.com',
        newEmail: 'new@example.com'
      }
    );
    console.log('✅ Email change notification sent to customer\n');

    // Test 2: Phone Change Request
    console.log('📱 Test 2: Phone Change Request');
    await sendRequestCreatedEmail(
      'customer@example.com',
      'Nguyễn Văn A',
      'phone_change',
      'REQ-123457',
      {
        currentPhone: '0901234567',
        newPhone: '0987654321'
      }
    );
    console.log('✅ Phone change notification sent to customer\n');

    // Test 3: Return/Exchange Request
    console.log('📦 Test 3: Return/Exchange Request');
    await sendRequestCreatedEmail(
      'customer@example.com',
      'Nguyễn Văn A',
      'return_exchange',
      'REQ-123458',
      {
        orderId: 'ORD-123',
        orderNumber: 'ORD-20241111-001',
        action: 'return',
        items: [
          {
            productName: 'Áo thun nam basic',
            quantity: 2,
            price: 299000,
            size: 'L',
            color: 'Đen'
          },
          {
            productName: 'Quần jean slim fit',
            quantity: 1,
            price: 599000,
            size: '32',
            color: 'Xanh đậm'
          }
        ],
        reason: 'wrong_size',
        reasonText: 'Sản phẩm không đúng size',
        refundAmount: 1197000
      }
    );
    console.log('✅ Return/exchange notification sent to customer\n');

    // Test 4: Admin Notification
    console.log('👨‍💼 Test 4: Admin Notification');
    await sendAdminNotificationEmail(
      'email_change',
      'Nguyễn Văn A',
      'customer@example.com',
      'REQ-123456',
      {
        email: 5,
        phone: 3,
        return: 2
      }
    );
    console.log('✅ Admin notification sent\n');

    console.log('🎉 All email tests completed successfully!');
    console.log('\n📝 Notes:');
    console.log('- Check your email inbox for test emails');
    console.log('- Verify email templates display correctly');
    console.log('- Check spam folder if emails not received');
    console.log('- Ensure SMTP credentials are configured in .env.local');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check SMTP credentials in .env.local');
    console.error('2. Verify email service is configured');
    console.error('3. Check network connection');
    console.error('4. Review error details above');
    process.exit(1);
  }
}

// Run tests
testRequestEmails();
