import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json');

async function readNotifications() {
  try {
    const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeNotifications(notifications: any[]) {
  await fs.mkdir(path.dirname(NOTIFICATIONS_FILE), { recursive: true });
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const notifications = await readNotifications();
      // Sort by timestamp, newest first
      notifications.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return res.status(200).json(notifications);
    }

    if (req.method === 'POST') {
      const { type, title, message, actionUrl } = req.body;
      
      const notifications = await readNotifications();
      const newNotification = {
        id: Date.now().toString(),
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl
      };

      notifications.push(newNotification);
      await writeNotifications(notifications);

      return res.status(201).json(newNotification);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Notifications API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to create notifications
export async function createNotification(
  type: 'info' | 'success' | 'warning' | 'error',
  title: string,
  message: string,
  actionUrl?: string
) {
  try {
    const notifications = await readNotifications();
    const newNotification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl
    };

    notifications.push(newNotification);
    await writeNotifications(notifications);

    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
