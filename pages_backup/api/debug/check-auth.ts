import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token || req.cookies['auth-token'];
    
    if (!token) {
      return res.status(200).json({
        authenticated: false,
        message: 'No token found',
        cookies: Object.keys(req.cookies)
      });
    }

    const decoded = verifyToken(token) as any;
    
    if (!decoded) {
      return res.status(200).json({
        authenticated: false,
        message: 'Invalid token',
        tokenPreview: token.substring(0, 20) + '...'
      });
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      },
      isAdmin: decoded.role === 'admin',
      isStaff: decoded.role === 'staff',
      canUpdateOrders: decoded.role === 'admin' || decoded.role === 'staff'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
