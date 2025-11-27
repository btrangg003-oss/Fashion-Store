import { NextApiRequest, NextApiResponse } from 'next'
import { emailMonitor } from '../../../lib/emailMonitor'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        })
    }

    try {
        const stats = emailMonitor.getStats()
        return res.status(200).json({
            success: true,
            data: stats
        })
    } catch (error) {
        console.error('Email monitor error:', error)
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}