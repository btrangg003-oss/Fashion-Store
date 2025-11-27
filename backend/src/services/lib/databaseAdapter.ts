// Database Adapter - Switch between JSON and MongoDB
import * as jsonDb from './database'
import * as mongoDb from './mongoDatabase'

const isDatabaseMongoDB = process.env.DATABASE_MODE === 'mongodb'

// User operations
export const createUser = isDatabaseMongoDB ? mongoDb.createUser : jsonDb.createUser
export const findUserByEmail = isDatabaseMongoDB ? mongoDb.findUserByEmail : jsonDb.findUserByEmail
export const findUserById = isDatabaseMongoDB ? mongoDb.findUserById : jsonDb.findUserById
export const updateUser = isDatabaseMongoDB ? mongoDb.updateUser : jsonDb.updateUser
export const deleteUser = isDatabaseMongoDB ? mongoDb.deleteUser : jsonDb.deleteUser

// Temp User operations
export const createTempUser = isDatabaseMongoDB ? mongoDb.createTempUser : jsonDb.createTempUser
export const findTempUserByEmail = isDatabaseMongoDB ? mongoDb.findTempUserByEmail : jsonDb.findTempUserByEmail
export const deleteTempUser = isDatabaseMongoDB ? mongoDb.deleteTempUser : jsonDb.deleteTempUser

// Order operations
export const createOrder = isDatabaseMongoDB ? mongoDb.createOrder : jsonDb.createOrder
export const findOrderById = isDatabaseMongoDB ? mongoDb.findOrderById : jsonDb.getOrderById
export const findOrdersByUserId = isDatabaseMongoDB ? mongoDb.findOrdersByUserId : jsonDb.getUserOrders
export const getAllOrders = isDatabaseMongoDB ? mongoDb.getAllOrders : jsonDb.getAllOrders
export const updateOrderStatus = isDatabaseMongoDB ? mongoDb.updateOrderStatus : jsonDb.updateOrderStatus

// Product operations (if you have JSON product operations)
export const createProduct = isDatabaseMongoDB ? mongoDb.createProduct : undefined
export const findProductById = isDatabaseMongoDB ? mongoDb.findProductById : undefined
export const getAllProducts = isDatabaseMongoDB ? mongoDb.getAllProducts : undefined
export const updateProduct = isDatabaseMongoDB ? mongoDb.updateProduct : undefined
export const deleteProduct = isDatabaseMongoDB ? mongoDb.deleteProduct : undefined

// Wishlist operations
export const getUserWishlist = isDatabaseMongoDB ? mongoDb.getUserWishlist : jsonDb.getUserWishlist
export const addToWishlist = isDatabaseMongoDB ? mongoDb.addToWishlist : jsonDb.addToWishlist
export const removeFromWishlist = isDatabaseMongoDB ? mongoDb.removeFromWishlist : jsonDb.removeFromWishlist

// Helper function to check database mode
export const isDatabaseMode = (mode: 'json' | 'mongodb') => {
  if (mode === 'mongodb') return isDatabaseMongoDB
  return !isDatabaseMongoDB
}

// Migration helper
export const getDatabaseMode = () => process.env.DATABASE_MODE || 'json'