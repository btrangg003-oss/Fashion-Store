import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.join(process.cwd(), 'data', 'auth.json');
const CODES_FILE = path.join(process.cwd(), 'data', 'email-verification-codes.json');

// Helper to read codes from file
function readCodes(): Record<string, { code: string; email: string; expiresAt: number }> {
  try {
    if (fs.existsSync(CODES_FILE)) {
      const data = fs.readFileSync(CODES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading codes file:', error);
  }
  return {};
}

// Helper to write codes to file
function writeCodes(codes: Record<string, { code: string; email: string; expiresAt: number }>) {
  try {
    fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2));
  } catch (error) {
    console.error('Error writing codes file:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, newEmail, code } = req.body;

    if (!customerId || !newEmail || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get stored verification code
    const codes = readCodes();
    const storedData = codes[customerId];

    console.log('Verification attempt:', { customerId, code, newEmail });
    console.log('Stored data:', storedData);

    if (!storedData) {
      return res.status(400).json({ error: 'Không tìm thấy mã xác nhận. Vui lòng gửi lại mã.' });
    }

    // Check if expired
    if (Date.now() > storedData.expiresAt) {
      delete codes[customerId];
      writeCodes(codes);
      return res.status(400).json({ error: 'Mã xác nhận đã hết hạn. Vui lòng gửi lại mã.' });
    }

    // Check if code matches
    if (storedData.code !== code.trim()) {
      return res.status(400).json({ error: 'Mã xác nhận không đúng. Vui lòng kiểm tra lại.' });
    }

    // Check if email matches
    if (storedData.email.toLowerCase() !== newEmail.toLowerCase()) {
      return res.status(400).json({ error: 'Email không khớp. Vui lòng thử lại.' });
    }

    // Update email in database
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const customerIndex = authData.users.findIndex((u: any) => u.id === customerId);

    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Update email
    authData.users[customerIndex].email = newEmail;
    authData.users[customerIndex].updatedAt = new Date().toISOString();

    // Save to file
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

    // Clear verification code
    delete codes[customerId];
    writeCodes(codes);

    return res.status(200).json({
      success: true,
      message: 'Đã thay đổi email thành công',
      customer: authData.users[customerIndex]
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return res.status(500).json({ error: 'Lỗi khi xác nhận mã' });
  }
}
