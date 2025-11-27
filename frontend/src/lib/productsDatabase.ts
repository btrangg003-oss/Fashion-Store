import fs from 'fs/promises'
import path from 'path'
import { Product, ProductsData, Category } from '../types/products'

const PRODUCTS_DB_PATH = process.env.PRODUCTS_DB_PATH || './data/products.json'

// Initialize products database
const initializeProductsDatabase = async (): Promise<void> => {
  try {
    await fs.access(PRODUCTS_DB_PATH)
  } catch {
    const initialData: ProductsData = {
      products: [],
      categories: [
        { id: 'ao', name: 'Áo', slug: 'ao', description: 'Các loại áo thời trang' },
        { id: 'quan', name: 'Quần', slug: 'quan', description: 'Các loại quần thời trang' },
        { id: 'giay', name: 'Giày', slug: 'giay', description: 'Giày dép thời trang' },
        { id: 'phu-kien', name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện thời trang' }
      ]
    }
    
    const dir = path.dirname(PRODUCTS_DB_PATH)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(PRODUCTS_DB_PATH, JSON.stringify(initialData, null, 2))
  }
}

// Read products database
export const readProductsDatabase = async (): Promise<ProductsData> => {
  await initializeProductsDatabase()
  
  try {
    const data = await fs.readFile(PRODUCTS_DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading products database:', error)
    return { products: [], categories: [] }
  }
}

// Write products database
export const writeProductsDatabase = async (data: ProductsData): Promise<void> => {
  try {
    await fs.writeFile(PRODUCTS_DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing products database:', error)
    throw new Error('Products database write failed')
  }
}

// Read all products (alias for compatibility)
export const readProducts = async (): Promise<Product[]> => {
  const data = await readProductsDatabase()
  return data.products
}

// Products operations
export const getAllProducts = async (): Promise<Product[]> => {
  const data = await readProductsDatabase()
  return data.products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const getProductById = async (id: string): Promise<Product | null> => {
  const data = await readProductsDatabase()
  return data.products.find(product => product.id === id) || null
}

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  const data = await readProductsDatabase()
  return data.products.filter(product => product.categoryId === categoryId)
}

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const data = await readProductsDatabase()
  
  const newProduct: Product = {
    ...product,
    id: generateProductId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  data.products.push(newProduct)
  await writeProductsDatabase(data)
  return newProduct
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  const data = await readProductsDatabase()
  const productIndex = data.products.findIndex(product => product.id === id)
  
  if (productIndex === -1) {
    return null
  }
  
  data.products[productIndex] = {
    ...data.products[productIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  await writeProductsDatabase(data)
  return data.products[productIndex]
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  const data = await readProductsDatabase()
  const initialLength = data.products.length
  
  data.products = data.products.filter(product => product.id !== id)
  
  if (data.products.length < initialLength) {
    await writeProductsDatabase(data)
    return true
  }
  
  return false
}

export const updateProductStock = async (id: string, quantity: number): Promise<Product | null> => {
  const data = await readProductsDatabase()
  const productIndex = data.products.findIndex(product => product.id === id)
  
  if (productIndex === -1) {
    return null
  }
  
  data.products[productIndex].stock = quantity
  data.products[productIndex].updatedAt = new Date().toISOString()
  
  await writeProductsDatabase(data)
  return data.products[productIndex]
}

// Categories operations
export const getAllCategories = async (): Promise<Category[]> => {
  const data = await readProductsDatabase()
  return data.categories
}

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const data = await readProductsDatabase()
  
  const newCategory: Category = {
    ...category,
    id: generateCategoryId()
  }
  
  data.categories.push(newCategory)
  await writeProductsDatabase(data)
  return newCategory
}

// Search and filter
export const searchProducts = async (query: string): Promise<Product[]> => {
  const data = await readProductsDatabase()
  const searchTerm = query.toLowerCase()
  
  return data.products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
  )
}

export const getProductsWithFilters = async (filters: {
  categoryId?: string
  status?: 'active' | 'inactive'
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}): Promise<Product[]> => {
  const data = await readProductsDatabase()
  let filtered = data.products
  
  if (filters.categoryId) {
    filtered = filtered.filter(p => p.categoryId === filters.categoryId)
  }
  
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status)
  }
  
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= filters.minPrice!)
  }
  
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= filters.maxPrice!)
  }
  
  if (filters.inStock !== undefined) {
    filtered = filtered.filter(p => filters.inStock ? p.stock > 0 : p.stock === 0)
  }
  
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Analytics
export const getProductAnalytics = async () => {
  const data = await readProductsDatabase()
  const products = data.products
  
  return {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    inactiveProducts: products.filter(p => p.status === 'inactive').length,
    inStockProducts: products.filter(p => p.stock > 0).length,
    outOfStockProducts: products.filter(p => p.stock === 0).length,
    lowStockProducts: products.filter(p => p.stock > 0 && p.stock <= 10).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + p.price, 0) / products.length : 0,
    categoriesCount: data.categories.length
  }
}

// Utility functions
export const generateProductId = (): string => {
  return `prod_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export const generateCategoryId = (): string => {
  return `cat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

export const generateSKU = (categoryId: string, name: string): string => {
  const categoryCode = categoryId.toUpperCase().substring(0, 3)
  const nameCode = name.replace(/\s+/g, '').toUpperCase().substring(0, 3)
  const timestamp = Date.now().toString().slice(-4)
  return `${categoryCode}-${nameCode}-${timestamp}`
}