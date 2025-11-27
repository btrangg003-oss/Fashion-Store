/**
 * Customer Requests Database Operations
 */

import fs from 'fs';
import path from 'path';

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'customer-requests.json');

export interface CustomerRequest {
  id: string;
  userId: string;
  type: 'email_change' | 'phone_change' | 'return_exchange';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  data: any;
  reason: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  processedAt?: string;
}

export interface RequestsData {
  requests: CustomerRequest[];
}

// Read requests
export function readRequests(): RequestsData {
  try {
    if (!fs.existsSync(REQUESTS_FILE)) {
      return { requests: [] };
    }
    const data = fs.readFileSync(REQUESTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading requests:', error);
    return { requests: [] };
  }
}

// Write requests
export function writeRequests(data: RequestsData): void {
  try {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing requests:', error);
    throw error;
  }
}

// Create request
export function createRequest(request: Omit<CustomerRequest, 'id' | 'createdAt' | 'updatedAt'>): CustomerRequest {
  const data = readRequests();
  
  const newRequest: CustomerRequest = {
    ...request,
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.requests.push(newRequest);
  writeRequests(data);
  
  return newRequest;
}

// Get user requests
export function getUserRequests(userId: string): CustomerRequest[] {
  const data = readRequests();
  return data.requests
    .filter(r => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Get all requests (admin)
export function getAllRequests(): CustomerRequest[] {
  const data = readRequests();
  return data.requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Update request
export function updateRequest(requestId: string, updates: Partial<CustomerRequest>): CustomerRequest | null {
  const data = readRequests();
  const index = data.requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return null;
  
  data.requests[index] = {
    ...data.requests[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  writeRequests(data);
  return data.requests[index];
}

// Delete request
export function deleteRequest(requestId: string): boolean {
  const data = readRequests();
  const index = data.requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return false;
  
  data.requests.splice(index, 1);
  writeRequests(data);
  return true;
}
