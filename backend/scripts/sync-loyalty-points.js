/**
 * Sync loyalty points from loyalty.json to auth.json
 * Usage: node scripts/sync-loyalty-points.js
 */

const fs = require('fs');
const path = require('path');

const loyaltyFile = path.join(__dirname, '../data/loyalty.json');
const authFile = path.join(__dirname, '../data/auth.json');

try {
  console.log('\n🔄 Syncing loyalty points...\n');
  
  // Read both files
  const loyaltyData = JSON.parse(fs.readFileSync(loyaltyFile, 'utf8'));
  const authData = JSON.parse(fs.readFileSync(authFile, 'utf8'));
  
  let syncCount = 0;
  
  // Sync each loyalty account to auth user
  for (const account of loyaltyData.accounts) {
    const user = authData.users.find(u => u.id === account.userId);
    
    if (user) {
      const oldPoints = user.loyaltyPoints || 0;
      const newPoints = account.points;
      
      if (oldPoints !== newPoints) {
        user.loyaltyPoints = newPoints;
        user.loyaltyTier = account.tier;
        user.updatedAt = new Date().toISOString();
        
        console.log(`✅ Synced: ${user.email}`);
        console.log(`   Old points: ${oldPoints}`);
        console.log(`   New points: ${newPoints}`);
        console.log(`   Tier: ${account.tier}`);
        console.log('');
        
        syncCount++;
      } else {
        console.log(`✓ Already synced: ${user.email} (${newPoints} points)`);
      }
    } else {
      console.log(`⚠️  User not found for loyalty account: ${account.userId}`);
    }
  }
  
  // Write back auth.json
  if (syncCount > 0) {
    fs.writeFileSync(authFile, JSON.stringify(authData, null, 2));
    console.log(`\n✅ Synced ${syncCount} user(s) successfully!`);
  } else {
    console.log('\n✓ All users already in sync!');
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Total loyalty accounts: ${loyaltyData.accounts.length}`);
  console.log(`   Synced: ${syncCount}`);
  console.log('');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
