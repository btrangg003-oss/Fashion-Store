import { NextApiRequest, NextApiResponse } from 'next'
import { cleanupExpiredTempUsers, cleanupExpiredSessions } from '../services/database'
import { clearCompletedJobs } from '../services/emailQueue'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development mode or with admin access
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Cleanup operations are only available in development mode'
    })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const results = {
      tempUsersCleanup: false,
      sessionsCleanup: false,
      emailJobsCleanup: false,
      errors: [] as string[]
    }

    // Cleanup expired temp users
    try {
      await cleanupExpiredTempUsers()
      results.tempUsersCleanup = true
    } catch (error) {
      results.errors.push(`Temp users cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Cleanup expired sessions
    try {
      await cleanupExpiredSessions()
      results.sessionsCleanup = true
    } catch (error) {
      results.errors.push(`Sessions cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Cleanup completed email jobs
    try {
      const clearedJobs = clearCompletedJobs()
      results.emailJobsCleanup = true
      console.log(`Cleared ${clearedJobs} completed email jobs`)
    } catch (error) {
      results.errors.push(`Email jobs cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    const success = results.errors.length === 0

    return res.status(success ? 200 : 207).json({
      success,
      message: success ? 'Cleanup completed successfully' : 'Cleanup completed with some errors',
      data: results
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return res.status(500).json({
      success: false,
      message: 'Cleanup operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}