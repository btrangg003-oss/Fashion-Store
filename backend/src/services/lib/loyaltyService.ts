// Loyalty Program Service
import { TierBenefit, MemberTier, PointTransaction, Mission } from '@/models/loyalty';
import fs from 'fs';
import path from 'path';

const POINTS_FILE = path.join(process.cwd(), 'data', 'loyalty-points.json');
const TRANSACTIONS_FILE = path.join(process.cwd(), 'data', 'point-transactions.json');

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  benefits: {
    discountPercent: number;
    freeShipping: boolean;
    prioritySupport: boolean;
    birthdayBonus: number;
  };
  color: string;
  icon: string;
}

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Đồng',
    minPoints: 0,
    benefits: {
      discountPercent: 0,
      freeShipping: false,
      prioritySupport: false,
      birthdayBonus: 100
    },
    color: '#cd7f32',
    icon: '🥉'
  },
  {
    id: 'silver',
    name: 'Bạc',
    minPoints: 1000,
    benefits: {
      discountPercent: 5,
      freeShipping: false,
      prioritySupport: false,
      birthdayBonus: 500
    },
    color: '#94a3b8', // Slate blue - đẹp hơn xám bạc
    icon: '🥈'
  },
  {
    id: 'gold',
    name: 'Vàng',
    minPoints: 5000,
    benefits: {
      discountPercent: 10,
      freeShipping: true,
      prioritySupport: false,
      birthdayBonus: 1000
    },
    color: '#ffd700',
    icon: '🥇'
  },
  {
    id: 'platinum',
    name: 'Bạch Kim',
    minPoints: 10000,
    benefits: {
      discountPercent: 15,
      freeShipping: true,
      prioritySupport: true,
      birthdayBonus: 2000
    },
    color: '#e5e4e2',
    icon: '💎'
  },
  {
    id: 'diamond',
    name: 'Kim Cương',
    minPoints: 25000,
    benefits: {
      discountPercent: 20,
      freeShipping: true,
      prioritySupport: true,
      birthdayBonus: 5000
    },
    color: '#b9f2ff',
    icon: '💎'
  }
];

export const TIER_BENEFITS: TierBenefit[] = LOYALTY_TIERS.map(tier => ({
  tier: tier.id as MemberTier,
  name: tier.name,
  color: tier.color,
  icon: tier.icon,
  minPoints: tier.minPoints,
  benefits: [
    tier.benefits.discountPercent > 0 ? `Giảm ${tier.benefits.discountPercent}% mọi đơn hàng` : 'Tích điểm mọi đơn hàng',
    tier.benefits.freeShipping ? 'Miễn phí vận chuyển' : 'Phí vận chuyển tiêu chuẩn',
    tier.benefits.prioritySupport ? 'Hỗ trợ ưu tiên 24/7' : 'Hỗ trợ khách hàng',
    `Thưởng sinh nhật ${tier.benefits.birthdayBonus.toLocaleString('vi-VN')} điểm`
  ],
  discountRate: tier.benefits.discountPercent,
  pointsMultiplier: tier.id === 'diamond' ? 2 : tier.id === 'platinum' ? 1.5 : 1,
  freeShipping: tier.benefits.freeShipping,
  birthdayBonus: tier.benefits.birthdayBonus,
  prioritySupport: tier.benefits.prioritySupport
}));

// File operations
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readPointsData = (): Record<string, any> => {
  ensureDataDir();
  if (!fs.existsSync(POINTS_FILE)) {
    fs.writeFileSync(POINTS_FILE, JSON.stringify({}));
    return {};
  }
  return JSON.parse(fs.readFileSync(POINTS_FILE, 'utf-8'));
};

const writePointsData = (data: Record<string, any>) => {
  ensureDataDir();
  fs.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2));
};

const readTransactions = (): PointTransaction[] => {
  ensureDataDir();
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([]));
    return [];
  }
  return JSON.parse(fs.readFileSync(TRANSACTIONS_FILE, 'utf-8'));
};

const writeTransactions = (transactions: PointTransaction[]) => {
  ensureDataDir();
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
};

// Points calculation
export const calculatePoints = (orderTotal: number, tier: MemberTier = 'bronze'): number => {
  const basePoints = Math.floor(orderTotal / 1000); // 1 point per 1000 VND
  const tierBenefit = TIER_BENEFITS.find(t => t.tier === tier);
  return Math.floor(basePoints * (tierBenefit?.pointsMultiplier || 1));
};

