import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

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
    const { customerId, newEmail } = req.body;

    if (!customerId || !newEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }

    // Check if email already exists
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const emailExists = authData.users.some((u: any) => 
      u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== customerId
    );

    if (emailExists) {
      return res.status(400).json({ error: 'Email này đã được sử dụng' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code (expires in 10 minutes)
    const codes = readCodes();
    codes[customerId] = {
      code,
      email: newEmail,
      expiresAt: Date.now() + 10 * 60 * 1000
    };
    writeCodes(codes);

    console.log('Verification code stored:', { customerId, code, email: newEmail });

    // Send email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
      to: newEmail,
      subject: 'Mã xác nhận thay đổi email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Xác nhận thay đổi email</h2>
          <p>Bạn đang thực hiện thay đổi email tài khoản.</p>
          <p>Mã xác nhận của bạn là:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #3b82f6; margin: 0; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          </div>
          <p>Mã này sẽ hết hạn sau 10 phút.</p>
          <p style="color: #6b7280; font-size: 14px;">Nếu bạn không thực hiện thao tác này, vui lòng bỏ qua email này.</p>
        </div>
      `
    });

    return res.status(200).json({ 
      success: true,
      message: 'Đã gửi mã xác nhận'
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return res.status(500).json({ error: 'Lỗi khi gửi mã xác nhận' });
  }
}
