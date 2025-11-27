// Points Calculator for Reviews

export interface ReviewPointsBreakdown {
  basePoints: number;
  photoBonus: number;
  speedBonus: number;
  detailBonus: number;
  firstReviewBonus: number;
  totalPoints: number;
}

export function calculateReviewPoints(
  photosCount: number,
  commentLength: number,
  deliveredAt: string,
  isFirstReview: boolean = false
): ReviewPointsBreakdown {
  // Base points based on photos
  let basePoints = 30; // Text only
  let photoBonus = 0;
  
  if (photosCount >= 3) {
    basePoints = 70;
    photoBonus = 30; // 3+ photos
  } else if (photosCount >= 1) {
    basePoints = 40;
    photoBonus = 10; // 1-2 photos
  }

  // Speed bonus (review within 24h of delivery)
  let speedBonus = 0;
  const deliveryTime = new Date(deliveredAt).getTime();
  const now = Date.now();
  const hoursSinceDelivery = (now - deliveryTime) / (1000 * 60 * 60);
  
  if (hoursSinceDelivery <= 24) {
    speedBonus = 10;
  }

  // Detail bonus (detailed review > 100 characters)
  let detailBonus = 0;
  if (commentLength >= 100) {
    detailBonus = 10;
  }

  // First review bonus
  let firstReviewBonus = 0;
  if (isFirstReview) {
    firstReviewBonus = 20;
  }

  const totalPoints = basePoints + photoBonus + speedBonus + detailBonus + firstReviewBonus;

  return {
    basePoints,
    photoBonus,
    speedBonus,
    detailBonus,
    firstReviewBonus,
    totalPoints
  };
}

export function getPointsMessage(breakdown: ReviewPointsBreakdown): string {
  const messages: string[] = [];
  
  messages.push(`Điểm cơ bản: +${breakdown.basePoints}`);
  
  if (breakdown.photoBonus > 0) {
    messages.push(`Thưởng ảnh: +${breakdown.photoBonus}`);
  }
  
  if (breakdown.speedBonus > 0) {
    messages.push(`Đánh giá nhanh: +${breakdown.speedBonus}`);
  }
  
  if (breakdown.detailBonus > 0) {
    messages.push(`Đánh giá chi tiết: +${breakdown.detailBonus}`);
  }
  
  if (breakdown.firstReviewBonus > 0) {
    messages.push(`Đánh giá đầu tiên: +${breakdown.firstReviewBonus}`);
  }

  return messages.join('\n');
}

export function getSimplePointsMessage(photosCount: number): string {
  if (photosCount === 0) {
    return '+30 điểm (không có ảnh)';
  } else if (photosCount <= 2) {
    return '+50 điểm (1-2 ảnh)';
  } else {
    return '+100 điểm (3+ ảnh)';
  }
}
