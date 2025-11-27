const fs = require('fs');
const path = require('path');

const productsPath = path.join(__dirname, '../data/products.json');

// Read products
const data = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('🚀 Adding variants to products without them...\n');

let updatedCount = 0;

// Default sizes and colors based on product type
const getDefaultVariants = (product) => {
  const productName = product.name.toLowerCase();
  
  // Determine sizes
  let sizes = [];
  if (productName.includes('váy') || productName.includes('đầm') || productName.includes('dress')) {
    sizes = ['S', 'M', 'L', 'XL'];
  } else if (productName.includes('áo') || productName.includes('shirt') || productName.includes('top')) {
    sizes = ['S', 'M', 'L', 'XL'];
  } else if (productName.includes('quần') || productName.includes('pants') || productName.includes('jean')) {
    sizes = ['28', '29', '30', '31', '32'];
  } else if (productName.includes('giày') || productName.includes('shoe')) {
    sizes = ['38', '39', '40', '41', '42'];
  } else {
    sizes = ['S', 'M', 'L']; // Default
  }
  
  // Determine colors
  let colors = [];
  if (productName.includes('đỏ') || productName.includes('red')) {
    colors = ['Đỏ', 'Đen'];
  } else if (productName.includes('trắng') || productName.includes('white')) {
    colors = ['Trắng', 'Đen'];
  } else if (productName.includes('đen') || productName.includes('black')) {
    colors = ['Đen', 'Trắng'];
  } else if (productName.includes('xanh') || productName.includes('blue')) {
    colors = ['Xanh', 'Đen'];
  } else {
    colors = ['Đỏ', 'Đen', 'Trắng']; // Default
  }
  
  // Generate variants
  const variants = [];
  let variantIndex = 1;
  
  sizes.forEach(size => {
    colors.forEach(color => {
      variants.push({
        id: `var_${product.id}_${variantIndex}`,
        title: `Size ${size} - ${color}`,
        price: product.price,
        sku: `${product.sku || product.id}-${size}-${color}`.toUpperCase(),
        stock: Math.floor(product.stock / (sizes.length * colors.length)) || 10,
        options: [
          { name: 'Size', value: size },
          { name: 'Màu sắc', value: color }
        ]
      });
      variantIndex++;
    });
  });
  
  return variants;
};

data.products = data.products.map(product => {
  // Check if product has no variants or empty variants
  if (!product.variants || product.variants.length === 0) {
    product.variants = getDefaultVariants(product);
    updatedCount++;
    
    console.log(`✅ Added variants to: ${product.name}`);
    console.log(`   - Sizes: ${[...new Set(product.variants.map(v => v.options.find(o => o.name === 'Size').value))].join(', ')}`);
    console.log(`   - Colors: ${[...new Set(product.variants.map(v => v.options.find(o => o.name === 'Màu sắc').value))].join(', ')}`);
    console.log(`   - Total variants: ${product.variants.length}`);
    console.log('');
  }
  
  return product;
});

// Save updated data
fs.writeFileSync(productsPath, JSON.stringify(data, null, 2));

console.log(`\n🎉 Done! Added variants to ${updatedCount} products`);
console.log(`\n📊 Summary:`);
console.log(`   - Products updated: ${updatedCount}`);
console.log(`   - All products now have sizes and colors`);
console.log(`   - Variants generated based on product type`);
console.log(`\n✨ Products now have complete variant options!`);
