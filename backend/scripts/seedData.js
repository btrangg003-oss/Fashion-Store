const mongoose = require('mongoose');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
require('dotenv').config();

const categories = [
  {
    name: 'Áo Nam',
    slug: 'ao-nam',
    description: 'Bộ sưu tập áo nam thời trang',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'
  },
  {
    name: 'Quần Nam',
    slug: 'quan-nam',
    description: 'Bộ sưu tập quần nam',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'
  },
  {
    name: 'Áo Nữ',
    slug: 'ao-nu',
    description: 'Bộ sưu tập áo nữ thời trang',
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800'
  },
  {
    name: 'Váy Nữ',
    slug: 'vay-nu',
    description: 'Bộ sưu tập váy nữ',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
  }
];

const products = [
  {
    name: 'Áo Thun Nam Basic',
    slug: 'ao-thun-nam-basic',
    description: 'Áo thun nam basic, chất liệu cotton 100%',
    price: 199000,
    comparePrice: 299000,
    category: 'ao-nam',
    images: [{
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      publicId: 'sample_1',
      altText: 'Áo Thun Nam Basic'
    }],
    tags: ['áo thun', 'nam', 'basic'],
    stock: 100,
    status: 'active'
  },
  {
    name: 'Quần Jeans Nam Slim Fit',
    slug: 'quan-jeans-nam-slim-fit',
    description: 'Quần jeans nam form slim fit, co giãn nhẹ',
    price: 499000,
    comparePrice: 699000,
    category: 'quan-nam',
    images: [{
      url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
      publicId: 'sample_2',
      altText: 'Quần Jeans Nam Slim Fit'
    }],
    tags: ['quần jeans', 'nam', 'slim fit'],
    stock: 80,
    status: 'active'
  },
  {
    name: 'Áo Sơ Mi Nữ Trắng',
    slug: 'ao-so-mi-nu-trang',
    description: 'Áo sơ mi nữ trắng công sở, thanh lịch',
    price: 299000,
    comparePrice: 399000,
    category: 'ao-nu',
    images: [{
      url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800',
      publicId: 'sample_3',
      altText: 'Áo Sơ Mi Nữ Trắng'
    }],
    tags: ['áo sơ mi', 'nữ', 'công sở'],
    stock: 60,
    status: 'active'
  },
  {
    name: 'Váy Maxi Hoa',
    slug: 'vay-maxi-hoa',
    description: 'Váy maxi họa tiết hoa, phong cách nữ tính',
    price: 599000,
    comparePrice: 799000,
    category: 'vay-nu',
    images: [{
      url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      publicId: 'sample_4',
      altText: 'Váy Maxi Hoa'
    }],
    tags: ['váy', 'nữ', 'maxi'],
    stock: 40,
    status: 'active'
  }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Map category slugs to IDs
    const categoryMap = {};
    insertedCategories.forEach(cat => {
      categoryMap[cat.slug] = cat._id;
    });

    // Update products with category IDs
    const productsWithIds = products.map(product => ({
      ...product,
      categoryId: categoryMap[product.category]
    }));

    // Insert products
    const insertedProducts = await Product.insertMany(productsWithIds);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    console.log('\n🎉 Seed data completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
