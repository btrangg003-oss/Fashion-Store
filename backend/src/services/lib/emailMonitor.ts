import { EmailJob, emailQueue, getQueueStatus } from './emailQueue'
import { createLogger } from './logger'

const logger = createLogger('email-monitor')

export interface EmailMonitorStats {
    totalSent: number
    totalFailed: number
    queueSize: number
    processingStatus: number
    lastError?: string
    lastSuccessfulSend?: string
}

class EmailMonitor {
    private stats: EmailMonitorStats = {
        totalSent: 0,
        totalFailed: 0,
        queueSize: 0,
        processingStatus: 0
    }

    constructor() {
        this.initializeMonitoring()
    }

    private initializeMonitoring() {
        if (process.env.EMAIL_QUEUE_MONITOR === 'true') {
            setInterval(() => this.updateStats(), 5000) // Update stats every 5 seconds
        }
    }

    public recordSuccess(job: EmailJob) {
        this.stats.totalSent++
        this.stats.lastSuccessfulSend = new Date().toISOString()
        logger.info(`Email sent successfully`, {
            jobId: job.id,
            type: job.type,
            recipient: job.data.email
        })
    }

    public recordFailure(job: EmailJob, error: Error) {
        this.stats.totalFailed++
        this.stats.lastError = error.message
        logger.error(`Email sending failed`, {
            jobId: job.id,
            type: job.type,
            error: error.message,
            attempts: job.attempts
        })
    }

    private updateStats() {
        const queueStatus = getQueueStatus()
        this.stats.queueSize = queueStatus.pending
        this.stats.processingStatus = queueStatus.processing

        logger.info(`Email queue stats updated`, this.stats)
    }

    public getStats(): EmailMonitorStats {
        return { ...this.stats }
    }
}

export const emailMonitor = new EmailMonitor()