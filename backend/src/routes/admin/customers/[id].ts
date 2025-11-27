import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.join(process.cwd(), 'data', 'auth.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  try {
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));

    // GET - Lấy thông tin customer
    if (req.method === 'GET') {
      const customer = authData.users.find((u: any) => u.id === id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      return res.status(200).json({ success: true, customer });
    }

    // PUT - Cập nhật customer
    if (req.method === 'PUT') {
      const updates = req.body;
      
      const customerIndex = authData.users.findIndex((u: any) => u.id === id);
      
      if (customerIndex === -1) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Update customer
      authData.users[customerIndex] = {
        ...authData.users[customerIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Lưu lại
      fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

      return res.status(200).json({
        success: true,
        customer: authData.users[customerIndex]
      });
    }

    // DELETE - Xóa customer
    if (req.method === 'DELETE') {
      const customerIndex = authData.users.findIndex((u: any) => u.id === id);
      
      if (customerIndex === -1) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Xóa customer
      authData.users.splice(customerIndex, 1);
      
      // Lưu lại
      fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
