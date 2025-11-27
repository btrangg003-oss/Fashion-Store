const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const authFilePath = path.join(__dirname, '../data/auth.json');

// Get email and password from command line
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('❌ Usage: node scripts/reset-specific-password.js <email> <password>');
  console.log('Example: node scripts/reset-specific-password.js taquy778@gmail.com 12345678');
  process.exit(1);
}

// Read auth.json
const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));

// Find user
const user = authData.users.find(u => u.email === email);

if (!user) {
  console.log(`❌ User not found: ${email}`);
  console.log('\nAvailable users:');
  authData.users.forEach(u => console.log(`  - ${u.email}`));
  process.exit(1);
}

// Hash new password
const passwordHash = bcrypt.hashSync(newPassword, 12);

// Update user
user.passwordHash = passwordHash;
user.updatedAt = new Date().toISOString();

// Ensure user has admin role
if (!user.role) {
  user.role = 'admin';
  console.log('✅ Added admin role to user');
}

// Save
fs.writeFileSync(authFilePath, JSON.stringify(authData, null, 2));

console.log('\n✅ Password reset successfully!');
console.log(`   Email: ${email}`);
console.log(`   New Password: ${newPassword}`);
console.log(`   Role: ${user.role}`);
console.log('\n🔐 You can now login with these credentials');
