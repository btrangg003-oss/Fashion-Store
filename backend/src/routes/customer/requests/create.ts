import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { createRequest, readRequests } from '@/services/requestsDatabase';
import { sendRequestCreatedEmail, sendAdminNotificationEmail } from '@/services/requestNotifications';
import { readDatabase } from '@/services/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    const { type, data, reason } = req.body;

    if (!type || !data || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate type
    if (!['email_change', 'phone_change', 'return_exchange'].includes(type)) {
      return res.status(400).json({ error: 'Invalid request type' });
    }

    // Create request
    const request = createRequest({
      userId: decoded.userId,
      type,
      data,
      reason,
      status: 'pending'
    });

    // Send email notifications
    try {
      // Get user info
      const database = await readDatabase();
      const user = database.users.find((u: any) => u.id === decoded.userId);
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng' : 'Khách hàng';
      const userEmail = user?.email || decoded.email;

      // Send email to customer
      await sendRequestCreatedEmail(
        userEmail,
        userName,
        type,
        request.id,
        data // Pass request data for return/exchange details
      );

      // Count pending requests for admin email
      const allRequestsData = readRequests();
      const allRequests = allRequestsData.requests || [];
      const pendingCounts = {
        email: allRequests.filter((r: any) => r.type === 'email_change' && r.status === 'pending').length,
        phone: allRequests.filter((r: any) => r.type === 'phone_change' && r.status === 'pending').length,
        return: allRequests.filter((r: any) => r.type === 'return_exchange' && r.status === 'pending').length
      };

      // Send email to admin
      await sendAdminNotificationEmail(
        type,
        userName,
        userEmail,
        request.id,
        pendingCounts
      );
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
