import { TempUser } from '../types/auth'
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendOrderConfirmationEmail, sendOrderStatusEmail, sendAdminNewOrderEmail } from './emailService'

import { emailMonitor } from './emailMonitor'
import { createLogger } from './logger'

const logger = createLogger('email-queue')

// Initialize queue and processing state
export const emailQueue: EmailJob[] = []
let isProcessing = false

export interface SendEmailResult {
    success: boolean
    messageId?: string
    error?: string
}

export interface EmailJob {
    id: string
    type: 'verification' | 'welcome' | 'reset_password' | 'order_confirmation' | 'order_status' | 'admin_new_order'
    data: unknown
    attempts: number
    maxAttempts: number
    createdAt: string
    scheduledAt: string
    lastAttemptAt?: string
    error?: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface VerificationEmailData {
    tempUser: TempUser
}

export interface WelcomeEmailData {
    email: string
    firstName: string
}

export interface OrderConfirmationEmailData {
    email: string
    firstName: string
    orderNumber: string
    total: number
    subtotal: number
    discount?: number
    shipping: number
    items: { name: string; quantity: number; price: number; image?: string }[]
    shippingAddress: {
        fullName: string
        phone: string
        email?: string
        address: string
        ward: string
        district: string
        city: string
    }
    shippingMethod: string
    paymentMethod: string
}

export interface OrderStatusEmailData {
    email: string
    firstName: string
    orderNumber: string
    status: string
    note?: string
    trackingNumber?: string
}

export interface OrderStatusEmailDetailedData {
    email: string
    firstName: string
    orderNumber: string
    status: string
    note?: string
    trackingNumber?: string
    total: number
    subtotal: number
    discount?: number
    shipping: number
    items: { name: string; quantity: number; price: number; image?: string }[]
    shippingAddress: any
    shippingMethod: string
    paymentMethod: string
}

export interface AdminNewOrderEmailData {
    adminEmail: string
    orderNumber: string
    total: number
    userEmail: string
    customerName?: string
    items?: { name: string; quantity: number; price: number; image?: string }[]
    shippingAddress?: {
        phone: string
        address: string
    }
}

export interface ResetPasswordEmailData {
    email: string
    firstName: string
    resetLink: string
}

// Using persistent queue
import { queueEmail, startQueueProcessor } from './emailQueuePersistent'

// Start queue processor
startQueueProcessor()

// Generate unique job ID
const generateJobId = (): string => {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Add verification email to queue
export const queueVerificationEmail = async (tempUser: TempUser): Promise<string> => {
    const job: EmailJob = {
        id: generateJobId(),
        type: 'verification',
        data: { tempUser },
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        status: 'pending'
    }

    emailQueue.push(job)
    console.log(`Verification email queued for: ${tempUser.email} (Job ID: ${job.id})`)

    // Start processing if not already running
    if (!isProcessing) {
        processEmailQueue()
    }

    return job.id
}

// Add welcome email to queue
export const queueWelcomeEmail = async (email: string, firstName: string): Promise<string> => {
    const job: EmailJob = {
        id: generateJobId(),
        type: 'welcome',
        data: { email, firstName },
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        status: 'pending'
    }

    emailQueue.push(job)
    console.log(`Welcome email queued for: ${email} (Job ID: ${job.id})`)

    // Start processing if not already running
    if (!isProcessing) {
        processEmailQueue()
    }

    return job.id
}

// Add order confirmation email to queue
export const queueOrderConfirmationEmail = async (
    data: OrderConfirmationEmailData
): Promise<string> => {
    const job: EmailJob = {
        id: generateJobId(),
        type: 'order_confirmation',
        data,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        status: 'pending'
    }

    emailQueue.push(job)
    console.log(`Order confirmation email queued for: ${data.email} (Order ${data.orderNumber}) (Job ID: ${job.id})`)

    if (!isProcessing) {
        processEmailQueue()
    }

    return job.id
}

// Add order status update email to queue
export const queueOrderStatusEmail = async (
    data: OrderStatusEmailData
): Promise<string> => {
    const job: EmailJob = {
        id: generateJobId(),
        type: 'order_status',
        data,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        status: 'pending'
    }

    emailQueue.push(job)
    console.log(`Order status email queued for: ${data.email} (Order ${data.orderNumber}, ${data.status}) (Job ID: ${job.id})`)

    if (!isProcessing) {
        processEmailQueue()
    }

    return job.id
}

// ✅ Add detailed order status update email to queue (with full order info)
export const queueOrderStatusEmailDetailed = async (
    data: OrderStatusEmailDetailedData
): Promise<string> => {
    const job: EmailJob = {
        id: generateJobId(),
        type: 'order_status',
        data,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        status: 'pending'
    }

    emailQueue.push(job)
    console.log(`Detailed order status email queued for: ${data.email} (Order ${data.orderNumber}, ${data.status}) (Job ID: ${job.id})`)

    if (!isProcessing) {
        processEmailQueue()
    }

    return job.id
}

// Add admin new order notification email to queue
export const queueAdminNewOrderEmail = async (
    data: AdminNewOrderEmailData
): Promise<string> => {
    const job: EmailJob = {
        id: generateJobId(),
        type: 'admin_new_order',
        data,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        status: 'pending'
    }

    emailQueue.push(job)
    console.log(`Admin new order email queued for: ${data.adminEmail} (Order ${data.orderNumber}) (Job ID: ${job.id})`)

    if (!isProcessing) {
        processEmailQueue()
    }

    return job.id
}

// Add reset password email to queue
export const queueResetPasswordEmail = async (
    data: ResetPasswordEmailData
): Promise<string> => {
    const job: EmailJob = {
        id: generateJobId(),
        type: 'reset_password',
        data,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date().toISOString(),
        scheduledAt: new Date().toISOString(),
        status: 'pending'
    }

    emailQueue.push(job)
    console.log(`Reset password email queued for: ${data.email} (Job ID: ${job.id})`)

    if (!isProcessing) {
        processEmailQueue()
    }

    return job.id
}

// Process email queue
export const processEmailQueue = async (): Promise<void> => {
    if (isProcessing) return

    isProcessing = true
    console.log('Starting email queue processing...')

    try {
        while (true) {
            // Find next pending job
            const job = emailQueue.find(j =>
                j.status === 'pending' &&
                new Date(j.scheduledAt) <= new Date()
            )

            if (!job) {
                break // No more jobs to process
            }

            // Mark job as processing
            job.status = 'processing'
            job.lastAttemptAt = new Date().toISOString()
            job.attempts++

            console.log(`Processing email job: ${job.id} (Attempt ${job.attempts}/${job.maxAttempts})`)

            try {
                let result: SendEmailResult

                // Process based on job type
                switch (job.type) {
                    case 'verification':
                        const verificationData = job.data as VerificationEmailData
                        result = await sendVerificationEmail(
                            verificationData.tempUser.email,
                            verificationData.tempUser.firstName,
                            verificationData.tempUser.verificationCode
                        )
                        break

                    case 'welcome':
                        const welcomeData = job.data as WelcomeEmailData
                        result = await sendWelcomeEmail(welcomeData.email, welcomeData.firstName)
                        break

                    case 'order_confirmation':
                        const ocData = job.data as OrderConfirmationEmailData
                        result = await sendOrderConfirmationEmail(ocData.email, ocData.firstName, {
                            orderNumber: ocData.orderNumber,
                            total: ocData.total,
                            subtotal: ocData.subtotal,
                            discount: ocData.discount,
                            shipping: ocData.shipping,
                            items: ocData.items,
                            shippingAddress: ocData.shippingAddress,
                            shippingMethod: ocData.shippingMethod,
                            paymentMethod: ocData.paymentMethod
                        })
                        break

                    case 'order_status':
                        const osData = job.data as any
                        // ✅ Check if this is detailed email (has total, items, etc.)
                        if (osData.total !== undefined && osData.items && osData.shippingAddress) {
                            const { sendOrderStatusEmailDetailed } = await import('./emailService')
                            result = await sendOrderStatusEmailDetailed(osData.email, osData.firstName, {
                                orderNumber: osData.orderNumber,
                                status: osData.status,
                                note: osData.note,
                                trackingNumber: osData.trackingNumber,
                                total: osData.total,
                                subtotal: osData.subtotal || osData.total,
                                discount: osData.discount || 0,
                                shipping: osData.shipping || 0,
                                items: osData.items,
                                shippingAddress: osData.shippingAddress,
                                shippingMethod: osData.shippingMethod || 'Giao hàng tiêu chuẩn',
                                paymentMethod: osData.paymentMethod
                            })
                        } else {
                            // Simple status email
                            result = await sendOrderStatusEmail(osData.email, osData.firstName, {
                                orderNumber: osData.orderNumber,
                                status: osData.status,
                                note: osData.note,
                                trackingNumber: osData.trackingNumber
                            })
                        }
                        break

                    case 'admin_new_order':
                        const anData = job.data as AdminNewOrderEmailData
                        result = await sendAdminNewOrderEmail(anData.adminEmail, {
                            orderNumber: anData.orderNumber,
                            total: anData.total,
                            userEmail: anData.userEmail,
                            customerName: anData.customerName,
                            items: anData.items,
                            shippingAddress: anData.shippingAddress
                        })
                        break

                    case 'reset_password':
                        const rpData = job.data as ResetPasswordEmailData
                        result = await sendResetPasswordEmail(rpData.email, rpData.firstName, rpData.resetLink)
                        break

                    default:
                        throw new Error(`Unknown job type: ${job.type}`)
                }

                if (result.success) {
                    job.status = 'completed'
                    console.log(`Email job completed: ${job.id}`)
                } else {
                    throw new Error(result.error || 'Email sending failed')
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                job.error = errorMessage

                if (job.attempts >= job.maxAttempts) {
                    job.status = 'failed'
                    console.error(`Email job failed permanently: ${job.id} - ${errorMessage}`)
                } else {
                    // Schedule retry (exponential backoff)
                    const retryDelay = Math.pow(2, job.attempts) * 1000 // 2s, 4s, 8s...
                    job.scheduledAt = new Date(Date.now() + retryDelay).toISOString()
                    job.status = 'pending'
                    console.log(`Email job scheduled for retry: ${job.id} in ${retryDelay}ms`)
                }
            }

            // Small delay between jobs to avoid overwhelming the email service
            await new Promise(resolve => setTimeout(resolve, 100))
        }

    } catch (error) {
        console.error('Email queue processing error:', error)
    } finally {
        isProcessing = false
        console.log('Email queue processing completed')

        // Schedule next processing cycle if there are pending jobs
        const hasPendingJobs = emailQueue.some(j => j.status === 'pending')
        if (hasPendingJobs) {
            setTimeout(() => processEmailQueue(), 5000) // Check again in 5 seconds
        }
    }
}

// Get queue status
export const getQueueStatus = (): {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
    jobs: EmailJob[]
} => {
    const pending = emailQueue.filter((j: EmailJob) => j.status === 'pending').length
    const processing = emailQueue.filter((j: EmailJob) => j.status === 'processing').length
    const completed = emailQueue.filter((j: EmailJob) => j.status === 'completed').length
    const failed = emailQueue.filter((j: EmailJob) => j.status === 'failed').length

    return {
        total: emailQueue.length,
        pending,
        processing,
        completed,
        failed,
        jobs: emailQueue.slice(-10) // Return last 10 jobs
    }
}

// Get job by ID
export const getJobById = (jobId: string): EmailJob | undefined => {
    return emailQueue.find((j: EmailJob) => j.id === jobId)
}

// Retry failed job
export const retryFailedJob = (jobId: string): boolean => {
    const job = emailQueue.find((j: EmailJob) => j.id === jobId && j.status === 'failed')

    if (!job) {
        return false
    }

    // Reset job for retry
    job.status = 'pending'
    job.attempts = 0
    job.scheduledAt = new Date().toISOString()
    job.error = undefined

    console.log(`Job ${jobId} reset for retry`)

    // Start processing if not already running
    if (!isProcessing) {
        processEmailQueue()
    }

    return true
}

// Clear completed jobs (cleanup)
export const clearCompletedJobs = (): number => {
    const initialLength = emailQueue.length

    // Remove completed jobs older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

    for (let i = emailQueue.length - 1; i >= 0; i--) {
        const job = emailQueue[i]
        if (job.status === 'completed' && job.lastAttemptAt && job.lastAttemptAt < oneHourAgo) {
            emailQueue.splice(i, 1)
        }
    }

    const removedCount = initialLength - emailQueue.length
    console.log(`Cleared ${removedCount} completed email jobs`)

    return removedCount
}

// Stop queue processing (for graceful shutdown)
export const stopQueueProcessing = (): void => {
    isProcessing = false
    console.log('Email queue processing stopped')
}

// Start queue processing manually
export const startQueueProcessing = (): void => {
    if (!isProcessing) {
        processEmailQueue()
    }
}