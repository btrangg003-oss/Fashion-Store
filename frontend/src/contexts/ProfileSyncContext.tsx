import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ProfileSyncContextType {
  // Trigger refresh cho các tabs
  refreshDashboard: () => void;
  refreshOrders: () => void;
  refreshAddresses: () => void;
  refreshWishlist: () => void;
  refreshReviews: () => void;
  refreshCoupons: () => void;
  refreshLoyalty: () => void;
  refreshReturns: () => void;
  refreshAll: () => void;

  // Counters để trigger re-fetch
  dashboardRefreshCount: number;
  ordersRefreshCount: number;
  addressesRefreshCount: number;
  wishlistRefreshCount: number;
  reviewsRefreshCount: number;
  couponsRefreshCount: number;
  loyaltyRefreshCount: number;
  returnsRefreshCount: number;
}

const ProfileSyncContext = createContext<ProfileSyncContextType | undefined>(undefined);

export const ProfileSyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dashboardRefreshCount, setDashboardRefreshCount] = useState(0);
  const [ordersRefreshCount, setOrdersRefreshCount] = useState(0);
  const [addressesRefreshCount, setAddressesRefreshCount] = useState(0);
  const [wishlistRefreshCount, setWishlistRefreshCount] = useState(0);
  const [reviewsRefreshCount, setReviewsRefreshCount] = useState(0);
  const [couponsRefreshCount, setCouponsRefreshCount] = useState(0);
  const [loyaltyRefreshCount, setLoyaltyRefreshCount] = useState(0);
  const [returnsRefreshCount, setReturnsRefreshCount] = useState(0);

  const refreshDashboard = useCallback(() => {
    setDashboardRefreshCount(prev => prev + 1);
  }, []);

  const refreshOrders = useCallback(() => {
    setOrdersRefreshCount(prev => prev + 1);
    // Orders affect dashboard stats
    setDashboardRefreshCount(prev => prev + 1);
  }, []);

  const refreshAddresses = useCallback(() => {
    setAddressesRefreshCount(prev => prev + 1);
  }, []);

  const refreshWishlist = useCallback(() => {
    setWishlistRefreshCount(prev => prev + 1);
    // Wishlist affects dashboard stats
    setDashboardRefreshCount(prev => prev + 1);
  }, []);

  const refreshReviews = useCallback(() => {
    setReviewsRefreshCount(prev => prev + 1);
    // Reviews affect dashboard and loyalty
    setDashboardRefreshCount(prev => prev + 1);
    setLoyaltyRefreshCount(prev => prev + 1);
  }, []);

  const refreshCoupons = useCallback(() => {
    setCouponsRefreshCount(prev => prev + 1);
    // Coupons affect dashboard stats
    setDashboardRefreshCount(prev => prev + 1);
  }, []);

  const refreshLoyalty = useCallback(() => {
    setLoyaltyRefreshCount(prev => prev + 1);
    // Loyalty affects dashboard
    setDashboardRefreshCount(prev => prev + 1);
  }, []);

  const refreshReturns = useCallback(() => {
    setReturnsRefreshCount(prev => prev + 1);
  }, []);

  const refreshAll = useCallback(() => {
    setDashboardRefreshCount(prev => prev + 1);
    setOrdersRefreshCount(prev => prev + 1);
    setAddressesRefreshCount(prev => prev + 1);
    setWishlistRefreshCount(prev => prev + 1);
    setReviewsRefreshCount(prev => prev + 1);
    setCouponsRefreshCount(prev => prev + 1);
    setLoyaltyRefreshCount(prev => prev + 1);
    setReturnsRefreshCount(prev => prev + 1);
  }, []);

  const value = {
    refreshDashboard,
    refreshOrders,
    refreshAddresses,
    refreshWishlist,
    refreshReviews,
    refreshCoupons,
    refreshLoyalty,
    refreshReturns,
    refreshAll,
    dashboardRefreshCount,
    ordersRefreshCount,
    addressesRefreshCount,
    wishlistRefreshCount,
    reviewsRefreshCount,
    couponsRefreshCount,
    loyaltyRefreshCount,
    returnsRefreshCount
  };

  return (
    <ProfileSyncContext.Provider value={value}>
      {children}
    </ProfileSyncContext.Provider>
  );
};

export const useProfileSync = () => {
  const context = useContext(ProfileSyncContext);
  if (context === undefined) {
    throw new Error('useProfileSync must be used within a ProfileSyncProvider');
  }
  return context;
};
