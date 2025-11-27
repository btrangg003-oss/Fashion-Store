// Referral Program Service
export interface ReferralCode {
  id: string;
  userId: string;
  code: string;
  uses: number;
  earnings: number;
  createdAt: Date;
}

export interface ReferralReward {
  referrer: number; // Points for referrer
  referee: number;  // Points for new customer
}

export const REFERRAL_REWARDS: ReferralReward = {
  referrer: 500,  // 500 points = 50,000 VND
  referee: 200    // 200 points = 20,000 VND
};

export const generateReferralCode = (userId: string): string => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF${random}`;
};

export const validateReferralCode = (code: string): boolean => {
  return /^REF[A-Z0-9]{6}$/.test(code);
};

export const processReferral = (
  referralCode: string,
  newUserId: string,
  orderTotal: number
): {
  success: boolean;
  referrerReward: number;
  refereeReward: number;
  message?: string;
} => {
  if (!validateReferralCode(referralCode)) {
    return {
      success: false,
      referrerReward: 0,
      refereeReward: 0,
      message: 'Mã giới thiệu không hợp lệ'
    };
  }
  
  // Check minimum order
  if (orderTotal < 500000) {
    return {
      success: false,
      referrerReward: 0,
      refereeReward: 0,
      message: 'Đơn hàng tối thiểu 500,000đ để nhận thưởng giới thiệu'
    };
  }
  
  return {
    success: true,
    referrerReward: REFERRAL_REWARDS.referrer,
    refereeReward: REFERRAL_REWARDS.referee,
    message: 'Áp dụng mã giới thiệu thành công'
  };
};

export const getReferralStats = (referrals: unknown[]): {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  conversionRate: number;
} => {
  const total = referrals.length;
  const successful = referrals.filter(r => r.completed).length;
  const earnings = referrals.reduce((sum, r) => sum + (r.earnings || 0), 0);
  
  return {
    totalReferrals: total,
    successfulReferrals: successful,
    totalEarnings: earnings,
    conversionRate: total > 0 ? (successful / total) * 100 : 0
  };
};

export const generateReferralLink = (code: string, baseUrl: string = 'https://yourstore.com'): string => {
  return `${baseUrl}/register?ref=${code}`;
};
