const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function resetAdminPassword() {
    const authPath = path.join(__dirname, '../data/auth.json');
    const authData = JSON.parse(fs.readFileSync(authPath, 'utf8'));

    const email = 'taquy778@gmail.com';
    const newPassword = '12345678';

    // Find user
    const userIndex = authData.users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        console.log('❌ User not found!');
        return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user
    authData.users[userIndex].passwordHash = passwordHash;
    authData.users[userIndex].updatedAt = new Date().toISOString();

    // Save
    fs.writeFileSync(authPath, JSON.stringify(authData, null, 2));

    console.log('✅ Password reset successfully!');
    console.log('Email:', email);
    console.log('New Password:', newPassword);
    console.log('New Hash:', passwordHash);
}

resetAdminPassword().catch(console.error);
