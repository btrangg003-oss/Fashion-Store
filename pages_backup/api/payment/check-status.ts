import { NextApiRequest, NextApiResponse } from 'next'
import { getOrders } from '../../../lib/ordersDatabase'

// Simulated transaction database (in production, this would be from bank/MoMo API)
const mockTransactions: { [key: string]: any } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { method, amount, orderId, transactionRef } = req.body;

    if (!method || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate transaction reference if not provided
    const txRef = transactionRef || `${method}_${Date.now()}`;

    // Check if transaction exists in mock database
    // In production, this would call bank/MoMo API to verify
    const transaction = mockTransactions[txRef];

    if (transaction && transaction.amount === amount && transaction.status === 'completed') {
      return res.status(200).json({
        success: true,
        status: 'success',
        transactionId: transaction.id,
        amount: transaction.amount,
        paidAt: transaction.paidAt
      });
    }

    // Simulate random success for demo (30% chance)
    // Remove this in production and use real API
    const randomCheck = Math.random();
    if (randomCheck > 0.7) {
      const mockTransaction = {
        id: `TXN${Date.now()}`,
        amount,
        status: 'completed',
        paidAt: new Date().toISOString()
      };
      mockTransactions[txRef] = mockTransaction;

      return res.status(200).json({
        success: true,
        status: 'success',
        transactionId: mockTransaction.id,
        amount: mockTransaction.amount,
        paidAt: mockTransaction.paidAt
      });
    }

    // Still pending
    return res.status(200).json({
      success: true,
      status: 'pending',
      message: 'Payment not yet confirmed'
    });

  } catch (error) {
    console.error('Payment check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to manually mark transaction as paid (for testing)
export function markTransactionPaid(txRef: string, amount: number) {
  mockTransactions[txRef] = {
    id: `TXN${Date.now()}`,
    amount,
    status: 'completed',
    paidAt: new Date().toISOString()
  };
}
