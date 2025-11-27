// Loyalty & Rewards Types

export type MemberTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface LoyaltyPoints {
  userId: string;
  currentPoints: number;
  lifetimePoints: number;
  tier: MemberTier;
  tierProgress: number; // 0-100%
  nextTierPoints: number;
  expiringPoints?: {
    points: number;
    expiryDate: string;
  };
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'refund';
  points: number;
  description: string;
  reference?: string; // Order ID, etc.
  createdAt: string;
  expiresAt?: string;
}

export interface TierBenefit {
  tier: MemberTier;
  name: string;
  color: string;
  icon: string;
  minPoints: number;
  benefits: string[];
  discountRate: number; // %
  pointsMultiplier: number; // 1x, 1.5x, 2x, etc.
  freeShipping: boolean;
  birthdayBonus: number;
  prioritySupport: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'one-time';
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  expiresAt?: string;
  icon: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'voucher' | 'gift' | 'shipping';
  value: number;
  image?: string;
  stock: number;
  minTier?: MemberTier;
  expiresAt?: string;
}
