/**
 * Password Reset Service
 * Handle password reset tokens and operations
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const RESETS_FILE = path.join(process.cwd(), 'data', 'password-resets.json');

export interface PasswordReset {
  email: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

interface ResetsData {
  resets: PasswordReset[];
}

// Initialize database
const initializeDatabase = (): void => {
  try {
    if (!fs.existsSync(RESETS_FILE)) {
      const dir = path.dirname(RESETS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(RESETS_FILE, JSON.stringify({ resets: [] }, null, 2));
    }
  } catch (error) {
    console.error('Error initializing password resets database:', error);
  }
};

// Read resets
const readResets = (): ResetsData => {
  initializeDatabase();
  try {
    const data = fs.readFileSync(RESETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading password resets:', error);
    return { resets: [] };
  }
};

// Write resets
const writeResets = (data: ResetsData): void => {
  try {
    fs.writeFileSync(RESETS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing password resets:', error);
    throw error;
  }
};

/**
 * Generate secure reset token
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create password reset request
 */
export const createPasswordReset = (email: string): string => {
  const data = readResets();
  
  // Invalidate any existing tokens for this email
  data.resets = data.resets.map(reset => 
    reset.email === email ? { ...reset, used: true } : reset
  );
  
  // Generate new token
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  const newReset: PasswordReset = {
    email,
    token,
    expiresAt: expiresAt.toISOString(),
    used: false,
    createdAt: new Date().toISOString()
  };
  
  data.resets.push(newReset);
  writeResets(data);
  
  return token;
};

/**
 * Verify reset token
 */
export const verifyResetToken = (token: string): { valid: boolean; email?: string; error?: string } => {
  const data = readResets();
  const reset = data.resets.find(r => r.token === token);
  
  if (!reset) {
    return { valid: false, error: 'Token không hợp lệ' };
  }
  
  if (reset.used) {
    return { valid: false, error: 'Token đã được sử dụng' };
  }
  
  if (new Date(reset.expiresAt) < new Date()) {
    return { valid: false, error: 'Token đã hết hạn' };
  }
  
  return { valid: true, email: reset.email };
};

/**
 * Mark token as used
 */
export const markTokenAsUsed = (token: string): void => {
  const data = readResets();
  data.resets = data.resets.map(reset =>
    reset.token === token ? { ...reset, used: true } : reset
  );
  writeResets(data);
};

/**
 * Clean up expired tokens (run periodically)
 */
export const cleanupExpiredTokens = (): number => {
  const data = readResets();
  const now = new Date();
  const before = data.resets.length;
  
  data.resets = data.resets.filter(reset => {
    const expires = new Date(reset.expiresAt);
    const daysSinceExpiry = (now.getTime() - expires.getTime()) / (1000 * 60 * 60 * 24);
    // Keep tokens for 7 days after expiry for audit purposes
    return daysSinceExpiry < 7;
  });
  
  const removed = before - data.resets.length;
  if (removed > 0) {
    writeResets(data);
  }
  
  return removed;
};
