import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    const notifications = JSON.parse(data);

    notifications.forEach((n: any) => {
      n.read = true;
    });

    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));

    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
