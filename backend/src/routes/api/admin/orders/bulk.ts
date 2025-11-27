import { NextApiRequest, NextApiResponse } from 'next'
import { verifyToken } from '../../../../lib/auth'
import { bulkUpdateOrderStatus, OrderStatus } from '../../../../lib/orderWorkflow'

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

    if (req.method === 'PUT') {
      const { action, orderIds, data } = req.body;

      if (!action || !orderIds || !Array.isArray(orderIds)) {
        return res.status(400).json({ 
          error: 'Action and orderIds array are required' 
        });
      }

      if (orderIds.length === 0) {
        return res.status(400).json({ 
          error: 'At least one order ID is required' 
        });
      }

      if (orderIds.length > 100) {
        return res.status(400).json({ 
          error: 'Maximum 100 orders can be processed at once' 
        });
      }

      let result;

      switch (action) {
        case 'update_status':
          if (!data?.status) {
            return res.status(400).json({ error: 'Status is required for update_status action' });
          }
          
          result = await bulkUpdateOrderStatus(
            orderIds,
            data.status as OrderStatus,
            decoded.id,
            decoded.role,
            data.notes
          );
          break;

        case 'export':
          // Handle bulk export
          result = await handleBulkExport(orderIds);
          break;

        case 'print_labels':
          // Handle bulk print shipping labels
          result = await handleBulkPrintLabels(orderIds);
          break;

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      return res.status(200).json({
        success: true,
        message: `Bulk operation completed: ${result.success} success, ${result.failed} failed`,
        data: result
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Bulk orders API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions for bulk operations
const handleBulkExport = async (orderIds: string[]) => {
  // Mock implementation - would generate CSV/Excel file
  return {
    success: orderIds.length,
    failed: 0,
    errors: [],
    downloadUrl: '/api/admin/orders/export?ids=' + orderIds.join(',')
  };
};

const handleBulkPrintLabels = async (orderIds: string[]) => {
  // Mock implementation - would generate shipping labels PDF
  return {
    success: orderIds.length,
    failed: 0,
    errors: [],
    downloadUrl: '/api/admin/orders/labels?ids=' + orderIds.join(',')
  };
};