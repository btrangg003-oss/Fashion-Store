/**
 * Auto Update Customer Tier
 * Tự động cập nhật tier khi có thay đổi
 */

import fs from 'fs';
import path from 'path';
import { calculateCustomerSegment, calculateAccountAge } from './customerTiers';

const AUTH_FILE = path.join(process.cwd(), 'data', 'auth.json');
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

/**
 * Update tier for a specific customer
 */
export async function updateCustomerTier(userId: string): Promise<void> {
  try {
    // Read data
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));

    // Find customer
    const customerIndex = authData.users.findIndex((u: any) => u.id === userId);
    if (customerIndex === -1) return;

    const customer = authData.users[customerIndex];

    // Calculate stats
    const userOrders = ordersData.orders.filter((order: any) => 
      order.userId === userId && order.status !== 'cancelled'
    );

    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum: number, order: any) => 
      sum + (order.total || 0), 0
    );

    const lastOrder = userOrders.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    const accountAge = calculateAccountAge(customer.createdAt);

    // Calculate new tier
    const newTier = calculateCustomerSegment({
      totalOrders,
      totalSpent,
      accountAge,
      lastOrderDate: lastOrder?.createdAt
    });

    // Update customer
    authData.users[customerIndex] = {
      ...customer,
      tier: newTier,
      totalOrders,
      totalSpent,
      lastOrderDate: lastOrder?.createdAt || null,
      tierUpdatedAt: new Date().toISOString()
    };

    // Save
    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

    console.log(`✓ Updated tier for ${customer.email}: ${newTier}`);
  } catch (error) {
    console.error('Error updating customer tier:', error);
  }
}

/**
 * Initialize tier for new customer (called on registration)
 */
export async function initializeCustomerTier(userId: string): Promise<void> {
  try {
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const customerIndex = authData.users.findIndex((u: any) => u.id === userId);
    
    if (customerIndex === -1) return;

    const customer = authData.users[customerIndex];
    const accountAge = calculateAccountAge(customer.createdAt);

    // New customers always start with 'new' tier
    const tier = accountAge <= 30 ? 'new' : 'regular';

    authData.users[customerIndex] = {
      ...customer,
      tier,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: null,
      tierUpdatedAt: new Date().toISOString()
    };

    fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

    console.log(`✓ Initialized tier for new customer ${customer.email}: ${tier}`);
  } catch (error) {
    console.error('Error initializing customer tier:', error);
  }
}
