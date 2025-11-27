// Product Variant Service
export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  options: {
    size?: string;
    color?: string;
    material?: string;
  };
  price: number;
  comparePrice?: number;
  stock: number;
  image?: string;
  barcode?: string;
}

export const generateVariants = (
  productId: string,
  basePrice: number,
  options: {
    sizes?: string[];
    colors?: string[];
    materials?: string[];
  }
): ProductVariant[] => {
  const variants: ProductVariant[] = [];
  const { sizes = [], colors = [], materials = [] } = options;
  
  // Generate all combinations
  if (sizes.length && colors.length) {
    sizes.forEach(size => {
      colors.forEach(color => {
        variants.push({
          id: `${productId}_${size}_${color}`,
          productId,
          sku: `SKU-${productId}-${size}-${color}`.toUpperCase(),
          options: { size, color },
          price: basePrice,
          stock: 0,
          barcode: generateBarcode()
        });
      });
    });
  } else if (sizes.length) {
    sizes.forEach(size => {
      variants.push({
        id: `${productId}_${size}`,
        productId,
        sku: `SKU-${productId}-${size}`.toUpperCase(),
        options: { size },
        price: basePrice,
        stock: 0,
        barcode: generateBarcode()
      });
    });
  } else if (colors.length) {
    colors.forEach(color => {
      variants.push({
        id: `${productId}_${color}`,
        productId,
        sku: `SKU-${productId}-${color}`.toUpperCase(),
        options: { color },
        price: basePrice,
        stock: 0,
        barcode: generateBarcode()
      });
    });
  }
  
  return variants;
};

const generateBarcode = (): string => {
  return Math.random().toString().slice(2, 15);
};

export const calculateVariantStock = (variants: ProductVariant[]): number => {
  return variants.reduce((total, v) => total + v.stock, 0);
};

export const findVariant = (
  variants: ProductVariant[],
  options: { size?: string; color?: string }
): ProductVariant | undefined => {
  return variants.find(v => {
    if (options.size && v.options.size !== options.size) return false;
    if (options.color && v.options.color !== options.color) return false;
    return true;
  });
};
