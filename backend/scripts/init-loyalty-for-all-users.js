// Initialize loyalty points for all existing users
const fs = require('fs');
const path = require('path');

console.log('🎯 Initializing Loyalty Points for All Users...\n');

// Read auth data to get all users
const authFile = path.join(process.cwd(), 'data', 'auth.json');
const pointsFile = path.join(process.cwd(), 'data', 'loyalty-points.json');
const transactionsFile = path.join(process.cwd(), 'data', 'point-transactions.json');

if (!fs.existsSync(authFile)) {
  console.error('❌ auth.json not found!');
  process.exit(1);
}

const authData = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
const users = authData.users || [];

console.log(`📊 Found ${users.length} users`);

// Initialize points data
const pointsData = {};
const transactions = [];

users.forEach((user, index) => {
  // Give each user some initial points based on their registration
  const basePoints = 500; // Welcome bonus
  const randomBonus = Math.floor(Math.random() * 1000); // Random 0-1000
  const totalPoints = basePoints + randomBonus;

  pointsData[user.id] = {
    currentPoints: totalPoints,
    lifetimePoints: totalPoints,
    tier: totalPoints >= 5000 ? 'gold' : totalPoints >= 1000 ? 'silver' : 'bronze'
  };

  // Add welcome transaction
  transactions.push({
    id: `txn_welcome_${user.id}_${Date.now()}`,
    userId: user.id,
    type: 'earn',
    points: basePoints,
    description: 'Thưởng chào mừng thành viên mới',
    createdAt: new Date().toISOString()
  });

  if (randomBonus > 0) {
    transactions.push({
      id: `txn_bonus_${user.id}_${Date.now()}`,
      userId: user.id,
      type: 'earn',
      points: randomBonus,
      description: 'Điểm thưởng đặc biệt',
      createdAt: new Date().toISOString()
    });
  }

  console.log(`✅ User ${index + 1}: ${user.email}`);
  console.log(`   Points: ${totalPoints} | Tier: ${pointsData[user.id].tier}`);
});

// Write to files
fs.writeFileSync(pointsFile, JSON.stringify(pointsData, null, 2));
fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));

console.log(`\n✅ Successfully initialized loyalty points for ${users.length} users!`);
console.log(`📁 Data saved to:`);
console.log(`   - ${pointsFile}`);
console.log(`   - ${transactionsFile}`);
console.log(`\n🎉 Users can now view their loyalty points in profile!`);
