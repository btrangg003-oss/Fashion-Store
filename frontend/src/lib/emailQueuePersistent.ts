import fs from 'fs'
import path from 'path'
import { EmailJob } from './emailQueue'

const QUEUE_FILE = path.join(process.cwd(), 'data', 'email-queue.json')

// Ensure directory exists
const ensureQueueFile = () => {
  const dir = path.dirname(QUEUE_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(QUEUE_FILE)) {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify([], null, 2))
  }
}

// Load queue from file
const loadQueue = (): EmailJob[] => {
  ensureQueueFile()
  try {
    const data = fs.readFileSync(QUEUE_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading email queue:', error)
    return []
  }
}

// Save queue to file
const saveQueue = (queue: EmailJob[]) => {
  ensureQueueFile()
  try {
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2))
  } catch (error) {
    console.error('Error saving email queue:', error)
  }
}

// Generate unique job ID
const generateJobId = (): string => {
  return `email_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Add email to queue
export const queueEmail = async (job: Omit<EmailJob, 'id' | 'createdAt' | 'status'>) => {
  const queue = loadQueue()
  const newJob: EmailJob = {
    ...job,
    id: generateJobId(),
    createdAt: new Date().toISOString(),
    status: 'pending'
  }
  queue.push(newJob)
  saveQueue(queue)
  return newJob.id
}

// Process queue
export const processQueue = async () => {
  const queue = loadQueue()
  if (queue.length === 0) return

  for (const job of queue) {
    if (job.status !== 'pending') continue

    try {
      job.status = 'processing'
      saveQueue(queue)

      // Process job based on type
      switch (job.type) {
        case 'verification':
          // Handle verification email
          break
        case 'order_confirmation':
          // Handle order confirmation email
          break
        // Add other email types
      }

      job.status = 'completed'
    } catch (error) {
      job.status = 'failed'
      job.error = error instanceof Error ? error.message : 'Unknown error'
    }

    saveQueue(queue)
  }
}

// Start queue processing
const startQueueProcessor = () => {
  setInterval(processQueue, 5000) // Process every 5 seconds
}

// Export functions
export { startQueueProcessor }