// Inventory Type Definitions

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
export type MovementType = 'inbound' | 'outbound' | 'adjustment' | 'check';
export type InboundType = 'new_stock' | 'return' | 'adjustment';
export type OutboundType = 'sale' | 'online_order' | 'return_to_supplier' | 'damaged';
export type CheckStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'approved';

export interface BatchInfo {
  batchNumber: string;
  manufactureDate?: string;
  expiryDate?: string;
  quantity: number;
  supplier?: string;
  notes?: string;
  createdAt: string;
}

export interface SerialInfo {
  serialNumber: string;
  status: 'available' | 'sold' | 'returned' | 'damaged';
  soldAt?: string;
  soldTo?: string;
  orderId?: string;
  notes?: string;
}

export type TrackingType = 'none' | 'batch' | 'serial';

export interface PickingLocation {
  warehouseZone: string;    // A, B, C
  aisle: string;            // Lối đi 1, 2, 3
  shelf: string;            // Kệ 1, 2, 3
  bin: string;              // Ngăn A, B, C
  level: number;            // Tầng 1, 2, 3
  fullLocation?: string;    // "A-1-2-B-3" (auto-generated)
}

export interface InventoryItem {
  id: string;
  productId: string;
  sku: string;
  barcode?: string;
  name: string;
  image?: string;
  category: string;
  
  // Stock info
  quantity: number;
  minQuantity: number; // Low stock threshold
  maxQuantity: number; // Overstock threshold
  location: string; // Vị trí trong kho (legacy)
  pickingLocation?: PickingLocation; // Vị trí chi tiết
  
  // Tracking
  trackingType: TrackingType;
  batches?: BatchInfo[];
  serials?: SerialInfo[];
  
  // Pricing
  costPrice: number; // Giá nhập
  sellingPrice: number; // Giá bán
  
  // Supplier
  supplierId?: string;
  supplierName?: string;
  
  // Status
  status: StockStatus;
  
  // Metadata
  lastStockCheck?: string;
  lastMovement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  receiptNumber: string; // INB-YYYYMMDD-XXX or OUT-YYYYMMDD-XXX
  type: MovementType;
  subType?: InboundType | OutboundType;
  
  // Reference
  referenceId?: string; // Order ID, Check ID, etc.
  referenceType?: string;
  orderId?: string;
  orderNumber?: string;
  autoCreated?: boolean;
  
  // Items
  items: StockMovementItem[];
  
  // Details
  reason: string;
  notes?: string;
  
  // Documents
  invoiceNumber?: string;
  attachments?: string[]; // URLs to uploaded files
  
  // People
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  
  // Supplier (for inbound)
  supplierId?: string;
  supplierName?: string;
  
  // Customer (for outbound)
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  
  // Calculation
  subtotal: number;
  vatRate: number; // 0, 5, 10
  vatAmount: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number;
  finalTotal: number;
  
  // Cost & Profit (for outbound)
  totalCost?: number;
  profit?: number;
  profitMargin?: number;
  
  // Payment
  paymentMethod: string[]; // ['cash', 'transfer', 'card', 'debt', 'cod']
  paidAmount: number;
  debtAmount: number;
  
  // Shipping (for outbound)
  shippingCarrier?: 'ghn' | 'ghtk' | 'viettel_post' | 'vnpost';
  shippingOrderCode?: string;
  shippingFee?: number;
  shippingExpectedDelivery?: string;
  shippingCreatedAt?: string;
  shippingStatus?: string;
  
  // Totals
  totalValue: number;
  totalItems: number;
  
  // Photos
  photos?: Array<{
    id: string;
    url: string;
    type: 'before' | 'after' | 'label' | 'quality';
    uploadedAt: string;
    notes?: string;
  }>;
  
  // Status
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  
  // History
  history: MovementHistory[];
  
  // Timestamps
  receiptDate: string;
  movementDate: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MovementHistory {
  action: string;
  by: string;
  byName: string;
  at: string;
  note?: string;
}

export interface PickingTask {
  id: string;
  productId: string;
  sku: string;
  name: string;
  image?: string;
  quantity: number;
  location: PickingLocation;
  pickingOrder: number;      // Thứ tự lấy hàng
  picked: boolean;
  pickedAt?: string;
  pickedBy?: string;
  notes?: string;
}

export interface StockMovementItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  costPrice: number;
  totalValue: number;
  
  // Before/After for tracking
  quantityBefore?: number;
  quantityAfter?: number;
  
  // Batch & Serial tracking
  trackingType?: TrackingType;
  batches?: BatchInfo[];
  serials?: SerialInfo[];
  
  // Single batch info (for inbound)
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  
  // Picking location
  pickingLocation?: PickingLocation;
  pickingOrder?: number;
  picked?: boolean;
  pickedAt?: string;
}

export interface StockCheck {
  id: string;
  checkNumber: string; // CHK-YYYYMMDD-XXX
  name: string;
  description?: string;
  
  // Scope
  scope?: {
    type: 'all' | 'category' | 'location' | 'custom';
    categories?: string[];
    locations?: string[];
    skus?: string[];
  };
  warehouseId?: string;
  categoryIds?: string[];
  
  // Status
  status: CheckStatus;
  
  // Items
  items: StockCheckItem[];
  
  // Results
  totalItems: number;
  checkedItems: number;
  matchedItems: number;
  discrepancyItems: number;
  discrepancies: number;
  totalDiscrepancyValue: number;
  accuracyRate: number;
  
  // People
  assignedTo: string[];
  createdBy: string;
  createdByName: string;
  approvedBy?: string;
  approvedByName?: string;
  
  // Timestamps
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockCheckItem {
  productId: string;
  sku: string;
  name: string;
  
  // Quantities
  systemQuantity: number;
  actualQuantity?: number;
  discrepancy?: number;
  
  // Values
  costPrice: number;
  discrepancyValue?: number;
  
  // Status
  checked: boolean;
  notes?: string;
  
  // Timestamps
  checkedAt?: string;
  checkedBy?: string;
}

export interface Supplier {
  id: string;
  code: string; // Mã NCC
  name: string;
  companyName: string;
  taxCode?: string;
  
  // Contact
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  
  // Business
  paymentTerms?: string; // Net 30, Net 60, etc.
  currency: string;
  
  // Stats
  totalOrders: number;
  totalValue: number;
  averageDeliveryTime: number; // days
  rating: number; // 1-5
  
  // Status
  isActive: boolean;
  
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'overstock' | 'expiring' | 'discrepancy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Product
  productId: string;
  sku: string;
  productName: string;
  
  // Details
  message: string;
  currentQuantity?: number;
  threshold?: number;
  expiryDate?: string;
  
  // Status
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalSKUs: number;
  totalValue: number;
  
  // Stock status
  inStock: number;
  lowStock: number;
  outOfStock: number;
  overstock: number;
  
  // Percentages
  lowStockPercentage: number;
  outOfStockPercentage: number;
  
  // Movements
  totalInbound: number;
  totalOutbound: number;
  totalAdjustments: number;
  
  // Alerts
  activeAlerts: number;
  criticalAlerts: number;
}

export interface CategoryStock {
  category: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
}

export interface SupplierStock {
  supplierId: string;
  supplierName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
}

export interface TopProduct {
  productId: string;
  sku: string;
  name: string;
  image?: string;
  soldQuantity: number;
  revenue: number;
}
