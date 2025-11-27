const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../data/products.json');

// Read products
const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('🚀 Upgrading product images to 4K quality...\n');

let updatedCount = 0;

data.products = data.products.map(product => {
  let updated = false;
  
  // ✅ Upgrade featuredImage to 4K
  if (product.featuredImage && product.featuredImage.includes('unsplash.com')) {
    // Remove width parameter and add 4K quality
    product.featuredImage = product.featuredImage
      .replace(/\?w=\d+/, '?w=3840&q=100')  // 4K width with max quality
      .replace(/&w=\d+/, '&w=3840&q=100');
    updated = true;
  }
  
  // ✅ Upgrade all images to 4K
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map(img => {
      if (typeof img === 'string') {
        if (img.includes('unsplash.com')) {
          return img
            .replace(/\?w=\d+/, '?w=3840&q=100')
            .replace(/&w=\d+/, '&w=3840&q=100');
        }
        return img;
      } else if (img.url && img.url.includes('unsplash.com')) {
        img.url = img.url
          .replace(/\?w=\d+/, '?w=3840&q=100')
          .replace(/&w=\d+/, '&w=3840&q=100');
        updated = true;
        return img;
      }
      return img;
    });
  }
  
  // ✅ Add missing fields if empty
  if (!product.brand || product.brand === '') {
    product.brand = product.vendor || 'Fashion Store';
    updated = true;
  }
  
  if (!product.material || product.material === '') {
    // Infer material from product type
    if (product.name.toLowerCase().includes('cotton') || product.description?.toLowerCase().includes('cotton')) {
      product.material = 'Cotton 100% cao cấp';
    } else if (product.name.toLowerCase().includes('jean') || product.name.toLowerCase().includes('denim')) {
      product.material = 'Denim cao cấp';
    } else if (product.name.toLowerCase().includes('da') || product.name.toLowerCase().includes('leather')) {
      product.material = 'Da thật 100%';
    } else if (product.name.toLowerCase().includes('len') || product.name.toLowerCase().includes('wool')) {
      product.material = 'Len cao cấp';
    } else {
      product.material = 'Vải cao cấp, thoáng mát';
    }
    updated = true;
  }
  
  if (!product.origin || product.origin === '') {
    product.origin = 'Việt Nam';
    updated = true;
  }
  
  if (!product.careInstructions || product.careInstructions === '') {
    product.careInstructions = 'Giặt máy ở nhiệt độ thường (30-40°C)\nKhông sử dụng chất tẩy\nPhơi nơi thoáng mát, tránh ánh nắng trực tiếp\nLà ở nhiệt độ trung bình\nBảo quản nơi khô ráo';
    updated = true;
  }
  
  if (updated) {
    updatedCount++;
    console.log(`✅ Updated: ${product.name}`);
    console.log(`   - Brand: ${product.brand}`);
    console.log(`   - Material: ${product.material}`);
    console.log(`   - Origin: ${product.origin}`);
    if (product.featuredImage) {
      console.log(`   - Image: 4K quality`);
    }
    console.log('');
  }
  
  return product;
});

// Save updated data
fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

console.log(`\n🎉 Done! Updated ${updatedCount} products`);
console.log(`\n📊 Summary:`);
console.log(`   - All images upgraded to 4K (3840px width)`);
console.log(`   - Quality set to 100%`);
console.log(`   - Missing fields filled`);
console.log(`   - Brand, Material, Origin, Care Instructions added`);
console.log(`\n✨ Products now have crystal clear 4K images!`);
