import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getAllRequests } from '@/services/requestsDatabase';
import fs from 'fs';
import path from 'path';

// Read returns database
function getReturnsCount() {
  try {
    const returnsPath = path.join(process.cwd(), 'data', 'returns.json');
    if (!fs.existsSync(returnsPath)) {
      return { total: 0, pending: 0 };
    }
    const data = JSON.parse(fs.readFileSync(returnsPath, 'utf8'));
    const returns = data.returns || [];
    return {
      total: returns.length,
      pending: returns.filter((r: any) => r.status === 'pending').length
    };
  } catch (error) {
    console.error('Error reading returns:', error);
    return { total: 0, pending: 0 };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const isAdmin = decoded.email === process.env.ADMIN_EMAIL || 
                   decoded.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get all requests from customer-requests.json
    const requests = getAllRequests();
    
    // Get returns count from returns.json
    const returnsCount = getReturnsCount();
    
    // Count by status and type
    const counts = {
      total: requests.length + returnsCount.total,
      pending: requests.filter(r => r.status === 'pending').length + returnsCount.pending,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      completed: requests.filter(r => r.status === 'completed').length,
      byType: {
        email_change: requests.filter(r => r.type === 'email_change').length,
        phone_change: requests.filter(r => r.type === 'phone_change').length,
        return_exchange: returnsCount.total
      },
      pendingByType: {
        email_change: requests.filter(r => r.type === 'email_change' && r.status === 'pending').length,
        phone_change: requests.filter(r => r.type === 'phone_change' && r.status === 'pending').length,
        return_exchange: returnsCount.pending
      }
    };

    return res.status(200).json({
      success: true,
      counts
    });
  } catch (error) {
    console.error('Error getting request counts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
