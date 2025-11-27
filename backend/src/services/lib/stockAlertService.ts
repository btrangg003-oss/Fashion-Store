// Stock Alert Service
export interface StockAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  alertLevel: 'critical' | 'warning' | 'info';
  suggestedReorder: number;
}

export const checkStockLevels = (products: any[]): StockAlert[] => {
  const alerts: StockAlert[] = [];
  
  products.forEach(product => {
    const stock = product.stock || 0;
    const reorderPoint = product.reorderPoint || 10;
    
    if (stock <= 0) {
      alerts.push({
        productId: product.id,
        productName: product.name,
        currentStock: stock,
        reorderPoint,
        alertLevel: 'critical',
        suggestedReorder: reorderPoint * 2
      });
    } else if (stock <= reorderPoint) {
      alerts.push({
        productId: product.id,
        productName: product.name,
        currentStock: stock,
        reorderPoint,
        alertLevel: 'warning',
        suggestedReorder: reorderPoint - stock + 10
      });
    } else if (stock <= reorderPoint * 1.5) {
      alerts.push({
        productId: product.id,
        productName: product.name,
        currentStock: stock,
        reorderPoint,
        alertLevel: 'info',
        suggestedReorder: reorderPoint - stock
      });
    }
  });
  
  return alerts.sort((a, b) => {
    const levelOrder = { critical: 0, warning: 1, info: 2 };
    return levelOrder[a.alertLevel] - levelOrder[b.alertLevel];
  });
};

export const generatePurchaseOrder = (alerts: StockAlert[]) => {
  return alerts
    .filter(alert => alert.alertLevel !== 'info')
    .map(alert => ({
      productId: alert.productId,
      productName: alert.productName,
      quantity: alert.suggestedReorder,
      priority: alert.alertLevel === 'critical' ? 'urgent' : 'normal'
    }));
};
