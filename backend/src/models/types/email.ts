export interface EmailJob {
  id: string;
  type: 'verification' | 'welcome' | 'reset_password' | 'order_confirmation' | 'order_status' | 'admin_new_order';
  data: any;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  scheduledAt?: string;
  lastAttemptAt?: string;
  error?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface VerificationEmailData {
  email: string;
  firstName: string;
  code: string;
}

export interface OrderConfirmationEmailData {
  email: string;
  firstName: string;
  orderNumber: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}