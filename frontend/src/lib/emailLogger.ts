import { createLogger } from './logger'

const logger = createLogger('email-service')

// Create directory for email logs
import { mkdirSync } from 'fs'
import { join } from 'path'

try {
  mkdirSync(join(process.cwd(), 'logs'), { recursive: true })
} catch (error) {
  console.error('Error creating logs directory:', error)
}