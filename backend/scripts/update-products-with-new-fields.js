const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json');

async function updateProducts() {
  try {
    // Read products
    const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
    
    console.log(`Found ${data.products.length} products`);
    
    // Update each product
    data.products = data.products.map(product => {
      const updated = {
        ...product,
        // Ensure featuredImage is set
        featuredImage: product.featuredImage || product.images?.[0] || '',
        // Ensure images array exists
        images: product.images || [],
        // Add new fields if missing
        brand: product.brand || '',
        material: product.material || '',
        origin: product.origin || '',
        careInstructions: product.careInstructions || '',
        // Ensure other fields
        status: product.status || 'active',
        visibility: product.visibility || 'visible',
        trackQuantity: product.trackQuantity !== false,
        requiresShipping: product.requiresShipping !== false
      };
      
      console.log(`Updated: ${product.name}`);
      return updated;
    });
    
    // Write back
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
    
    console.log('\n✅ All products updated successfully!');
    console.log(`Total: ${data.products.length} products`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateProducts();
