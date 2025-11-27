const { MongoClient } = require('mongodb');

async function setupIndexes() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_store';

  console.log('🔍 Setting up MongoDB indexes...');
  console.log('URI:', MONGODB_URI);

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('fashion_store');

    // Create collections if they don't exist
    const collections = ['users', 'temp_users', 'orders', 'products', 'wishlist'];
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection ${collectionName} already exists`);
        } else {
          console.log(`⚠️  Error creating ${collectionName}:`, error.message);
        }
      }
    }

    console.log('🔍 Creating indexes...');

    // User indexes
    await db.collection('users').createIndex({ "email": 1 }, { unique: true });
    await db.collection('users').createIndex({ "id": 1 }, { unique: true });
    console.log('✅ User indexes created');

    // Temp User indexes
    await db.collection('temp_users').createIndex({ "email": 1 }, { unique: true });
    console.log('✅ Temp user indexes created');

    // Order indexes
    await db.collection('orders').createIndex({ "id": 1 }, { unique: true });
    await db.collection('orders').createIndex({ "userId": 1 });
    await db.collection('orders').createIndex({ "orderNumber": 1 }, { unique: true });
    await db.collection('orders').createIndex({ "status": 1 });
    await db.collection('orders').createIndex({ "createdAt": -1 });
    console.log('✅ Order indexes created');

    // Product indexes
    await db.collection('products').createIndex({ "id": 1 }, { unique: true });
    await db.collection('products').createIndex({ "sku": 1 }, { unique: true });
    await db.collection('products').createIndex({ "slug": 1 }, { unique: true });
    await db.collection('products').createIndex({ "status": 1 });
    await db.collection('products').createIndex({ "categoryId": 1 });
    console.log('✅ Product indexes created');

    // Wishlist indexes
    await db.collection('wishlist').createIndex({ "userId": 1, "productId": 1 }, { unique: true });
    console.log('✅ Wishlist indexes created');

    // Create default admin user if not exists
    const adminUser = {
      id: 'admin-001',
      email: 'admin@fashionstore.com',
      passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
      firstName: 'Admin',
      lastName: 'User',
      isVerified: true,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingAdmin = await db.collection('users').findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await db.collection('users').insertOne(adminUser);
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('🎉 MongoDB setup completed successfully!');

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

setupIndexes();