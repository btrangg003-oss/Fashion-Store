import fs from 'fs';
import path from 'path';
import {
  InventoryItem,
  StockMovement,
  StockCheck,
  Supplier,
  StockAlert,
  StockStatus
} from '@/models/inventory';

const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const MOVEMENTS_FILE = path.join(DATA_DIR, 'stock-movements.json');
const CHECKS_FILE = path.join(DATA_DIR, 'stock-checks.json');
const SUPPLIERS_FILE = path.join(DATA_DIR, 'suppliers.json');
const ALERTS_FILE = path.join(DATA_DIR, 'stock-alerts.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files
const initFiles = () => {
  if (!fs.existsSync(INVENTORY_FILE)) {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(MOVEMENTS_FILE)) {
    fs.writeFileSync(MOVEMENTS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(CHECKS_FILE)) {
    fs.writeFileSync(CHECKS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(SUPPLIERS_FILE)) {
    fs.writeFileSync(SUPPLIERS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(ALERTS_FILE)) {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify([], null, 2));
  }
};

initFiles();

// Utility
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============ INVENTORY ============

export function getAllInventory(): InventoryItem[] {
  const data = fs.readFileSync(INVENTORY_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getInventoryById(id: string): InventoryItem | null {
  const items = getAllInventory();
  return items.find(item => item.id === id) || null;
}

export function getInventoryBySKU(sku: string): InventoryItem | null {
  const items = getAllInventory();
  return items.find(item => item.sku === sku) || null;
}

export function createInventoryItem(item: InventoryItem): InventoryItem {
  const items = getAllInventory();
  items.push(item);
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(items, null, 2));
  return item;
}

export function updateInventoryItem(id: string, updates: Partial<InventoryItem>): InventoryItem {
  const items = getAllInventory();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    throw new Error('Inventory item not found');
  }
  
  items[index] = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(items, null, 2));
  return items[index];
}

export function updateStockQuantity(id: string, quantity: number): InventoryItem {
  const item = getInventoryById(id);
  if (!item) {
    throw new Error('Inventory item not found');
  }
  
  // Determine status
  let status: StockStatus = 'in_stock';
  if (quantity === 0) {
    status = 'out_of_stock';
  } else if (quantity <= item.minQuantity) {
    status = 'low_stock';
  } else if (quantity >= item.maxQuantity) {
    status = 'overstock';
  }
  
  return updateInventoryItem(id, {
    quantity,
    status,
    lastMovement: new Date().toISOString()
  });
}

export function deleteInventoryItem(id: string): boolean {
  const items = getAllInventory();
  const filtered = items.filter(item => item.id !== id);
  
  if (filtered.length === items.length) {
    return false;
  }
  
  fs.writeFileSync(INVENTORY_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// ============ STOCK MOVEMENTS ============

export function getAllMovements(): StockMovement[] {
  const data = fs.readFileSync(MOVEMENTS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getMovementById(id: string): StockMovement | null {
  const movements = getAllMovements();
  return movements.find(m => m.id === id) || null;
}

export function getMovementByOrderId(orderId: string): StockMovement | null {
  const movements = getAllMovements();
  return movements.find(m => m.orderId === orderId) || null;
}

export function createMovement(movement: StockMovement): StockMovement {
  const movements = getAllMovements();
  movements.push(movement);
  fs.writeFileSync(MOVEMENTS_FILE, JSON.stringify(movements, null, 2));
  
  // Update inventory quantities only if status is completed or approved
  if (movement.status === 'completed' || movement.status === 'approved') {
    movement.items.forEach(item => {
      const inventoryItem = getInventoryBySKU(item.sku);
      if (inventoryItem) {
        let newQuantity = inventoryItem.quantity;
        
        if (movement.type === 'inbound') {
          newQuantity += item.quantity;
        } else if (movement.type === 'outbound') {
          newQuantity -= item.quantity;
        } else if (movement.type === 'adjustment') {
          newQuantity = item.quantity;
        }
        
        updateStockQuantity(inventoryItem.id, newQuantity);
      }
    });
  }
  
  return movement;
}

export function updateMovement(id: string, updates: Partial<StockMovement>): StockMovement {
  const movements = getAllMovements();
  const index = movements.findIndex(m => m.id === id);
  
  if (index === -1) {
    throw new Error('Movement not found');
  }
  
  movements[index] = {
    ...movements[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(MOVEMENTS_FILE, JSON.stringify(movements, null, 2));
  return movements[index];
}

// ============ STOCK CHECKS ============

export function getAllStockChecks(): StockCheck[] {
  const data = fs.readFileSync(CHECKS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getStockCheckById(id: string): StockCheck | null {
  const checks = getAllStockChecks();
  return checks.find(c => c.id === id) || null;
}

export function createStockCheck(check: StockCheck): StockCheck {
  const checks = getAllStockChecks();
  
  // Generate check number if not provided
  if (!check.checkNumber) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    check.checkNumber = `CHK-${dateStr}-${randomNum}`;
  }
  
  checks.push(check);
  fs.writeFileSync(CHECKS_FILE, JSON.stringify(checks, null, 2));
  return check;
}

export function updateStockCheck(id: string, updates: Partial<StockCheck>): StockCheck {
  const checks = getAllStockChecks();
  const index = checks.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error('Stock check not found');
  }
  
  checks[index] = {
    ...checks[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(CHECKS_FILE, JSON.stringify(checks, null, 2));
  return checks[index];
}

export function deleteStockCheck(id: string): boolean {
  const checks = getAllStockChecks();
  const filtered = checks.filter(c => c.id !== id);
  
  if (filtered.length === checks.length) {
    return false;
  }
  
  fs.writeFileSync(CHECKS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// ============ SUPPLIERS ============

export function getAllSuppliers(): Supplier[] {
  const data = fs.readFileSync(SUPPLIERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getSupplierById(id: string): Supplier | null {
  const suppliers = getAllSuppliers();
  return suppliers.find(s => s.id === id) || null;
}

export function createSupplier(supplier: Supplier): Supplier {
  const suppliers = getAllSuppliers();
  suppliers.push(supplier);
  fs.writeFileSync(SUPPLIERS_FILE, JSON.stringify(suppliers, null, 2));
  return supplier;
}

export function updateSupplier(id: string, updates: Partial<Supplier>): Supplier {
  const suppliers = getAllSuppliers();
  const index = suppliers.findIndex(s => s.id === id);
  
  if (index === -1) {
    throw new Error('Supplier not found');
  }
  
  suppliers[index] = {
    ...suppliers[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(SUPPLIERS_FILE, JSON.stringify(suppliers, null, 2));
  return suppliers[index];
}

export function deleteSupplier(id: string): boolean {
  const suppliers = getAllSuppliers();
  const filtered = suppliers.filter(s => s.id !== id);
  
  if (filtered.length === suppliers.length) {
    return false;
  }
  
  fs.writeFileSync(SUPPLIERS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

// ============ ALERTS ============

export function getAllAlerts(): StockAlert[] {
  const data = fs.readFileSync(ALERTS_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getActiveAlerts(): StockAlert[] {
  const alerts = getAllAlerts();
  return alerts.filter(a => !a.isResolved);
}

export function createAlert(alert: StockAlert): StockAlert {
  const alerts = getAllAlerts();
  alerts.push(alert);
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
  return alert;
}

export function resolveAlert(id: string, userId: string): StockAlert {
  const alerts = getAllAlerts();
  const index = alerts.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw new Error('Alert not found');
  }
  
  alerts[index] = {
    ...alerts[index],
    isResolved: true,
    resolvedBy: userId,
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
  return alerts[index];
}

// ============ UTILITIES ============

export function checkAndCreateAlerts(): void {
  const items = getAllInventory();
  const existingAlerts = getAllAlerts();
  
  items.forEach(item => {
    // Check low stock
    if (item.quantity <= item.minQuantity && item.quantity > 0) {
      const hasAlert = existingAlerts.some(
        a => a.productId === item.id && a.type === 'low_stock' && !a.isResolved
      );
      
      if (!hasAlert) {
        createAlert({
          id: generateId(),
          type: 'low_stock',
          severity: item.quantity === 0 ? 'critical' : 'high',
          productId: item.id,
          sku: item.sku,
          productName: item.name,
          message: `Sản phẩm ${item.name} sắp hết hàng (còn ${item.quantity})`,
          currentQuantity: item.quantity,
          threshold: item.minQuantity,
          isRead: false,
          isResolved: false,
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // Check out of stock
    if (item.quantity === 0) {
      const hasAlert = existingAlerts.some(
        a => a.productId === item.id && a.type === 'low_stock' && !a.isResolved
      );
      
      if (!hasAlert) {
        createAlert({
          id: generateId(),
          type: 'low_stock',
          severity: 'critical',
          productId: item.id,
          sku: item.sku,
          productName: item.name,
          message: `Sản phẩm ${item.name} đã hết hàng`,
          currentQuantity: 0,
          threshold: item.minQuantity,
          isRead: false,
          isResolved: false,
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // Check overstock
    if (item.quantity >= item.maxQuantity) {
      const hasAlert = existingAlerts.some(
        a => a.productId === item.id && a.type === 'overstock' && !a.isResolved
      );
      
      if (!hasAlert) {
        createAlert({
          id: generateId(),
          type: 'overstock',
          severity: 'medium',
          productId: item.id,
          sku: item.sku,
          productName: item.name,
          message: `Sản phẩm ${item.name} tồn kho quá nhiều (${item.quantity})`,
          currentQuantity: item.quantity,
          threshold: item.maxQuantity,
          isRead: false,
          isResolved: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  });
}
