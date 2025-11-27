import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../services/auth'
import { getAllOrders } from '../services/ordersDatabase'
import { readDatabase } from '../services/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const decoded = verifyToken(token) as any;
        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        if (req.method === 'GET') {
            const orders = await getAllOrders();
            const authData = await readDatabase();
            const users = authData.users;

            // Customer spending analysis
            const customerSpending = new Map();
            orders.forEach(order => {
                const existing = customerSpending.get(order.userId) || {
                    totalSpent: 0,
                    orderCount: 0,
                    lastOrder: null,
                    firstOrder: null
                };
                existing.totalSpent += order.total;
                existing.orderCount += 1;
                existing.lastOrder = !existing.lastOrder || new Date(order.createdAt) > new Date(existing.lastOrder)
                    ? order.createdAt : existing.lastOrder;
                existing.firstOrder = !existing.firstOrder || new Date(order.createdAt) < new Date(existing.firstOrder)
                    ? order.createdAt : existing.firstOrder;
                customerSpending.set(order.userId, existing);
            });

            // Top customers
            const topCustomers = Array.from(customerSpending.entries())
                .map(([userId, data]) => {
                    const user = users.find(u => u.id === userId);
                    return {
                        userId,
                        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
                        email: user?.email || 'Unknown',
                        ...data,
                        averageOrderValue: data.totalSpent / data.orderCount
                    };
                })
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 20);

            // Customer segments
            const segments = {
                vip: topCustomers.filter(c => c.totalSpent > 5000000).length, // >5M VND
                loyal: topCustomers.filter(c => c.orderCount >= 5).length,
                new: users.filter(u => {
                    const joinDate = new Date(u.createdAt);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return joinDate > thirtyDaysAgo;
                }).length,
                inactive: users.filter(u => {
                    const spending = customerSpending.get(u.id);
                    if (!spending) return true;
                    const lastOrder = new Date(spending.lastOrder);
                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                    return lastOrder < sixMonthsAgo;
                }).length
            };

            // Monthly customer acquisition
            const monthlyAcquisition = new Map();
            users.forEach(user => {
                const month = new Date(user.createdAt).toISOString().slice(0, 7); // YYYY-MM
                monthlyAcquisition.set(month, (monthlyAcquisition.get(month) || 0) + 1);
            });

            const acquisitionChart = Array.from(monthlyAcquisition.entries())
                .map(([month, count]) => ({ month, newCustomers: count }))
                .sort((a, b) => a.month.localeCompare(b.month));

            // Customer lifetime value
            const avgLifetimeValue = topCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / topCustomers.length;
            const avgOrderFrequency = topCustomers.reduce((sum, c) => sum + c.orderCount, 0) / topCustomers.length;

            return res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalCustomers: users.length,
                        activeCustomers: customerSpending.size,
                        avgLifetimeValue,
                        avgOrderFrequency
                    },
                    topCustomers,
                    segments,
                    acquisitionChart,
                    metrics: {
                        customerRetentionRate: (customerSpending.size / users.length) * 100,
                        repeatCustomerRate: (topCustomers.filter(c => c.orderCount > 1).length / topCustomers.length) * 100
                    }
                }
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Customer analytics API error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}