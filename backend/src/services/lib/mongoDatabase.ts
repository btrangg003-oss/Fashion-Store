import { getDatabase } from './mongodb'
import { User, TempUser } from './models/User'
import { MongoOrder, WishlistItem } from './models/Order'
import { MongoProduct } from './models/Product'
import { ObjectId } from 'mongodb'

// User operations
export async function createUser(userData: Omit<User, '_id'>): Promise<User> {
  const db = await getDatabase()
  const result = await db.collection<User>('users').insertOne({
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  return {
    _id: result.insertedId,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getDatabase()
  return await db.collection<User>('users').findOne({ email })
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDatabase()
  return await db.collection<User>('users').findOne({ id })
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const db = await getDatabase()
  const result = await db.collection<User>('users').findOneAndUpdate(
    { id },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  )
  
  return result.value
}

export async function deleteUser(id: string): Promise<boolean> {
  const db = await getDatabase()
  const result = await db.collection<User>('users').deleteOne({ id })
  return result.deletedCount > 0
}

// Temp User operations
export async function createTempUser(tempUserData: Omit<TempUser, '_id'>): Promise<TempUser> {
  const db = await getDatabase()
  const result = await db.collection<TempUser>('temp_users').insertOne({
    ...tempUserData,
    createdAt: new Date()
  })
  
  return {
    _id: result.insertedId,
    ...tempUserData,
    createdAt: new Date()
  }
}

export async function findTempUserByEmail(email: string): Promise<TempUser | null> {
  const db = await getDatabase()
  return await db.collection<TempUser>('temp_users').findOne({ email })
}

export async function deleteTempUser(email: string): Promise<boolean> {
  const db = await getDatabase()
  const result = await db.collection<TempUser>('temp_users').deleteOne({ email })
  return result.deletedCount > 0
}

// Order operations
export async function createOrder(orderData: Omit<MongoOrder, '_id'>): Promise<MongoOrder> {
  const db = await getDatabase()
  const result = await db.collection<MongoOrder>('orders').insertOne({
    ...orderData,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  return {
    _id: result.insertedId,
    ...orderData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function findOrderById(id: string, userId?: string): Promise<MongoOrder | null> {
  const db = await getDatabase()
  const query = userId ? { id, userId } : { id }
  return await db.collection<MongoOrder>('orders').findOne(query)
}

export async function findOrdersByUserId(userId: string): Promise<MongoOrder[]> {
  const db = await getDatabase()
  return await db.collection<MongoOrder>('orders')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getAllOrders(): Promise<MongoOrder[]> {
  const db = await getDatabase()
  return await db.collection<MongoOrder>('orders')
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
}

export async function updateOrderStatus(
  orderId: string, 
  userId: string, 
  status: MongoOrder['status'],
  additionalData?: Partial<MongoOrder>
): Promise<MongoOrder | null> {
  const db = await getDatabase()
  const query = userId ? { id: orderId, userId } : { id: orderId }
  
  const result = await db.collection<MongoOrder>('orders').findOneAndUpdate(
    query,
    { 
      $set: { 
        status,
        updatedAt: new Date(),
        ...additionalData
      } 
    },
    { returnDocument: 'after' }
  )
  
  return result.value
}

// Product operations
export async function createProduct(productData: Omit<MongoProduct, '_id'>): Promise<MongoProduct> {
  const db = await getDatabase()
  const result = await db.collection<MongoProduct>('products').insertOne({
    ...productData,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  return {
    _id: result.insertedId,
    ...productData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

export async function findProductById(id: string): Promise<MongoProduct | null> {
  const db = await getDatabase()
  return await db.collection<MongoProduct>('products').findOne({ id })
}

export async function getAllProducts(): Promise<MongoProduct[]> {
  const db = await getDatabase()
  return await db.collection<MongoProduct>('products')
    .find({ status: { $ne: 'draft' } })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function updateProduct(id: string, updates: Partial<MongoProduct>): Promise<MongoProduct | null> {
  const db = await getDatabase()
  const result = await db.collection<MongoProduct>('products').findOneAndUpdate(
    { id },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: 'after' }
  )
  
  return result.value
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getDatabase()
  const result = await db.collection<MongoProduct>('products').deleteOne({ id })
  return result.deletedCount > 0
}

// Wishlist operations
export async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  const db = await getDatabase()
  return await db.collection<WishlistItem>('wishlist')
    .find({ userId })
    .sort({ addedAt: -1 })
    .toArray()
}

export async function addToWishlist(wishlistItem: Omit<WishlistItem, '_id'>): Promise<WishlistItem> {
  const db = await getDatabase()
  
  // Remove existing item if already in wishlist
  await db.collection<WishlistItem>('wishlist').deleteOne({
    userId: wishlistItem.userId,
    productId: wishlistItem.productId
  })
  
  const result = await db.collection<WishlistItem>('wishlist').insertOne({
    ...wishlistItem,
    addedAt: new Date()
  })
  
  return {
    _id: result.insertedId,
    ...wishlistItem,
    addedAt: new Date()
  }
}

export async function removeFromWishlist(userId: string, productId: string): Promise<boolean> {
  const db = await getDatabase()
  const result = await db.collection<WishlistItem>('wishlist').deleteOne({
    userId,
    productId
  })
  return result.deletedCount > 0
}