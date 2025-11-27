import { NextApiRequest, NextApiResponse } from 'next';
import { chatbotService, ChatMessage } from '@/lib/chatbotService';
import { getAllProducts } from '@/lib/productsDatabase';
import { getAllOrders } from '@/lib/ordersDatabase';
import { verifyToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, includeContext = true } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Build context
    const context: unknown = {};

    if (includeContext) {
      // Get products for context
      try {
        const products = await getAllProducts();
        context.products = products.slice(0, 20); // Limit to 20 products
      } catch (error) {
        console.error('Error loading products:', error);
      }

      // Get user info if authenticated
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = verifyToken(token);
          if (decoded) {
            context.userInfo = {
              email: decoded.email,
              userId: decoded.userId
            };

            // Get user's orders
            const orders = await getAllOrders();
            context.orders = orders
              .filter((o: unknown) => o.customerEmail === decoded.email)
              .slice(0, 5);
          }
        } catch {
          // Token invalid or expired, continue without user context
        }
      }
    }

    // Get chatbot response
    const response = await chatbotService.chat(messages as ChatMessage[], context);

    return res.status(200).json({
      success: true,
      message: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
