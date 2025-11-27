const { MongoClient } = require('mongodb');

// Fashion product data
const categories = [
    'ao-thun', 'ao-so-mi', 'ao-khoac', 'quan-jean', 'quan-short',
    'vay-dam', 'giay-sneaker', 'giay-cao-got', 'phu-kien', 'tui-xach'
];

const productTypes = [
    'Áo thun', 'Áo sơ mi', 'Áo khoác', 'Quần jean', 'Quần short',
    'Váy đầm', 'Giày sneaker', 'Giày cao gót', 'Phụ kiện', 'Túi xách'
];

const brands = [
    'Zara', 'H&M', 'Uniqlo', 'Nike', 'Adidas', 'Gucci', 'Louis Vuitton',
    'Chanel', 'Dior', 'Prada', 'Versace', 'Armani', 'Calvin Klein',
    'Tommy Hilfiger', 'Ralph Lauren', 'Lacoste', 'Burberry', 'Hermès'
];

const colors = [
    'Đen', 'Trắng', 'Xám', 'Xanh navy', 'Xanh dương', 'Đỏ', 'Hồng',
    'Vàng', 'Cam', 'Tím', 'Nâu', 'Be', 'Xanh lá', 'Bạc', 'Vàng gold'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const materials = [
    'Cotton 100%', 'Polyester', 'Cotton pha', 'Linen', 'Silk', 'Denim',
    'Leather', 'Wool', 'Cashmere', 'Viscose', 'Modal', 'Spandex'
];

const adjectives = [
    'Cao cấp', 'Thời trang', 'Sang trọng', 'Hiện đại', 'Cổ điển', 'Trẻ trung',
    'Thanh lịch', 'Năng động', 'Thoải mái', 'Dễ thương', 'Quyến rũ', 'Cá tính'
];

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSKU() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let sku = '';

    // 2 letters + 4 numbers
    for (let i = 0; i < 2; i++) {
        sku += letters[Math.floor(Math.random() * letters.length)];
    }
    for (let i = 0; i < 4; i++) {
        sku += numbers[Math.floor(Math.random() * numbers.length)];
    }

    return sku;
}

function generateSlug(name, index) {
    const baseSlug = name
        .toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

    // Add index to make it unique
    return `${baseSlug}-${index + 1}`;
}

function generateProduct(index) {
    const category = randomChoice(categories);
    const productType = productTypes[categories.indexOf(category)];
    const brand = randomChoice(brands);
    const color = randomChoice(colors);
    const material = randomChoice(materials);
    const adjective = randomChoice(adjectives);

    const name = `${adjective} ${productType} ${brand} ${color}`;
    const price = randomNumber(199000, 2999000);
    const comparePrice = Math.random() > 0.7 ? price + randomNumber(100000, 500000) : undefined;
    const cost = Math.floor(price * (0.4 + Math.random() * 0.3)); // 40-70% of price

    const product = {
        id: `product-${String(index + 1).padStart(3, '0')}`,
        name: name,
        description: `${name} chất liệu ${material}. Thiết kế ${adjective.toLowerCase()}, phù hợp cho nhiều dịp khác nhau. Sản phẩm chính hãng ${brand} với chất lượng cao cấp.`,
        price: price,
        comparePrice: comparePrice,
        cost: cost,
        sku: generateSKU(),
        barcode: `${randomNumber(1000000000000, 9999999999999)}`,
        stock: randomNumber(0, 100),
        lowStockThreshold: randomNumber(5, 15),
        trackQuantity: true,

        // Category and organization
        categoryId: category,
        tags: [productType.toLowerCase(), brand.toLowerCase(), color.toLowerCase()],
        vendor: brand,
        productType: productType,

        // Media
        images: [
            {
                id: `img-${index + 1}-1`,
                url: `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}-${randomNumber(100000, 999999)}?w=800&h=800&fit=crop`,
                alt: name,
                position: 1
            },
            {
                id: `img-${index + 1}-2`,
                url: `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}-${randomNumber(100000, 999999)}?w=800&h=800&fit=crop`,
                alt: `${name} - Ảnh 2`,
                position: 2
            }
        ],
        featuredImage: `https://images.unsplash.com/photo-${randomNumber(1500000000000, 1700000000000)}-${randomNumber(100000, 999999)}?w=800&h=800&fit=crop`,

        // SEO and visibility
        status: randomChoice(['active', 'active', 'active', 'inactive']), // 75% active
        visibility: 'visible',
        metaTitle: `${name} - Chính hãng, Giá tốt`,
        metaDescription: `Mua ${name} chính hãng với giá tốt nhất. Chất liệu ${material}, thiết kế ${adjective.toLowerCase()}. Miễn phí vận chuyển toàn quốc.`,
        slug: generateSlug(name, index),

        // Variants
        variants: [
            {
                id: `variant-${index + 1}-1`,
                name: 'Kích thước',
                options: sizes.slice(0, randomNumber(3, 6))
            },
            {
                id: `variant-${index + 1}-2`,
                name: 'Màu sắc',
                options: [color, randomChoice(colors.filter(c => c !== color))]
            }
        ],

        // Shipping
        weight: randomNumber(200, 2000), // grams
        dimensions: {
            length: randomNumber(20, 50),
            width: randomNumber(15, 40),
            height: randomNumber(2, 10)
        },
        requiresShipping: true,

        // Timestamps
        createdAt: new Date(Date.now() - randomNumber(0, 365 * 24 * 60 * 60 * 1000)), // Random date within last year
        updatedAt: new Date(),
        publishedAt: Math.random() > 0.1 ? new Date() : undefined // 90% published
    };

    return product;
}

async function generateProducts() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashion_store';

    console.log('🎨 Generating 100 random fashion products...');

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('fashion_store');
        const collection = db.collection('products');

        // Check existing products count
        const existingCount = await collection.countDocuments();
        console.log(`📊 Existing products: ${existingCount}`);

        const productsToGenerate = Math.max(0, 100 - existingCount);
        console.log(`🎯 Will generate ${productsToGenerate} more products...`);

        if (productsToGenerate === 0) {
            console.log('✅ Already have 100+ products!');
            return;
        }

        // Generate remaining products
        const products = [];
        for (let i = existingCount; i < existingCount + productsToGenerate; i++) {
            products.push(generateProduct(i));
            if ((i - existingCount + 1) % 10 === 0) {
                console.log(`📦 Generated ${i - existingCount + 1}/${productsToGenerate} products...`);
            }
        }

        // Insert products in batches
        console.log('💾 Inserting products into database...');
        const result = await collection.insertMany(products);

        console.log(`✅ Successfully inserted ${result.insertedCount} products!`);

        // Show summary
        const stats = await collection.aggregate([
            {
                $group: {
                    _id: '$categoryId',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                    totalStock: { $sum: '$stock' }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();

        console.log('📊 Product Summary by Category:');
        stats.forEach(stat => {
            console.log(`  - ${stat._id}: ${stat.count} products, Avg price: ${Math.round(stat.avgPrice).toLocaleString()}đ, Total stock: ${stat.totalStock}`);
        });

        const totalProducts = await collection.countDocuments();
        console.log(`🎉 Total products in database: ${totalProducts}`);

    } catch (error) {
        console.error('❌ Error generating products:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

generateProducts();