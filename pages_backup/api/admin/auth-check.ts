import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check for token in cookies
    const token = req.cookies.token || req.cookies['auth-token'];
    
    const debugInfo = {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      availableCookies: Object.keys(req.cookies),
      cookieNames: Object.keys(req.cookies).map(key => ({
        name: key,
        valuePreview: req.cookies[key]?.substring(0, 20) + '...'
      }))
    };

    console.log('🔍 Auth Check Debug:', debugInfo);

    if (!token) {
      return res.status(401).json({
        authenticated: false,
        error: 'No token found',
        debug: debugInfo
      })
    }

    const decoded = verifyToken(token) as any;
    
    if (!decoded) {
      return res.status(401).json({
        authenticated: false,
        error: 'Invalid token',
        debug: debugInfo
      })
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role
      },
      debug: debugInfo
    })

  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      authenticated: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
