import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Text too short to summarize' });
    }

    // Simple summarization: Extract key sentences
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
    
    // Take first 3-4 sentences as summary
    const summary = sentences.slice(0, Math.min(4, sentences.length)).join('. ').trim() + '.';
    
    // Remove redundant phrases
    const cleaned = summary
      .replace(/\s+/g, ' ')
      .replace(/\.\s*\./g, '.')
      .trim();

    return res.status(200).json({
      success: true,
      summary: cleaned,
      original_length: text.length,
      summary_length: cleaned.length
    });

  } catch (error) {
    console.error('Summarize error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to summarize text' 
    });
  }
}
