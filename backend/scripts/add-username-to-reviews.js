/**
 * Add userName to existing reviews
 * Usage: node scripts/add-username-to-reviews.js
 */

const fs = require('fs');
const path = require('path');

const reviewsFile = path.join(__dirname, '../data/reviews.json');
const authFile = path.join(__dirname, '../data/auth.json');

try {
  console.log('\n🔄 Adding userName to existing reviews...\n');
  
  // Read files
  const reviewsData = JSON.parse(fs.readFileSync(reviewsFile, 'utf8'));
  const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  
  let updated = 0;
  
  // Update each review
  reviewsData.reviews.forEach(review => {
    if (!review.userName) {
      // Find user
      const user = authData.users.find(u => u.id === review.userId);
      
      if (user) {
        // Set userName
        review.userName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng';
        updated++;
        console.log(`✅ Updated review ${review.id}: ${review.userName}`);
      } else {
        review.userName = 'Khách hàng';
        console.log(`⚠️  User not found for review ${review.id}, set to "Khách hàng"`);
      }
    }
  });
  
  // Write back
  fs.writeFileSync(reviewsFile, JSON.stringify(reviewsData, null, 2));
  
  console.log(`\n✅ Updated ${updated} reviews`);
  console.log('📝 All reviews now have userName field\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