export const getTierByPoints = (points: number): LoyaltyTier => {
  const tiers = [...LOYALTY_TIERS].reverse();
  return tiers.find(tier => points >= tier.minPoints) || LOYALTY_TIERS[0];
};

export const getNextTier = (currentPoints: number): { tier: LoyaltyTier; pointsNeeded: number } | null => {
  const currentTier = getTierByPoints(currentPoints);
  const currentIndex = LOYALTY_TIERS.findIndex(t => t.id === currentTier.id);
  
  if (currentIndex === LOYALTY_TIERS.length - 1) {
    return null; // Already at highest tier
  }
  
  const nextTier = LOYALTY_TIERS[currentIndex + 1];
  return {
    tier: nextTier,
    pointsNeeded: nextTier.minPoints - currentPoints
  };
};

// User points operations
export const getUserPoints = (userId: string) => {
  const data = readPointsData();
  return data[userId] || {
    currentPoints: 0,
    lifetimePoints: 0,
    tier: 'bronze'
  };
};

export const addPoints = (userId: string, points: number, description: string, reference?: string): PointTransaction => {
  const data = readPointsData();
  const userPoints = data[userId] || { currentPoints: 0, lifetimePoints: 0 };
  
  userPoints.currentPoints += points;
  userPoints.lifetimePoints += points;
  userPoints.tier = getTierByPoints(userPoints.lifetimePoints).id;
  
  data[userId] = userPoints;
  writePointsData(data);
  
  const transaction: PointTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: 'earn',
    points,
    description,
    reference,
    createdAt: new Date().toISOString()
  };
  
  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);
  
  return transaction;
};

export const deductPoints = (userId: string, points: number, description: string, reference?: string): PointTransaction | null => {
  const data = readPointsData();
  const userPoints = data[userId];
  
  if (!userPoints || userPoints.currentPoints < points) {
    return null; // Insufficient points
  }
  
  userPoints.currentPoints -= points;
  data[userId] = userPoints;
  writePointsData(data);
  
  const transaction: PointTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type: 'redeem',
    points: -points,
    description,
    reference,
    createdAt: new Date().toISOString()
  };
  
  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);
  
  return transaction;
};

export const getUserTransactions = (userId: string, limit = 50): PointTransaction[] => {
  const transactions = readTransactions();
  return transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const redeemPoints = (points: number, rewardType: 'discount' | 'voucher'): {
  success: boolean;
  value: number;
  pointsUsed: number;
} => {
  if (rewardType === 'discount') {
    // 100 points = 10,000 VND discount
    const value = (points / 100) * 10000;
    return {
      success: true,
      value: Math.floor(value),
      pointsUsed: points
    };
  }
  
  return { success: false, value: 0, pointsUsed: 0 };
};

// Missions
export const getAvailableMissions = (userId: string): Mission[] => {
  const userPoints = getUserPoints(userId);
  const transactions = getUserTransactions(userId, 100);
  
  const today = new Date();
  const thisMonth = today.getMonth();
  const ordersThisMonth = transactions.filter(t => 
    t.type === 'earn' && new Date(t.createdAt).getMonth() === thisMonth
  ).length;
  
  return [
    {
      id: 'daily_login',
      title: 'Đăng nhập hàng ngày',
      description: 'Đăng nhập vào tài khoản mỗi ngày',
      type: 'daily',
      points: 10,
      progress: 1,
      target: 1,
      completed: true,
      icon: '📅'
    },
    {
      id: 'first_order',
      title: 'Đơn hàng đầu tiên',
      description: 'Hoàn thành đơn hàng đầu tiên của bạn',
      type: 'one-time',
      points: 500,
      progress: transactions.length > 0 ? 1 : 0,
      target: 1,
      completed: transactions.length > 0,
      icon: '🎁'
    },
    {
      id: 'monthly_orders',
      title: 'Mua sắm tháng này',
      description: 'Hoàn thành 5 đơn hàng trong tháng',
      type: 'monthly',
      points: 1000,
      progress: ordersThisMonth,
      target: 5,
      completed: ordersThisMonth >= 5,
      icon: '🛍️'
    },
    {
      id: 'review_product',
      title: 'Đánh giá sản phẩm',
      description: 'Viết đánh giá cho sản phẩm đã mua',
      type: 'weekly',
      points: 50,
      progress: 0,
      target: 3,
      completed: false,
      icon: '⭐'
    }
  ];
};
