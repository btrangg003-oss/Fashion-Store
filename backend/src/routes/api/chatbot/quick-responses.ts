import { NextApiRequest, NextApiResponse } from 'next';
import { chatbotService } from '@/services/chatbotService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const quickResponses = chatbotService.getQuickResponses();

    return res.status(200).json({
      success: true,
      responses: quickResponses
    });

  } catch (error) {
    console.error('Quick responses error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}
