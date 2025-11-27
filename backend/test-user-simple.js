require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  
  const User = require('./src/models/User');
  console.log('User model:', User.modelName);
  console.log('findByEmail:', typeof User.findByEmail);
  console.log('User.schema.statics:', Object.keys(User.schema.statics));
  
  // Test findByEmail
  const result = await User.findByEmail('test@example.com');
  console.log('Query result:', result ? 'Found' : 'Not found');
  
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
