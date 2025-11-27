import { NextApiRequest, NextApiResponse } from 'next'
import { readDatabase } from '../services/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Database inspection is only available in development mode'
    })
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const data = await readDatabase()
    
    // Create summary without exposing sensitive data
    const summary = {
      users: {
        total: data.users.length,
        verified: data.users.filter(u => u.isVerified).length,
        unverified: data.users.filter(u => !u.isVerified).length,
        recent: data.users
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(u => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            isEmailVerified: u.isVerified,
            createdAt: u.createdAt
          }))
      },
      tempUsers: {
        total: data.tempUsers.length,
        expired: data.tempUsers.filter(tu => new Date(tu.expiresAt) < new Date()).length,
        active: data.tempUsers.filter(tu => new Date(tu.expiresAt) >= new Date()).length,
        recent: data.tempUsers
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(tu => ({
            email: tu.email,
            firstName: tu.firstName,
            lastName: tu.lastName,
            attempts: tu.attempts,
            expiresAt: tu.expiresAt,
            createdAt: tu.createdAt,
            isExpired: new Date(tu.expiresAt) < new Date()
          }))
      },
      sessions: {
        total: data.sessions.length,
        expired: data.sessions.filter(s => new Date(s.expiresAt) < new Date()).length,
        active: data.sessions.filter(s => new Date(s.expiresAt) >= new Date()).length
      },
      lastUpdated: new Date().toISOString()
    }

    return res.status(200).json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Database status error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to read database status',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}