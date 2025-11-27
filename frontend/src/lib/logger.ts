import * as winston from 'winston'
import { join } from 'path'

export const createLogger = (service: string) => {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
        defaultMeta: { service },
        transports: [
            new winston.transports.File({ 
                filename: join(process.cwd(), 'logs', 'error.log'), 
                level: 'error' 
            }),
            new winston.transports.File({ 
                filename: join(process.cwd(), 'logs', 'combined.log')
            })
        ]
    })
}

if (process.env.NODE_ENV !== 'production') {
    winston.add(new winston.transports.Console({
        format: winston.format.simple()
    }))
}