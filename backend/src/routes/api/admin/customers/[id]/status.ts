import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.join(process.cwd(), 'data', 'auth.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status, reason, changedBy } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    if (!status || !['active', 'blocked', 'restricted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Đọc auth data
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    
    const customerIndex = authData.users.findIndex((u: any) => u.id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update status
    authData.users[customerIndex] = {
      ...authData.users[customerIndex],
      status,
      statusReason: reason || null,
      statusChangedAt: new Date().toISOString(),
      statusChangedBy: changedBy || null,
      updatedAt: new Date().toISOString()
    };

    // Nếu là restricted, set restricted features
    if (status === 'restricted') {
      authData.users[customerIndex].restrictedFeatures = ['ai', 'cart', 'wishlist'];
    } else {
      authData.users[customerIndex].restrictedFeatures = [];
    }

    // Lưu lại
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

    return res.status(200).json({
      success: true,
      customer: authData.users[customerIndex]
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
