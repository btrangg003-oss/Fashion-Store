import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const ACTIVITY_LOG_FILE = path.join(process.cwd(), 'data', 'activity-log.json');

async function readActivityLog() {
  try {
    const data = await fs.readFile(ACTIVITY_LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeActivityLog(logs: any[]) {
  await fs.mkdir(path.dirname(ACTIVITY_LOG_FILE), { recursive: true });
  await fs.writeFile(ACTIVITY_LOG_FILE, JSON.stringify(logs, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { range = 'week' } = req.query;
      let logs = await readActivityLog();

      // Filter by date range
      const now = new Date();
      let startDate = new Date();

      switch (range) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'all':
          startDate = new Date(0);
          break;
      }

      logs = logs.filter((log: any) => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= now;
      });

      // Sort by timestamp, newest first
      logs.sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return res.status(200).json(logs);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Activity log API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to log activities
export async function logActivity(
  userId: string,
  userName: string,
  action: string,
  entity: string,
  entityId: string,
  details: string,
  ipAddress: string = '127.0.0.1'
) {
  try {
    const logs = await readActivityLog();
    const newLog = {
      id: Date.now().toString(),
      userId,
      userName,
      action,
      entity,
      entityId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress
    };

    logs.push(newLog);
    
    // Keep only last 1000 logs to prevent file from growing too large
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    await writeActivityLog(logs);
    return newLog;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
