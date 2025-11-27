import { NextApiRequest, NextApiResponse } from 'next'
import { 
  cleanupExpiredTempUsers, 
  getVerificationStats,
  getVerificationSummary 
} from '../services/verificationUtils'
import { deleteTempUser, updateTempUser } from '../services/database'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Verification management is only available in development mode'
    })
  }

  const { method, query } = req

  switch (method) {
    case 'GET':
      try {
        const action = query.action as string

        switch (action) {
          case 'stats':
            const stats = await getVerificationStats()
            return res.status(200).json({
              success: true,
              data: stats
            })

          case 'summary':
            const email = query.email as string
            if (!email) {
              return res.status(400).json({
                success: false,
                message: 'Email is required'
              })
            }

            const summary = await getVerificationSummary(email)
            return res.status(200).json({
              success: true,
              data: summary
            })

          case 'cleanup':
            const cleanupResult = await cleanupExpiredTempUsers()
            return res.status(200).json({
              success: true,
              data: cleanupResult
            })

          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid action. Use: stats, summary, cleanup'
            })
        }

      } catch (error) {
        console.error('Verification management GET error:', error)
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    case 'POST':
      try {
        const { action, email, data } = req.body

        switch (action) {
          case 'reset-attempts':
            if (!email) {
              return res.status(400).json({
                success: false,
                message: 'Email is required'
              })
            }

            const resetResult = await updateTempUser(email, { attempts: 0 })
            if (!resetResult) {
              return res.status(404).json({
                success: false,
                message: 'Temp user not found'
              })
            }

            return res.status(200).json({
              success: true,
              message: 'Attempts reset successfully',
              data: resetResult
            })

          case 'delete-temp-user':
            if (!email) {
              return res.status(400).json({
                success: false,
                message: 'Email is required'
              })
            }

            await deleteTempUser(email)
            return res.status(200).json({
              success: true,
              message: 'Temp user deleted successfully'
            })

          case 'extend-expiration':
            if (!email) {
              return res.status(400).json({
                success: false,
                message: 'Email is required'
              })
            }

            const minutes = data?.minutes || 10
            const newExpiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString()
            
            const extendResult = await updateTempUser(email, { 
              expiresAt: newExpiresAt,
              attempts: 0 // Reset attempts when extending
            })
            
            if (!extendResult) {
              return res.status(404).json({
                success: false,
                message: 'Temp user not found'
              })
            }

            return res.status(200).json({
              success: true,
              message: `Expiration extended by ${minutes} minutes`,
              data: extendResult
            })

          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid action. Use: reset-attempts, delete-temp-user, extend-expiration'
            })
        }

      } catch (error) {
        console.error('Verification management POST error:', error)
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({
        success: false,
        message: `Method ${method} not allowed`
      })
  }
}