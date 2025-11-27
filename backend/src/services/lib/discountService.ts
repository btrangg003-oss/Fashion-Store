// Discount Code Service
export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validTo: Date;
  active: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export const generateDiscountCode = (prefix: string = 'SALE'): string => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${random}`;
};

export const validateDiscount = (
  code: DiscountCode,
  orderTotal: number,
  productIds: string[]
): { valid: boolean; message?: string; discount: number } => {
  // Check if active
  if (!code.active) {
    return { valid: false, message: 'Mã giảm giá không còn hiệu lực', discount: 0 };
  }
  
  // Check date range
  const now = new Date();
  if (now < new Date(code.validFrom) || now > new Date(code.validTo)) {
    return { valid: false, message: 'Mã giảm giá đã hết hạn', discount: 0 };
  }
  
  // Check usage limit
  if (code.usageLimit && code.usedCount >= code.usageLimit) {
    return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng', discount: 0 };
  }
  
  // Check minimum purchase
  if (code.minPurchase && orderTotal < code.minPurchase) {
    return { 
      valid: false, 
      message: `Đơn hàng tối thiểu ${code.minPurchase.toLocaleString('vi-VN')}đ`, 
      discount: 0 
    };
  }
  
  // Check applicable products
  if (code.applicableProducts && code.applicableProducts.length > 0) {
    const hasApplicable = productIds.some(id => code.applicableProducts!.includes(id));
    if (!hasApplicable) {
      return { valid: false, message: 'Mã không áp dụng cho sản phẩm này', discount: 0 };
    }
  }
  
  // Calculate discount
  let discount = 0;
  if (code.type === 'percentage') {
    discount = (orderTotal * code.value) / 100;
    if (code.maxDiscount) {
      discount = Math.min(discount, code.maxDiscount);
    }
  } else if (code.type === 'fixed') {
    discount = code.value;
  } else if (code.type === 'shipping') {
    discount = code.value; // Shipping fee
  }
  
  return { valid: true, discount: Math.floor(discount) };
};

export const createBulkDiscounts = (
  count: number,
  template: Partial<DiscountCode>
): DiscountCode[] => {
  const codes: DiscountCode[] = [];
  
  for (let i = 0; i < count; i++) {
    codes.push({
      id: `discount_${Date.now()}_${i}`,
      code: generateDiscountCode(template.code?.split(/[0-9]/)[0] || 'SALE'),
      type: template.type || 'percentage',
      value: template.value || 10,
      minPurchase: template.minPurchase,
      maxDiscount: template.maxDiscount,
      usageLimit: template.usageLimit || 1,
      usedCount: 0,
      validFrom: template.validFrom || new Date(),
      validTo: template.validTo || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      active: true
    });
  }
  
  return codes;
};
