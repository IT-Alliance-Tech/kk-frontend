/**
 * Cart API client
 * Handles all cart-related API calls to backend /api/cart endpoints
 */

import { getAccessToken } from "@/lib/utils/auth";

// Base API URL for cart endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

/**
 * Cart item from backend
 */
export interface BackendCartItem {
  productId: string;
  qty: number;
  price: number;
  title: string;
  image: string;
}

/**
 * Cart response from backend
 */
export interface BackendCart {
  items: BackendCartItem[];
  total: number;
}

/**
 * Standard backend API response
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Fetch with authentication
 * Adds Authorization Bearer token from localStorage
 */
async function fetchWithAuth(
  path: string,
  opts: RequestInit = {},
): Promise<any> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...opts.headers,
  };

  const response = await fetch(url, {
    ...opts,
    headers,
  });

  if (!response.ok) {
    let errorBody: any = {};
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { message: `Request failed with status ${response.status}` };
    }
    throw new Error(errorBody.message || `API error: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get user's cart
 * @returns Cart with items and total
 */
export async function getCart(): Promise<BackendCart> {
  const response: ApiResponse<BackendCart> = await fetchWithAuth("/api/cart");
  return response.data || { items: [], total: 0 };
}

/**
 * Add product to cart
 * @param productId - Product ID
 * @param qty - Quantity to add (default: 1)
 * @returns Updated cart
 */
export async function addToCart(
  productId: string,
  qty: number = 1,
): Promise<BackendCart> {
  const response: ApiResponse<BackendCart> = await fetchWithAuth("/api/cart", {
    method: "POST",
    body: JSON.stringify({ productId, qty }),
  });
  return response.data;
}

/**
 * Update cart item quantity
 * @param productId - Product ID
 * @param qty - New quantity (0 or negative removes item)
 * @returns Updated cart
 */
export async function updateCartItem(
  productId: string,
  qty: number,
): Promise<BackendCart> {
  const response: ApiResponse<BackendCart> = await fetchWithAuth(
    "/api/cart/item",
    {
      method: "PATCH",
      body: JSON.stringify({ productId, qty }),
    },
  );
  return response.data;
}

/**
 * Remove item from cart
 * @param productId - Product ID to remove
 * @returns Updated cart
 */
export async function removeCartItem(productId: string): Promise<BackendCart> {
  const response: ApiResponse<BackendCart> = await fetchWithAuth(
    "/api/cart/item",
    {
      method: "DELETE",
      body: JSON.stringify({ productId }),
    },
  );
  return response.data;
}

/**
 * Clear all items from cart
 * @returns Empty cart
 */
export async function clearCart(): Promise<BackendCart> {
  const response: ApiResponse<BackendCart> = await fetchWithAuth(
    "/api/cart/clear",
    {
      method: "POST",
    },
  );
  return response.data;
}
