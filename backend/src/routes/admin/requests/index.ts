import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { getAllRequests, updateRequest } from '@/services/requestsDatabase';
import fs from 'fs';
import path from 'path';

// Read returns and convert to request format
function getReturnsAsRequests() {
  try {
    const returnsPath = path.join(process.cwd(), 'data', 'returns.json');
    if (!fs.existsSync(returnsPath)) {
      return [];
    }
    const data = JSON.parse(fs.readFileSync(returnsPath, 'utf8'));
    const returns = data.returns || [];
    
    // Convert returns to request format
    return returns.map((ret: any) => ({
      id: ret.id,
      userId: ret.userId,
      type: 'return_exchange' as const,
      status: ret.status,
      data: {
        orderId: ret.orderId,
        orderNumber: ret.orderNumber,
        returnNumber: ret.returnNumber,
        items: ret.items,
        reason: ret.reason,
        reasonText: ret.reasonText,
        refundAmount: ret.refundAmount,
        refundMethod: ret.refundMethod
      },
      reason: ret.reasonText || 'Yêu cầu đổi/trả hàng',
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt,
      processedBy: ret.processedBy,
      processedAt: ret.processedAt,
      adminNote: ret.adminNote
    }));
  } catch (error) {
    console.error('Error reading returns:', error);
    return [];
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    if (req.method === 'GET') {
      // Get all requests from customer-requests.json
      const requests = getAllRequests();
      
      // Get returns as requests from returns.json
      const returnRequests = getReturnsAsRequests();
      
      // Combine both
      const allRequests = [...requests, ...returnRequests];
      
      // Sort by creation date (newest first)
      allRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Get filter from query
      const { status, type } = req.query;
      
      let filtered = allRequests;
      
      if (status && status !== 'all') {
        filtered = filtered.filter(r => r.status === status);
      }
      
      if (type && type !== 'all') {
        filtered = filtered.filter(r => r.type === type);
      }

      return res.status(200).json({
        success: true,
        requests: filtered,
        total: allRequests.length
      });
    }

    if (req.method === 'PUT') {
      // Update request (approve/reject)
      const { requestId, status, adminNote } = req.body;

      if (!requestId || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if this is a return request (starts with 'return_')
      if (requestId.startsWith('return_')) {
        // Handle return request
        try {
          const { updateReturn, getReturnById } = require('@/services/returnService');
          const { readDatabase } = require('@/services/database');
          const { sendRequestApprovedEmail, sendRequestRejectedEmail } = require('@/services/requestNotifications');
          
          // Get return details before update
          const returnRequest = await getReturnById(requestId);
          if (!returnRequest) {
            return res.status(404).json({ error: 'Return request not found' });
          }

          // Get user info
          const database = await readDatabase();
          const user = database.users.find((u: any) => u.id === returnRequest.userId);
          const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng' : 'Khách hàng';
          const userEmail = user?.email;
          
          const updates: any = {
            status,
            processedBy: decoded.email,
            processedAt: new Date().toISOString()
          };

          if (adminNote) {
            updates.adminNote = adminNote;
          }

          if (status === 'approved') {
            updates.approvedAt = new Date().toISOString();
          }

          const updated = await updateReturn(requestId, updates);

          if (!updated) {
            return res.status(404).json({ error: 'Return request not found' });
          }

          // Send email notification to customer
          try {
            if (userEmail) {
              const requestData = {
                orderId: returnRequest.orderId,
                orderNumber: returnRequest.orderNumber,
                returnNumber: returnRequest.returnNumber,
                items: returnRequest.items,
                refundAmount: returnRequest.refundAmount
              };

              if (status === 'approved') {
                await sendRequestApprovedEmail(
                  userEmail,
                  userName,
                  'return_exchange',
                  requestId,
                  requestData
                );
              } else if (status === 'rejected') {
                await sendRequestRejectedEmail(
                  userEmail,
                  userName,
                  'return_exchange',
                  requestId,
                  adminNote || 'Yêu cầu không đáp ứng điều kiện',
                  requestData
                );
              }
            }
          } catch (emailError) {
            console.error('Error sending email notification:', emailError);
            // Don't fail the request if email fails
          }

          return res.status(200).json({
            success: true,
            request: updated
          });
        } catch (error) {
          console.error('Error updating return:', error);
          return res.status(500).json({ error: 'Failed to update return request' });
        }
      }

      // Handle regular request (email/phone change)
      const updated = updateRequest(requestId, {
        status,
        adminNote,
        processedBy: decoded.email,
        processedAt: new Date().toISOString()
      });

      if (!updated) {
        return res.status(404).json({ error: 'Request not found' });
      }

      // Send email notification to customer
      try {
        const { readDatabase } = require('@/services/database');
        const { sendRequestApprovedEmail, sendRequestRejectedEmail } = require('@/services/requestNotifications');
        
        const database = await readDatabase();
        const user = database.users.find((u: any) => u.id === updated.userId);
        
        if (user?.email) {
          const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Khách hàng';
          
          if (status === 'approved') {
            await sendRequestApprovedEmail(
              user.email,
              userName,
              updated.type,
              requestId
            );
          } else if (status === 'rejected') {
            await sendRequestRejectedEmail(
              user.email,
              userName,
              updated.type,
              requestId,
              adminNote || 'Yêu cầu không đáp ứng điều kiện'
            );
          }
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }

      return res.status(200).json({
        success: true,
        request: updated
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling requests:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
