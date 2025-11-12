/**
 * Order Response Adapter
 * Normalizes backend order responses to frontend-expected shapes
 * Generated: 2025-11-10
 */

import type { Order } from '@/lib/types/order';

/**
 * Normalize order list response
 * Backend returns: Order[] or { data: Order[] }
 * Frontend expects: Order[]
 */
export function normalizeOrdersResponse(response: any): Order[] {
  // Already an array
  if (Array.isArray(response)) {
    return response;
  }
  
  // Wrapped in data
  if (response && 'data' in response && Array.isArray(response.data)) {
    return response.data;
  }
  
  console.warn('Unexpected orders response format:', response);
  return [];
}

/**
 * Normalize single order response
 * Backend returns: Order or { data: Order }
 * Frontend expects: Order
 */
export function normalizeOrderResponse(response: any): Order {
  // Direct order object
  if (response && '_id' in response) {
    return response as Order;
  }
  
  // Wrapped in data
  if (response && 'data' in response) {
    return response.data as Order;
  }
  
  throw new Error('Invalid order response format');
}
