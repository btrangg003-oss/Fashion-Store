require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  
  console.log('Existing models:', Object.keys(mongoose.models));
  console.log('Existing connection models:', Object.keys(mongoose.connection.models));
  
  // Try to load User
  console.log('\nLoading User model...');
  try {
    const User = require('./src/models/User');
    console.log('User loaded:', User);
  } catch (error) {
    console.error('Error loading User:', error.message);
  }
  
  console.log('\nModels after load:', Object.keys(mongoose.models));
  
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
