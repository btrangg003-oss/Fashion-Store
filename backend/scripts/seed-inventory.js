// Script to seed inventory with sample products
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Sample inventory items
const sampleInventory = [
  {
    id: 'inv_001',
    productId: 'prod_001',
    sku: 'TSH-001',
    barcode: '8934567890123',
    name: 'Áo thun trắng basic',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'Áo thun',
    quantity: 50,
    minQuantity: 10,
    maxQuantity: 200,
    location: 'A-01-01',
    costPrice: 80000,
    sellingPrice: 150000,
    status: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv_002',
    productId: 'prod_002',
    sku: 'TSH-002',
    barcode: '8934567890124',
    name: 'Áo thun đen basic',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400',
    category: 'Áo thun',
    quantity: 45,
    minQuantity: 10,
    maxQuantity: 200,
    location: 'A-01-02',
    costPrice: 80000,
    sellingPrice: 150000,
    status: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv_003',
    productId: 'prod_003',
    sku: 'JEAN-001',
    barcode: '8934567890125',
    name: 'Quần jean xanh slim fit',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    category: 'Quần jean',
    quantity: 30,
    minQuantity: 5,
    maxQuantity: 100,
    location: 'B-02-01',
    costPrice: 200000,
    sellingPrice: 350000,
    status: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv_004',
    productId: 'prod_004',
    sku: 'JEAN-002',
    barcode: '8934567890126',
    name: 'Quần jean đen skinny',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400',
    category: 'Quần jean',
    quantity: 8,
    minQuantity: 10,
    maxQuantity: 100,
    location: 'B-02-02',
    costPrice: 200000,
    sellingPrice: 350000,
    status: 'low_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv_005',
    productId: 'prod_005',
    sku: 'DRESS-001',
    barcode: '8934567890127',
    name: 'Váy hoa mùa hè',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    category: 'Váy',
    quantity: 0,
    minQuantity: 5,
    maxQuantity: 50,
    location: 'C-03-01',
    costPrice: 150000,
    sellingPrice: 280000,
    status: 'out_of_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv_006',
    productId: 'prod_006',
    sku: 'SHIRT-001',
    barcode: '8934567890128',
    name: 'Áo sơ mi trắng công sở',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    category: 'Áo sơ mi',
    quantity: 25,
    minQuantity: 10,
    maxQuantity: 100,
    location: 'A-01-03',
    costPrice: 120000,
    sellingPrice: 220000,
    status: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv_007',
    productId: 'prod_007',
    sku: 'JACKET-001',
    barcode: '8934567890129',
    name: 'Áo khoác jean xanh',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    category: 'Áo khoác',
    quantity: 15,
    minQuantity: 5,
    maxQuantity: 50,
    location: 'D-04-01',
    costPrice: 250000,
    sellingPrice: 450000,
    status: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inv_008',
    productId: 'prod_008',
    sku: 'SHORT-001',
    barcode: '8934567890130',
    name: 'Quần short kaki',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400',
    category: 'Quần short',
    quantity: 35,
    minQuantity: 10,
    maxQuantity: 100,
    location: 'B-02-03',
    costPrice: 100000,
    sellingPrice: 180000,
    status: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Read existing inventory or create new
let inventory = [];
if (fs.existsSync(INVENTORY_FILE)) {
  const data = fs.readFileSync(INVENTORY_FILE, 'utf-8');
  inventory = JSON.parse(data);
  console.log(`Found ${inventory.length} existing items`);
}

// Add sample items if not exist
let added = 0;
sampleInventory.forEach(item => {
  const exists = inventory.find(i => i.sku === item.sku);
  if (!exists) {
    inventory.push(item);
    added++;
  }
});

// Save
fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2));
console.log(`✅ Added ${added} new items`);
console.log(`📦 Total inventory items: ${inventory.length}`);
console.log(`\nInventory seeded successfully!`);
console.log(`File: ${INVENTORY_FILE}`);
