import fs from 'fs/promises'
import path from 'path'
import { AuthData, User, TempUser, Session, ResetToken } from '../models/auth'

const DB_PATH = process.env.DB_PATH || './data/auth.json'

// Initialize database if it doesn't exist
const initializeDatabase = async (): Promise<void> => {
  try {
    await fs.access(DB_PATH)
  } catch {
    const initialData: AuthData = {
      users: [],
      tempUsers: [],
      sessions: [],
      resetTokens: []
    }
    
    // Ensure directory exists
    const dir = path.dirname(DB_PATH)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2))
  }
}

// Read database
export const readDatabase = async (): Promise<AuthData> => {
  await initializeDatabase()
  
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading database:', error)
    return { users: [], tempUsers: [], sessions: [], resetTokens: [] }
  }
}

// Write database
export const writeDatabase = async (data: AuthData): Promise<void> => {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing database:', error)
    throw new Error('Database write failed')
  }
}

// User operations
export const findUserByEmail = async (email: string): Promise<User | null> => {
  const data = await readDatabase()
  return data.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null
}

export const findUserById = async (id: string): Promise<User | null> => {
  const data = await readDatabase()
  return data.users.find(user => user.id === id) || null
}

// Reset token operations
export const storeResetTokenInDb = async (resetToken: ResetToken): Promise<void> => {
  const data = await readDatabase()
  data.resetTokens.push(resetToken)
  await writeDatabase(data)
}

export const findResetToken = async (token: string): Promise<ResetToken | null> => {
  const data = await readDatabase()
  return data.resetTokens.find(rt => rt.token === token) || null
}

export const deleteResetToken = async (token: string): Promise<void> => {
  const data = await readDatabase()
  data.resetTokens = data.resetTokens.filter(rt => rt.token !== token)
  await writeDatabase(data)
}

export const cleanupExpiredResetTokens = async (): Promise<void> => {
  const data = await readDatabase()
  const now = new Date()
  data.resetTokens = data.resetTokens.filter(rt => new Date(rt.expiresAt) > now)
  await writeDatabase(data)
}

export const createUser = async (user: User): Promise<User> => {
  const data = await readDatabase()
  data.users.push(user)
  await writeDatabase(data)
  return user
}

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  const data = await readDatabase()
  const userIndex = data.users.findIndex(user => user.id === id)
  
  if (userIndex === -1) {
    return null
  }
  
  data.users[userIndex] = { ...data.users[userIndex], ...updates, updatedAt: new Date().toISOString() }
  await writeDatabase(data)
  return data.users[userIndex]
}

// Temporary user operations
export const findTempUserByEmail = async (email: string): Promise<TempUser | null> => {
  const data = await readDatabase()
  return data.tempUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null
}

export const createTempUser = async (tempUser: TempUser): Promise<TempUser> => {
  const data = await readDatabase()
  
  // Remove existing temp user with same email
  data.tempUsers = data.tempUsers.filter(user => user.email.toLowerCase() !== tempUser.email.toLowerCase())
  
  data.tempUsers.push(tempUser)
  await writeDatabase(data)
  return tempUser
}

export const deleteTempUser = async (email: string): Promise<void> => {
  const data = await readDatabase()
  data.tempUsers = data.tempUsers.filter(user => user.email.toLowerCase() !== email.toLowerCase())
  await writeDatabase(data)
}

export const updateTempUser = async (email: string, updates: Partial<TempUser>): Promise<TempUser | null> => {
  const data = await readDatabase()
  const userIndex = data.tempUsers.findIndex(user => user.email.toLowerCase() === email.toLowerCase())
  
  if (userIndex === -1) {
    return null
  }
  
  data.tempUsers[userIndex] = { ...data.tempUsers[userIndex], ...updates }
  await writeDatabase(data)
  return data.tempUsers[userIndex]
}

// Session operations
export const createSession = async (session: Session): Promise<Session> => {
  const data = await readDatabase()
  data.sessions.push(session)
  await writeDatabase(data)
  return session
}

export const findSessionByToken = async (token: string): Promise<Session | null> => {
  const data = await readDatabase()
  return data.sessions.find(session => session.token === token) || null
}

export const deleteSession = async (token: string): Promise<void> => {
  const data = await readDatabase()
  data.sessions = data.sessions.filter(session => session.token !== token)
  await writeDatabase(data)
}

export const deleteUserSessions = async (userId: string): Promise<void> => {
  const data = await readDatabase()
  data.sessions = data.sessions.filter(session => session.userId !== userId)
  await writeDatabase(data)
}

export const updateSessionAccess = async (token: string): Promise<void> => {
  const data = await readDatabase()
  const sessionIndex = data.sessions.findIndex(session => session.token === token)
  
  if (sessionIndex !== -1) {
    data.sessions[sessionIndex].lastAccessAt = new Date().toISOString()
    await writeDatabase(data)
  }
}

// Cleanup operations
export const cleanupExpiredTempUsers = async (): Promise<void> => {
  const data = await readDatabase()
  const now = new Date()
  
  data.tempUsers = data.tempUsers.filter(user => new Date(user.expiresAt) > now)
  await writeDatabase(data)
}

export const cleanupExpiredSessions = async (): Promise<void> => {
  const data = await readDatabase()
  const now = new Date()
  
  data.sessions = data.sessions.filter(session => new Date(session.expiresAt) > now)
  await writeDatabase(data)
}