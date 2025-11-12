/**
 * Orders API client
 * Handles all order-related API calls with robust error handling
 */

import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/utils/auth';
import type {
  Order,
  CreateOrderPayload,
  OrdersApiResponse,
  OrderApiResponse,
  CreateOrderApiResponse,
} from '@/lib/types/order';
import { normalizeOrdersResponse, normalizeOrderResponse } from '@/lib/adapters/order.adapter';

// Base API URL for direct backend calls (when needed)
const API_BASE_URL = 'http://localhost:5001';

/**
 * Custom error type for API errors
 */
export interface ApiError {
  status: number;
  message: string;
  body?: any;
  originalError?: any;
}

/**
 * Fetch with authentication and robust error handling
 * Automatically adds Authorization header with Bearer token
 * Handles network errors, CORS errors, and non-2xx responses
 * 
 * @param path - API path (e.g., '/api/orders/me')
 * @param opts - Fetch options
 * @returns Parsed JSON response
 * @throws ApiError with status and message
 */
export async function fetchWithAuth(
  path: string,
  opts: RequestInit = {}
): Promise<any> {
  // Get token from localStorage or cookies
  const token = getAccessToken();

  // No token found - user needs to authenticate
  if (!token) {
    const error: ApiError = {
      status: 401,
      message: 'No token',
    };
    throw error;
  }

  // Build request with Authorization header
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...opts.headers,
  };

  try {
    // Make the fetch request
    const response = await fetch(url, {
      ...opts,
      headers,
    });

    // Handle non-2xx responses
    if (!response.ok) {
      let errorBody: any = {};
      
      // Try to parse error response body
      try {
        errorBody = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, try text
        try {
          const text = await response.text();
          errorBody = { message: text };
        } catch {
          errorBody = { message: 'Unknown error' };
        }
      }

      const error: ApiError = {
        status: response.status,
        message: errorBody.message || `Request failed with status ${response.status}`,
        body: errorBody,
      };
      throw error;
    }

    // Parse and return successful response
    return await response.json();
  } catch (err) {
    // Check if this is a network error or CORS error
    if (err instanceof TypeError && err.message.includes('fetch')) {
      const error: ApiError = {
        status: 0,
        message: 'Network or CORS error',
        originalError: err,
      };
      throw error;
    }

    // Re-throw if already an ApiError
    if ((err as any).status !== undefined) {
      throw err;
    }

    // Wrap other errors
    const error: ApiError = {
      status: 0,
      message: err instanceof Error ? err.message : 'Unknown error',
      originalError: err,
    };
    throw error;
  }
}

/**
 * Create a new order
 * @param payload - Order creation payload with items, shipping address, and optional payment info
 * @returns Created Order object
 * @throws Error if API request fails
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  try {
    const response = await apiFetch<CreateOrderApiResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // ADAPTER: Normalize response using adapter
    return normalizeOrderResponse(response);
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

/**
 * Fetch all orders for the authenticated user
 * Uses robust fetchWithAuth with proper error handling
 * Handles multiple response shapes:
 * - Array of orders directly
 * - { orders: [...] }
 * - { data: [...] }
 * 
 * @returns Array of Order objects
 * @throws ApiError if request fails
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const response = await fetchWithAuth('/api/orders/me');

    // Normalize response to array
    let orders: Order[] = [];

    if (Array.isArray(response)) {
      // Direct array response
      orders = response;
    } else if (response?.orders && Array.isArray(response.orders)) {
      // { orders: [...] } shape
      orders = response.orders;
    } else if (response?.data && Array.isArray(response.data)) {
      // { data: [...] } shape
      orders = response.data;
    } else if (response?.data?.orders && Array.isArray(response.data.orders)) {
      // { data: { orders: [...] } } shape (nested)
      orders = response.data.orders;
    } else {
      // Unknown response shape - return empty array
      console.warn('Unexpected orders response shape:', response);
      return [];
    }

    // Validate each order has required fields
    const validOrders = orders.filter((order: any) => {
      const hasId = order._id || order.id;
      const hasItems = order.items && Array.isArray(order.items);
      
      if (!hasId || !hasItems) {
        console.warn('Invalid order object:', order);
        return false;
      }
      
      return true;
    });

    return validOrders;
  } catch (error) {
    // Re-throw the error to be handled by the component
    throw error;
  }
}

/**
 * Alias for getOrders() to match naming convention
 * Get current user's orders from backend
 */
export async function getMyOrders(): Promise<Order[]> {
  return getOrders();
}

/**
 * Fetch a single order by ID
 * @param id - Order ID
 * @returns Order object or null if not found
 * @throws Error if API request fails
 */
export async function getOrder(id: string): Promise<Order | null> {
  try {
    const response = await apiFetch<OrderApiResponse>(`/orders/${id}`);

    // ADAPTER: Normalize response using adapter
    return normalizeOrderResponse(response);
  } catch (error) {
    console.error(`Failed to fetch order with ID "${id}":`, error);
    // Return null for 404s, throw for other errors
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}
