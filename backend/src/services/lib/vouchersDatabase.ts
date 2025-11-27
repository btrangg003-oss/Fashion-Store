import fs from 'fs';
import path from 'path';
import { Voucher, VoucherUsage, VoucherHistory, VoucherStatus } from '@/models/voucher';

const DATA_DIR = path.join(process.cwd(), 'data');
const VOUCHERS_FILE = path.join(DATA_DIR, 'vouchers.json');
const VOUCHER_USAGE_FILE = path.join(DATA_DIR, 'voucher-usage.json');
const VOUCHER_HISTORY_FILE = path.join(DATA_DIR, 'voucher-history.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(VOUCHERS_FILE)) {
  fs.writeFileSync(VOUCHERS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(VOUCHER_USAGE_FILE)) {
  fs.writeFileSync(VOUCHER_USAGE_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(VOUCHER_HISTORY_FILE)) {
  fs.writeFileSync(VOUCHER_HISTORY_FILE, JSON.stringify([], null, 2));
}

// Read functions
export function getAllVouchers(): Voucher[] {
  const data = fs.readFileSync(VOUCHERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getVoucherById(id: string): Voucher | null {
  const vouchers = getAllVouchers();
  return vouchers.find(v => v.id === id) || null;
}

export function getVoucherByCode(code: string): Voucher | null {
  const vouchers = getAllVouchers();
  return vouchers.find(v => v.code.toUpperCase() === code.toUpperCase()) || null;
}

export function getActiveVouchers(): Voucher[] {
  const vouchers = getAllVouchers();
  const now = new Date();
  
  return vouchers.filter(v => {
    const startDate = new Date(v.startDate);
    const endDate = new Date(v.endDate);
    return v.isActive && 
           v.status === 'active' && 
           now >= startDate && 
           now <= endDate &&
           v.currentUsage < v.maxUsageTotal;
  });
}

// Write functions
export function createVoucher(voucher: Voucher): Voucher {
  const vouchers = getAllVouchers();
  
  // Check if code already exists
  if (vouchers.some(v => v.code.toUpperCase() === voucher.code.toUpperCase())) {
    throw new Error('Mã voucher đã tồn tại');
  }
  
  vouchers.push(voucher);
  fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(vouchers, null, 2));
  
  // Log history
  logVoucherHistory({
    id: generateId(),
    voucherId: voucher.id,
    userId: voucher.createdBy,
    action: 'created',
    timestamp: new Date().toISOString()
  });
  
  return voucher;
}

export function updateVoucher(id: string, updates: Partial<Voucher>, userId: string): Voucher {
  const vouchers = getAllVouchers();
  const index = vouchers.findIndex(v => v.id === id);
  
  if (index === -1) {
    throw new Error('Voucher không tồn tại');
  }
  
  const oldVoucher = vouchers[index];
  const updatedVoucher = {
    ...oldVoucher,
    ...updates,
    updatedBy: userId,
    updatedAt: new Date().toISOString()
  };
  
  vouchers[index] = updatedVoucher;
  fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(vouchers, null, 2));
  
  // Log changes
  const changes = Object.keys(updates).map(key => ({
    field: key,
    before: (oldVoucher as any)[key],
    after: (updates as any)[key]
  }));
  
  logVoucherHistory({
    id: generateId(),
    voucherId: id,
    userId,
    action: 'updated',
    changes,
    timestamp: new Date().toISOString()
  });
  
  return updatedVoucher;
}

export function deleteVoucher(id: string, userId: string): boolean {
  const vouchers = getAllVouchers();
  const filtered = vouchers.filter(v => v.id !== id);
  
  if (filtered.length === vouchers.length) {
    return false;
  }
  
  fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(filtered, null, 2));
  
  logVoucherHistory({
    id: generateId(),
    voucherId: id,
    userId,
    action: 'deleted',
    timestamp: new Date().toISOString()
  });
  
  return true;
}

export function pauseVoucher(id: string, userId: string): Voucher {
  return updateVoucher(id, { status: 'paused', isActive: false }, userId);
}

export function resumeVoucher(id: string, userId: string): Voucher {
  return updateVoucher(id, { status: 'active', isActive: true }, userId);
}

// Voucher Usage
export function getAllVoucherUsage(): VoucherUsage[] {
  const data = fs.readFileSync(VOUCHER_USAGE_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getVoucherUsageByVoucherId(voucherId: string): VoucherUsage[] {
  const usage = getAllVoucherUsage();
  return usage.filter(u => u.voucherId === voucherId);
}

export function getVoucherUsageByUserId(userId: string): VoucherUsage[] {
  const usage = getAllVoucherUsage();
  return usage.filter(u => u.userId === userId);
}

export function recordVoucherUsage(usage: VoucherUsage): VoucherUsage {
  const allUsage = getAllVoucherUsage();
  allUsage.push(usage);
  fs.writeFileSync(VOUCHER_USAGE_FILE, JSON.stringify(allUsage, null, 2));
  
  // Update voucher current usage
  const voucher = getVoucherById(usage.voucherId);
  if (voucher) {
    updateVoucher(usage.voucherId, { 
      currentUsage: voucher.currentUsage + 1 
    }, 'system');
  }
  
  return usage;
}

// Voucher History
export function getVoucherHistory(voucherId: string): VoucherHistory[] {
  const data = fs.readFileSync(VOUCHER_HISTORY_FILE, 'utf-8');
  const history: VoucherHistory[] = JSON.parse(data);
  return history.filter(h => h.voucherId === voucherId);
}

function logVoucherHistory(history: VoucherHistory): void {
  const data = fs.readFileSync(VOUCHER_HISTORY_FILE, 'utf-8');
  const allHistory: VoucherHistory[] = JSON.parse(data);
  allHistory.push(history);
  fs.writeFileSync(VOUCHER_HISTORY_FILE, JSON.stringify(allHistory, null, 2));
}

// Auto update voucher status
export function updateVoucherStatuses(): void {
  const vouchers = getAllVouchers();
  const now = new Date();
  let updated = false;
  
  vouchers.forEach(voucher => {
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);
    let newStatus: VoucherStatus = voucher.status;
    
    if (now < startDate) {
      newStatus = 'upcoming';
    } else if (now > endDate) {
      newStatus = 'expired';
    } else if (voucher.currentUsage >= voucher.maxUsageTotal) {
      newStatus = 'expired';
    } else if (voucher.isActive && voucher.status !== 'paused') {
      newStatus = 'active';
    }
    
    if (newStatus !== voucher.status) {
      voucher.status = newStatus;
      updated = true;
    }
  });
  
  if (updated) {
    fs.writeFileSync(VOUCHERS_FILE, JSON.stringify(vouchers, null, 2));
  }
}

// Utility functions
export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validation
export function validateVoucherCode(code: string): boolean {
  return /^[A-Z0-9]{6,20}$/.test(code);
}
