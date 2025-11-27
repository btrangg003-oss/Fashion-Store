import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { readDatabase } from '../services/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Check if user is admin
    const isAdmin = decoded.email === process.env.ADMIN_EMAIL || 
                   decoded.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    // Get query params
    const { segment, filter, search } = req.query;

    // Get all users
    const database = await readDatabase()
    let customers = database.users.map((user: any) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isVerified: user.isVerified,
      role: user.role || 'user',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      tier: user.tier,
      status: user.status || 'active',
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      lastOrderDate: user.lastOrderDate,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      notes: user.notes,
      addresses: user.addresses || []
    }));

    // Filter by tier/segment
    if (segment && segment !== 'all') {
      customers = customers.filter((c: any) => c.tier === segment);
    }

    // Filter by status
    if (filter && filter !== 'all') {
      customers = customers.filter((c: any) => c.status === filter);
    }

    // Search
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      customers = customers.filter((c: any) => 
        c.email.toLowerCase().includes(searchLower) ||
        (c.firstName && c.firstName.toLowerCase().includes(searchLower)) ||
        (c.lastName && c.lastName.toLowerCase().includes(searchLower)) ||
        (c.phone && c.phone.includes(search))
      );
    }

    // Calculate stats
    const stats = {
      total: customers.length,
      newThisMonth: customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length,
      totalRevenue: 0, // TODO: Calculate from orders
      avgOrderValue: 0, // TODO: Calculate from orders
      repeatCustomers: 0 // TODO: Calculate from orders
    };

    return res.status(200).json({
      success: true,
      customers: customers,
      stats: stats
    })

  } catch (error) {
    console.error('Customers API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}