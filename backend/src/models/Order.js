const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: String,
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  image: String
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: String,
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  postalCode: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Order Info
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: String,
  customerEmail: String,
  customerName: String,
  customerPhone: String,

  // Items
  items: [orderItemSchema],

  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['cod', 'bank_transfer', 'credit_card', 'momo'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paidAt: Date,
  transactionId: String,
  paymentFailureReason: String,

  // Shipping
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  trackingNumber: String,
  notes: String,

  // Inventory Integration
  inventoryStatus: {
    type: String,
    enum: ['pending', 'reserved', 'picked', 'packed', 'shipped']
  },
  outboundId: String,
  outboundNumber: String,
  reservedAt: Date,
  pickedAt: Date,
  packedAt: Date,
  shippedAt: Date,

  // Timestamps
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  verificationNote: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.phone': 1 });

// Virtual: Total items
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual: Can cancel
orderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual: Can refund
orderSchema.virtual('canRefund').get(function() {
  return this.status === 'delivered' && this.paymentStatus === 'paid';
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Find last order of the day
    const lastOrder = await this.constructor
      .findOne({ orderNumber: new RegExp(`^ORD${year}${month}${day}`) })
      .sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `ORD${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Static: Find by user
orderSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static: Find pending orders
orderSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

// Method: Mark as paid
orderSchema.methods.markAsPaid = function(transactionId) {
  this.paymentStatus = 'paid';
  this.paidAt = new Date();
  if (transactionId) this.transactionId = transactionId;
};

// Method: Cancel order
orderSchema.methods.cancel = function(reason) {
  if (!this.canCancel) {
    throw new Error('Order cannot be cancelled');
  }
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
