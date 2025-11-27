const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_store';

async function migrateData() {
  console.log('🚀 Starting migration to MongoDB...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('fashion_store');
    
    // Migrate Users
    console.log('📦 Migrating users...');
    if (fs.existsSync('data/auth.json')) {
      const authData = JSON.parse(fs.readFileSync('data/auth.json', 'utf8'));
      
      if (authData.users && authData.users.length > 0) {
        // Convert dates and add MongoDB fields
        const users = authData.users.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
          verificationCodeExpires: user.verificationCodeExpires ? new Date(user.verificationCodeExpires) : undefined,
          resetPasswordExpires: user.resetPasswordExpires ? new Date(user.resetPasswordExpires) : undefined
        }));
        
        await db.collection('users').deleteMany({}); // Clear existing
        const userResult = await db.collection('users').insertMany(users);
        console.log(`✅ Migrated ${userResult.insertedCount} users`);
      }
      
      if (authData.tempUsers && authData.tempUsers.length > 0) {
        const tempUsers = authData.tempUsers.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt),
          verificationCodeExpires: new Date(user.verificationCodeExpires)
        }));
        
        await db.collection('temp_users').deleteMany({});
        const tempResult = await db.collection('temp_users').insertMany(tempUsers);
        console.log(`✅ Migrated ${tempResult.insertedCount} temp users`);
      }
    }
    
    // Migrate Orders
    console.log('📦 Migrating orders...');
    if (fs.existsSync('data/orders.json')) {
      const ordersData = JSON.parse(fs.readFileSync('data/orders.json', 'utf8'));
      
      if (ordersData.orders && ordersData.orders.length > 0) {
        const orders = ordersData.orders.map(order => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : undefined,
          cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined,
          paidAt: order.paidAt ? new Date(order.paidAt) : undefined
        }));
        
        await db.collection('orders').deleteMany({});
        const orderResult = await db.collection('orders').insertMany(orders);
        console.log(`✅ Migrated ${orderResult.insertedCount} orders`);
      }
      
      if (ordersData.wishlist && ordersData.wishlist.length > 0) {
        const wishlist = ordersData.wishlist.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        
        await db.collection('wishlist').deleteMany({});
        const wishlistResult = await db.collection('wishlist').insertMany(wishlist);
        console.log(`✅ Migrated ${wishlistResult.insertedCount} wishlist items`);
      }
    }
    
    // Migrate Products
    console.log('📦 Migrating products...');
    if (fs.existsSync('data/products.json')) {
      const productsData = JSON.parse(fs.readFileSync('data/products.json', 'utf8'));
      
      if (productsData.products && productsData.products.length > 0) {
        const products = productsData.products.map(product => ({
          ...product,
          createdAt: new Date(product.createdAt || new Date()),
          updatedAt: new Date(product.updatedAt || new Date()),
          publishedAt: product.publishedAt ? new Date(product.publishedAt) : undefined
        }));
        
        await db.collection('products').deleteMany({});
        const productResult = await db.collection('products').insertMany(products);
        console.log(`✅ Migrated ${productResult.insertedCount} products`);
      }
    }
    
    // Create indexes for better performance
    console.log('🔍 Creating indexes...');
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('temp_users').createIndex({ email: 1 }, { unique: true });
    
    // Order indexes
    await db.collection('orders').createIndex({ id: 1 }, { unique: true });
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ orderNumber: 1 }, { unique: true });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    
    // Product indexes
    await db.collection('products').createIndex({ id: 1 }, { unique: true });
    await db.collection('products').createIndex({ sku: 1 }, { unique: true });
    await db.collection('products').createIndex({ slug: 1 }, { unique: true });
    await db.collection('products').createIndex({ status: 1 });
    await db.collection('products').createIndex({ categoryId: 1 });
    
    // Wishlist indexes
    await db.collection('wishlist').createIndex({ userId: 1, productId: 1 }, { unique: true });
    
    console.log('✅ Indexes created');
    
    // Backup original JSON files
    console.log('💾 Creating backups...');
    const backupDir = 'data/json-backup';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const filesToBackup = ['auth.json', 'orders.json', 'products.json'];
    filesToBackup.forEach(file => {
      const sourcePath = path.join('data', file);
      const backupPath = path.join(backupDir, `${Date.now()}-${file}`);
      
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, backupPath);
        console.log(`✅ Backed up ${file}`);
      }
    });
    
    console.log('🎉 Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${await db.collection('users').countDocuments()}`);
    console.log(`   - Orders: ${await db.collection('orders').countDocuments()}`);
    console.log(`   - Products: ${await db.collection('products').countDocuments()}`);
    console.log(`   - Wishlist: ${await db.collection('wishlist').countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run migration
migrateData();