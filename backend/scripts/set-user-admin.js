const fs = require('fs');
const path = require('path');

const authFilePath = path.join(__dirname, '../data/auth.json');

// Read auth.json
const authData = JSON.parse(fs.readFileSync(authFilePath, 'utf8'));

console.log('📋 Current users:');
authData.users.forEach((user, index) => {
  console.log(`${index + 1}. ${user.email} - Role: ${user.role || 'user'} - ID: ${user.id}`);
});

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('\n❌ Please provide an email address');
  console.log('Usage: node scripts/set-user-admin.js <email>');
  console.log('Example: node scripts/set-user-admin.js btrangg003@gmail.com');
  process.exit(1);
}

// Find user
const user = authData.users.find(u => u.email === email);

if (!user) {
  console.log(`\n❌ User not found: ${email}`);
  console.log('Available users:');
  authData.users.forEach(u => console.log(`  - ${u.email}`));
  process.exit(1);
}

// Update role
const oldRole = user.role || 'user';
user.role = 'admin';
user.updatedAt = new Date().toISOString();

// Save
fs.writeFileSync(authFilePath, JSON.stringify(authData, null, 2));

console.log(`\n✅ Successfully updated user role:`);
console.log(`   Email: ${email}`);
console.log(`   Old Role: ${oldRole}`);
console.log(`   New Role: admin`);
console.log(`\n⚠️  Please logout and login again for changes to take effect!`);
