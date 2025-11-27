/**
 * Script to update customer tiers and segments
 * Run: node scripts/update-customer-tiers-segments.js
 */

const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '..', 'data', 'auth.json');
const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');

// Calculate account age in days
function calculateAccountAge(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Calculate segment based on orders and account age
function calculateSegment(totalOrders, accountAge) {
  // VIP: ≥20 orders (highest priority)
  if (totalOrders >= 20) {
    return 'vip';
  }
  
  // LOYAL: ≥365 days (1 year)
  if (accountAge >= 365) {
    return 'loyal';
  }
  
  // NEW: 0-30 days
  if (accountAge <= 30) {
    return 'new';
  }
  
  // REGULAR: >30 days, <365 days, <20 orders
  return 'regular';
}

async function updateTiers() {
  try {
    console.log('📊 Đang cập nhật tier và segment cho khách hàng...\n');

    // Read data
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));

    let updated = 0;

    // Update each user
    authData.users = authData.users.map(user => {
      // Calculate stats
      const userOrders = ordersData.orders.filter(order => 
        order.userId === user.id && order.status !== 'cancelled'
      );

      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lastOrder = userOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      const accountAge = calculateAccountAge(user.createdAt);
      const tier = calculateSegment(totalOrders, accountAge);

      // Update user
      const updatedUser = {
        ...user,
        tier,
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt || null,
        tierUpdatedAt: new Date().toISOString()
      };

      // Log if tier changed
      if (user.tier !== tier) {
        console.log(`✓ ${user.email}: ${user.tier || 'none'} → ${tier} (${totalOrders} đơn, ${accountAge} ngày)`);
        updated++;
      }

      return updatedUser;
    });

    // Save
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

    console.log(`\n✅ Hoàn thành!`);
    console.log(`📊 Đã cập nhật ${updated} khách hàng`);
    console.log(`📁 File: ${AUTH_FILE}`);

    // Show tier distribution
    const tierCounts = authData.users.reduce((acc, user) => {
      acc[user.tier] = (acc[user.tier] || 0) + 1;
      return acc;
    }, {});

    console.log(`\n📈 Phân bố hạng:`);
    console.log(`   🆕 Mới: ${tierCounts.new || 0}`);
    console.log(`   👤 Thân thiết: ${tierCounts.regular || 0}`);
    console.log(`   🏆 Lâu năm: ${tierCounts.loyal || 0}`);
    console.log(`   ⭐ VIP: ${tierCounts.vip || 0}`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

updateTiers();
