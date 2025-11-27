const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testAPI() {
  console.log('🧪 Testing Fashion Store API\n');

  try {
    // Test 1: Get Products
    console.log('1️⃣ GET /api/products');
    const products = await axios.get(`${BASE_URL}/products?limit=2`);
    console.log(`✅ Found ${products.data.data.products.length} products`);
    console.log(`   Total: ${products.data.data.pagination.total}\n`);

    // Test 2: Get Single Product
    const productId = products.data.data.products[0]._id;
    console.log(`2️⃣ GET /api/products/${productId}`);
    const product = await axios.get(`${BASE_URL}/products/${productId}`);
    console.log(`✅ Product: ${product.data.data.name}`);
    console.log(`   Price: ${product.data.data.price.toLocaleString('vi-VN')}đ\n`);

    // Test 3: Register User
    console.log('3️⃣ POST /api/auth/register');
    const registerData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123456'
    };
    const register = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log(`✅ User registered: ${register.data.data.user.name}`);
    console.log(`   Email: ${register.data.data.user.email}\n`);

    // Test 4: Login
    console.log('4️⃣ POST /api/auth/login');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };
    const login = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log(`✅ Login successful`);
    console.log(`   Token: ${login.data.data.token.substring(0, 20)}...\n`);

    console.log('🎉 All tests passed!\n');
    console.log('📊 Summary:');
    console.log('   ✅ Products API working');
    console.log('   ✅ Auth API working');
    console.log('   ✅ MongoDB connected');
    console.log('   ✅ Data seeded successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testAPI();
