// Real-time Sync Service between Admin and Website

export class SyncService {
  private static instance: SyncService;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {}

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Subscribe to changes
  subscribe(event: string, callback: (...args: unknown[]) => unknown) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  // Notify all listeners
  notify(event: string, data?: unknown) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Clear all listeners
  clear() {
    this.listeners.clear();
  }
}

// Events
export const SYNC_EVENTS = {
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  INVENTORY_UPDATED: 'inventory:updated',
  CATEGORY_UPDATED: 'category:updated',
};

export const syncService = SyncService.getInstance();
