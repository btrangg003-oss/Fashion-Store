const fs = require('fs');
const path = require('path');

const ordersFilePath = path.join(__dirname, '../data/orders.json');
const authFilePath = path.join(__dirname, '../data/auth.json');

console.log('📧 Adding email to existing orders...\n');

// Read files
const ordersData = JSON.parse(fs.readFileSync(ordersFilePath, 'utf8'));
const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));

// Create userId to email map
const userEmailMap = {};
authData.users.forEach(user => {
  userEmailMap[user.id] = user.email;
});

console.log(`Found ${authData.users.length} users in database`);
console.log(`Found ${ordersData.orders.length} orders\n`);

// Update orders with email
let updatedCount = 0;
ordersData.orders.forEach(order => {
  if (order.userId && userEmailMap[order.userId]) {
    order.userEmail = userEmailMap[order.userId];
    
    // Also add to shippingAddress if not exists
    if (!order.shippingAddress.email) {
      order.shippingAddress.email = userEmailMap[order.userId];
    }
    
    updatedCount++;
    console.log(`✅ Order ${order.orderNumber}: Added email ${userEmailMap[order.userId]}`);
  } else {
    console.log(`⚠️  Order ${order.orderNumber}: No user found for userId ${order.userId}`);
  }
});

// Save updated orders
fs.writeFileSync(ordersFilePath, JSON.stringify(ordersData, null, 2));

console.log(`\n✨ Done! Updated ${updatedCount} orders with email addresses`);
console.log(`📁 File saved: ${ordersFilePath}`);
