import { ObjectId } from 'mongodb'

export interface ProductImage {
  id: string
  url: string
  alt?: string
  position: number
}

export interface ProductVariant {
  id: string
  name: string
  options: string[]
  price?: number
  sku?: string
  stock?: number
}

export interface MongoProduct {
  _id?: ObjectId
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
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}