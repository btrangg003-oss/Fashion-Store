import { NextApiRequest, NextApiResponse } from 'next'
import { 
  getQueueStatus, 
  getJobById, 
  retryFailedJob, 
  clearCompletedJobs,
  startQueueProcessing,
  stopQueueProcessing
} from '../../../lib/emailQueue'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow in development mode or with admin access
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Email queue management is only available in development mode'
    })
  }

  const { method, query } = req

  switch (method) {
    case 'GET':
      try {
        const action = query.action as string

        switch (action) {
          case 'status':
            const status = getQueueStatus()
            return res.status(200).json({
              success: true,
              data: status
            })

          case 'job':
            const jobId = query.jobId as string
            if (!jobId) {
              return res.status(400).json({
                success: false,
                message: 'Job ID is required'
              })
            }

            const job = getJobById(jobId)
            if (!job) {
              return res.status(404).json({
                success: false,
                message: 'Job not found'
              })
            }

            return res.status(200).json({
              success: true,
              data: job
            })

          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid action. Use: status, job'
            })
        }

      } catch (error) {
        console.error('Email queue GET error:', error)
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }

    case 'POST':
      try {
        const { action, jobId } = req.body

        switch (action) {
          case 'retry':
            if (!jobId) {
              return res.status(400).json({
                success: false,
                message: 'Job ID is required for retry'
              })
            }

            const retrySuccess = retryFailedJob(jobId)
            if (!retrySuccess) {
              return res.status(404).json({
                success: false,
                message: 'Job not found or not in failed state'
              })
            }

            return res.status(200).json({
              success: true,
              message: 'Job queued for retry'
            })

          case 'clear-completed':
            const clearedCount = clearCompletedJobs()
            return res.status(200).json({
              success: true,
              message: `Cleared ${clearedCount} completed jobs`
            })

          case 'start-processing':
            startQueueProcessing()
            return res.status(200).json({
              success: true,
              message: 'Queue processing started'
            })

          case 'stop-processing':
            stopQueueProcessing()
            return res.status(200).json({
              success: true,
              message: 'Queue processing stopped'
            })

          default:
            return res.status(400).json({
              success: false,
              message: 'Invalid action. Use: retry, clear-completed, start-processing, stop-processing'
            })
        }

      } catch (error) {
        console.error('Email queue POST error:', error)
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