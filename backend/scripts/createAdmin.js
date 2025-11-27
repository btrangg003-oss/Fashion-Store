require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema inline
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true, lowercase: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      phone: String,
      isVerified: { type: Boolean, default: false },
      role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Admin credentials
    const adminEmail = 'taquy778@gmail.com';
    const adminPassword = 'Admin123456';
    const adminName = 'Admin User';

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists');
      console.log('   Email:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isVerified = true;
        existingAdmin.status = 'active';
        await existingAdmin.save();
        console.log('✅ Updated to admin role');
      }
      
      process.exit(0);
    }

    // Create admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = new User({
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'admin',
      isVerified: true,
      status: 'active'
    });

    await admin.save();

    console.log('\n🎉 Admin account created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Role:', admin.role);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
