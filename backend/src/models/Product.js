const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  altText: String,
  position: {
    type: Number,
    default: 0
  }
}, { _id: false });

const productVariantSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  comparePrice: Number,
  sku: String,
  barcode: String,
  stock: {
    type: Number,
    default: 0
  },
  weight: Number,
  options: [{
    name: String,
    value: String
  }]
}, { _id: true });

const productSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },

  // Pricing
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },

  // Inventory
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: String,
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  trackQuantity: {
    type: Boolean,
    default: true
  },

  // Category & Organization
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [String],
  vendor: String,
  productType: String,

  // Media
  images: [productImageSchema],
  featuredImage: String,

  // SEO & Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden'],
    default: 'visible'
  },
  metaTitle: String,
  metaDescription: String,

  // Variants
  variants: [productVariantSchema],

  // Shipping
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  requiresShipping: {
    type: Boolean,
    default: true
  },

  // Stats
  viewCount: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },

  // Timestamps
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ categoryId: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ salesCount: -1 });

// Virtual: Is on sale
productSchema.virtual('isOnSale').get(function() {
  return this.comparePrice && this.comparePrice > this.price;
});

// Virtual: Discount percentage
productSchema.virtual('discountPercent').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Virtual: Is low stock
productSchema.virtual('isLowStock').get(function() {
  return this.trackQuantity && this.stock <= this.lowStockThreshold;
});

// Virtual: Is out of stock
productSchema.virtual('isOutOfStock').get(function() {
  return this.trackQuantity && this.stock === 0;
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Static: Find active products
productSchema.statics.findActive = function() {
  return this.find({ status: 'active', visibility: 'visible' });
};

// Static: Find by category
productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ categoryId, status: 'active', visibility: 'visible' });
};

// Static: Search products
productSchema.statics.search = function(query) {
  return this.find(
    { $text: { $search: query }, status: 'active', visibility: 'visible' },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
