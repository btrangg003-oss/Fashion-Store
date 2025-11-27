import { useEffect, useCallback } from 'react';

/**
 * Hook để đồng bộ đơn hàng giữa web và admin
 * Tự động refresh khi có đơn hàng mới
 */
export const useOrderSync = (onUpdate?: () => void) => {
  const checkForNewOrders = useCallback(async () => {
    try {
      const lastCheck = localStorage.getItem('lastOrderCheck');
      const now = Date.now();
      
      // Chỉ check nếu đã qua 5 giây
      if (lastCheck && now - parseInt(lastCheck) < 5000) {
        return;
      }
      
      localStorage.setItem('lastOrderCheck', now.toString());
      
      // Trigger update callback
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Order sync error:', error);
    }
  }, [onUpdate]);

  useEffect(() => {
    // Check immediately
    checkForNewOrders();
    
    // Set up interval to check every 10 seconds
    const interval = setInterval(checkForNewOrders, 10000);
    
    // Listen for storage events (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'newOrder') {
        checkForNewOrders();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkForNewOrders]);

  // Function to notify about new order
  const notifyNewOrder = useCallback((orderId: string) => {
    localStorage.setItem('newOrder', JSON.stringify({
      orderId,
      timestamp: Date.now()
    }));
    
    // Trigger storage event
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'newOrder',
      newValue: orderId
    }));
  }, []);

  return { notifyNewOrder };
};

export default useOrderSync;
