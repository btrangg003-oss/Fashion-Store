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
  
  categoryId: string
  tags?: string[]
  vendor?: string
  productType?: string
  
  images: ProductImage[]
  featuredImage?: string
  
  status: 'active' | 'inactive' | 'draft'
  visibility: 'visible' | 'hidden'
  metaTitle?: string
  metaDescription?: string
  slug: string
  
  variants?: ProductVariant[]
  
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  requiresShipping: boolean
  
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
  name: string
  value: string
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
