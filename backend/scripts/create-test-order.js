/**
 * Create test order for user taquy778@gmail.com
 * Usage: node scripts/create-test-order.js
 */

const fs = require('fs');
const path = require('path');

const ordersFile = path.join(__dirname, '../data/orders.json');
const authFile = path.join(__dirname, '../data/auth.json');

try {
  // Read auth data to get user info
  const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  const user = authData.users.find(u => u.email === 'taquy778@gmail.com');
  
  if (!user) {
    console.log('❌ User not found!');
    process.exit(1);
  }
  
  console.log('✅ Found user:', user.email);
  console.log('User ID:', user.id);
  
  // Read orders data
  const ordersData = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  
  // Create test order
  const testOrder = {
    id: `order_${Date.now()}_test`,
    orderNumber: `FS${Date.now().toString().slice(-8)}`,
    userId: user.id,
    items: [
      {
        id: "prod_1727856000000_ao001",
        name: "Áo Thun Nam Basic Premium",
        price: 299000,
        quantity: 2,
        size: "L",
        color: "Trắng",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"
      },
      {
        id: "prod_1727856000001_quan001",
        name: "Quần Jeans Nam Slim Fit",
        price: 599000,
        quantity: 1,
        size: "32",
        color: "Xanh đậm",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400"
      }
    ],
    subtotal: 1197000,
    shipping: 30000,
    total: 1227000,
    status: "delivered", // Set to delivered so user can review
    paymentMethod: "cod",
    shippingAddress: {
      fullName: user.displayName || `${user.firstName} ${user.lastName}`,
      phone: user.phone || "0123456789",
      address: "123 Test Street",
      ward: "Phường 1",
      district: "Quận 1",
      city: "TP.HCM",
      email: user.email
    },
    notes: "Test order for review system",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (delivered)
    userEmail: user.email,
    customerEmail: user.email
  };
  
  // Add to orders
  ordersData.orders.push(testOrder);
  
  // Write back
  fs.writeFileSync(ordersFile, JSON.stringify(ordersData, null, 2));
  
  console.log('\n✅ Test order created successfully!');
  console.log('\n📦 Order Details:');
  console.log('  Order ID:', testOrder.id);
  console.log('  Order Number:', testOrder.orderNumber);
  console.log('  User:', testOrder.customerEmail);
  console.log('  Status:', testOrder.status);
  console.log('  Total:', testOrder.total.toLocaleString('vi-VN'), 'đ');
  console.log('  Items:', testOrder.items.length);
  console.log('\n🎯 Next steps:');
  console.log('  1. Login as:', user.email);
  console.log('  2. Go to Profile → Đơn hàng');
  console.log('  3. You should see the test order');
  console.log('  4. Go to Profile → Đánh giá');
  console.log('  5. You can write reviews for the products');
  console.log('');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
