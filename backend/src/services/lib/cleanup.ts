import { readDatabase, writeDatabase } from './database'
import { AuthData } from '../models/auth'

// Cleanup expired temporary users (older than 10 minutes)
export const cleanupExpiredTempUsers = async (): Promise<number> => {
  try {
    const data = await readDatabase()
    const now = new Date()
    const initialCount = data.tempUsers.length
    
    data.tempUsers = data.tempUsers.filter(user => {
      const expiresAt = new Date(user.expiresAt)
      return expiresAt > now
    })
    
    const removedCount = initialCount - data.tempUsers.length
    
    if (removedCount > 0) {
      await writeDatabase(data)
      console.log(`Cleaned up ${removedCount} expired temporary users`)
    }
    
    return removedCount
  } catch (error) {
    console.error('Error cleaning up expired temp users:', error)
    return 0
  }
}

// Cleanup expired sessions
export const cleanupExpiredSessions = async (): Promise<number> => {
  try {
    const data = await readDatabase()
    const now = new Date()
    const initialCount = data.sessions.length
    
    data.sessions = data.sessions.filter(session => {
      const expiresAt = new Date(session.expiresAt)
      return expiresAt > now
    })
    
    const removedCount = initialCount - data.sessions.length
    
    if (removedCount > 0) {
      await writeDatabase(data)
      console.log(`Cleaned up ${removedCount} expired sessions`)
    }
    
    return removedCount
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    return 0
  }
}

// Cleanup old temporary users that have exceeded max attempts
export const cleanupFailedTempUsers = async (): Promise<number> => {
  try {
    const data = await readDatabase()
    const initialCount = data.tempUsers.length
    const maxAttempts = 5
    
    data.tempUsers = data.tempUsers.filter(user => {
      return user.attempts < maxAttempts
    })
    
    const removedCount = initialCount - data.tempUsers.length
    
    if (removedCount > 0) {
      await writeDatabase(data)
      console.log(`Cleaned up ${removedCount} failed temporary users`)
    }
    
    return removedCount
  } catch (error) {
    console.error('Error cleaning up failed temp users:', error)
    return 0
  }
}

// Run all cleanup operations
export const runCleanup = async (): Promise<{
  expiredTempUsers: number
  expiredSessions: number
  failedTempUsers: number
}> => {
  console.log('Starting database cleanup...')
  
  const results = {
    expiredTempUsers: await cleanupExpiredTempUsers(),
    expiredSessions: await cleanupExpiredSessions(),
    failedTempUsers: await cleanupFailedTempUsers()
  }
  
  const totalCleaned = results.expiredTempUsers + results.expiredSessions + results.failedTempUsers
  console.log(`Cleanup completed. Total items removed: ${totalCleaned}`)
  
  return results
}

// Get database statistics
export const getDatabaseStats = async (): Promise<{
  totalUsers: number
  verifiedUsers: number
  unverifiedUsers: number
  tempUsers: number
  activeSessions: number
  expiredTempUsers: number
  expiredSessions: number
}> => {
  try {
    const data = await readDatabase()
    const now = new Date()
    
    const verifiedUsers = data.users.filter(user => user.isVerified).length
    const unverifiedUsers = data.users.filter(user => !user.isVerified).length
    
    const expiredTempUsers = data.tempUsers.filter(user => 
      new Date(user.expiresAt) <= now
    ).length
    
    const expiredSessions = data.sessions.filter(session => 
      new Date(session.expiresAt) <= now
    ).length
    
    return {
      totalUsers: data.users.length,
      verifiedUsers,
      unverifiedUsers,
      tempUsers: data.tempUsers.length,
      activeSessions: data.sessions.length,
      expiredTempUsers,
      expiredSessions
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      unverifiedUsers: 0,
      tempUsers: 0,
      activeSessions: 0,
      expiredTempUsers: 0,
      expiredSessions: 0
    }
  }
}

// Backup database
export const backupDatabase = async (): Promise<string> => {
  try {
    const data = await readDatabase()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `./data/auth-backup-${timestamp}.json`
    
    const fs = await import('fs/promises')
    await fs.writeFile(backupPath, JSON.stringify(data, null, 2))
    
    console.log(`Database backed up to: ${backupPath}`)
    return backupPath
  } catch (error) {
    console.error('Error backing up database:', error)
    throw new Error('Database backup failed')
  }
}

// Initialize cleanup scheduler (run every hour)
let cleanupInterval: NodeJS.Timeout | null = null

export const startCleanupScheduler = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
  
  // Run cleanup every hour (3600000 ms)
  cleanupInterval = setInterval(async () => {
    await runCleanup()
  }, 3600000)
  
  console.log('Cleanup scheduler started (runs every hour)')
}

export const stopCleanupScheduler = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
    console.log('Cleanup scheduler stopped')
  }
}

// Run cleanup on module load in production
if (process.env.NODE_ENV === 'production') {
  // Run initial cleanup after 30 seconds
  setTimeout(async () => {
    await runCleanup()
    startCleanupScheduler()
  }, 30000)
}