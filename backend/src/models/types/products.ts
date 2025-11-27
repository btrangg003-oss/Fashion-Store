export interface Product {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number
  cost?: number
  sku: string
  barcode?: string
  stock: number
  lowStockThreshold?: number
  trackQuantity: boolean
  
  // Category and organization
  categoryId: string
  tags?: string[]
  vendor?: string
  productType?: string
  
  // Media
  images: ProductImage[]
  featuredImage?: string
  
  // SEO and visibility
  status: 'active' | 'inactive' | 'draft'
  visibility: 'visible' | 'hidden'
  metaTitle?: string
  metaDescription?: string
  slug: string
  
  // Variants (for different sizes, colors, etc.)
  variants?: ProductVariant[]
  
  // Shipping
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  requiresShipping: boolean
  
  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  position: number
}

export interface ProductVariant {
  id: string
  title: string
  price: number
  comparePrice?: number
  sku: string
  barcode?: string
  stock: number
  weight?: number
  options: VariantOption[]
  image?: ProductImage
}

export interface VariantOption {
  name: string // e.g., "Size", "Color"
  value: string // e.g., "Large", "Red"
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  metaTitle?: string
  metaDescription?: string
  sortOrder?: number
}

export interface ProductsData {
  products: Product[]
  categories: Category[]
}

// Filter and search types
export interface ProductFilters {
  categoryId?: string
  status?: Product['status']
  visibility?: Product['visibility']
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  lowStock?: boolean
  tags?: string[]
  vendor?: string
  query?: string
}

export interface ProductSortOptions {
  field: 'name' | 'price' | 'stock' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

// Analytics types
export interface ProductAnalytics {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  draftProducts: number
  inStockProducts: number
  outOfStockProducts: number
  lowStockProducts: number
  totalValue: number
  averagePrice: number
  categoriesCount: number
  topCategories: Array<{
    categoryId: string
    categoryName: string
    productCount: number
    totalValue: number
  }>
  recentlyAdded: Product[]
  needsAttention: Product[] // Low stock, no images, etc.
}

// Form types for creating/editing
export interface CreateProductData {
  name: string
  description: string
  price: number
  comparePrice?: number
  cost?: number
  sku?: string
  stock: number
  categoryId: string
  tags?: string[]
  vendor?: string
  status: Product['status']
  visibility: Product['visibility']
  images?: File[]
  weight?: number
  requiresShipping: boolean
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

// Bulk operations
export interface BulkProductOperation {
  type: 'update_status' | 'update_category' | 'update_price' | 'delete'
  productIds: string[]
  data?: any
}

// Import/Export
export interface ProductImportData {
  name: string
  description: string
  price: number
  sku: string
  stock: number
  categoryName: string
  tags?: string
  vendor?: string
  status?: string
}

export interface ProductExportData extends Product {
  categoryName: string
  totalValue: number
}