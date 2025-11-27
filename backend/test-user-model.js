require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('User model:', User.modelName);
    console.log('User.findByEmail:', typeof User.findByEmail);
    console.log('User statics:', Object.keys(User.schema.statics));
    
    // Test findByEmail
    const user = await User.findByEmail('test@example.com');
    console.log('Test query result:', user ? 'Found' : 'Not found');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
