/**
 * Test user token and roles
 * Usage: node scripts/test-user-token.js
 */

const fs = require('fs');
const path = require('path');

const authFile = path.join(__dirname, '../data/auth.json');

try {
  const data = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  
  console.log('\n🔍 Checking user: taquy778@gmail.com\n');
  
  const user = data.users.find(u => u.email === 'taquy778@gmail.com');
  
  if (!user) {
    console.log('❌ User not found!');
    process.exit(1);
  }
  
  console.log('✅ User found!');
  console.log('📧 Email:', user.email);
  console.log('👤 Name:', user.firstName, user.lastName);
  console.log('🔑 Role:', user.role);
  console.log('🎭 Roles:', user.roles);
  console.log('✅ Verified:', user.isVerified);
  console.log('📅 Last Login:', user.lastLoginAt);
  console.log('🆔 User ID:', user.id);
  
  // Check roles
  console.log('\n🎭 Role Check:');
  if (user.roles && user.roles.includes('admin')) {
    console.log('  ✅ Has ADMIN role');
  } else {
    console.log('  ❌ Missing ADMIN role');
  }
  
  if (user.roles && user.roles.includes('user')) {
    console.log('  ✅ Has USER role');
  } else {
    console.log('  ❌ Missing USER role');
  }
  
  // Check if both roles exist
  if (user.roles && user.roles.includes('admin') && user.roles.includes('user')) {
    console.log('\n✅ User has BOTH admin and user roles!');
  } else {
    console.log('\n⚠️  User is missing one or both roles');
  }
  
  console.log('\n📝 To login and get token:');
  console.log('  1. Go to: http://localhost:3000/auth/login');
  console.log('  2. Email: taquy778@gmail.com');
  console.log('  3. Password: [your password]');
  console.log('  4. After login, check: localStorage.getItem("token")');
  console.log('\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
