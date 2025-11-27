import type { NextApiRequest, NextApiResponse } from 'next';
import { readDatabase, writeDatabase } from '@/services/database';
import { verifyResetToken, markTokenAsUsed } from '@/services/passwordResetService';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }

    // Verify token
    const verification = verifyResetToken(token);
    if (!verification.valid) {
      return res.status(400).json({ error: verification.error });
    }

    const email = verification.email!;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const database = await readDatabase();
    const userIndex = database.users.findIndex((u: any) => u.email === email);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    database.users[userIndex].password = hashedPassword;
    database.users[userIndex].updatedAt = new Date().toISOString();

    await writeDatabase(database);

    // Mark token as used
    markTokenAsUsed(token);

    return res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
