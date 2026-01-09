/**
 * Cart API client
 * Handles all cart-related API calls to backend /api/cart endpoints
 */

import { getAccessToken } from "@/lib/utils/auth";
import { ApiError } from "@/lib/api";

// Base API URL for cart endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://kk-backend-5c11.onrender.com/api";

/**
 * Cart item from backend
 */
export interface BackendCartItem {
  productId: string;
  qty: number;
  price: number;
  title: string;
  image: string;
  variantId?: string;
  variantName?: string;
}

/**
 * Cart response from backend
 */
export interface BackendCart {
  items: BackendCartItem[];
  total: number;
}

/**
 * Fetch with authentication that understands backend envelope
 * { statusCode, success, error, data }
 * Returns `data` directly for success, throws ApiError for failures
 */
async function fetchWithAuth(
  path: string,
  opts: RequestInit = {},
): Promise<any> {
  const token = getAccessToken();

  if (!token) {
    throw new ApiError("No authentication token found", 401);
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

  // Parse response body
  const text = await response.text().catch(() => null);
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (e) {
    body = text;
  }

  // Handle backend envelope format: { statusCode, success, error, data }
  if (body && typeof body === "object" && ("statusCode" in body || "success" in body)) {
    const statusCode = body.statusCode ?? response.status;
    const okFlag = body.success === true;

    if (!okFlag) {
      // Extract error message from envelope
      const errMsg =
        (body.error && (body.error.message || JSON.stringify(body.error))) ||
        body.message ||
        body.error ||
        `Request failed with status ${statusCode}`;
      const details = body.error?.details ?? body.details ?? null;
      throw new ApiError(errMsg, statusCode, details);
    }

    // Success: return inner data property
    return body.data;
  }

  // Fallback for non-envelope responses
  if (!response.ok) {
    const errMsg =
      (body && (body.message || JSON.stringify(body))) ||
      `API error: ${response.status}`;
    throw new ApiError(errMsg, response.status, body);
  }

  return body;
}

/**
 * Get user's cart
 * @returns Cart with items and total
 */
export async function getCart(): Promise<BackendCart> {
  const data = await fetchWithAuth("/cart");
  return data || { items: [], total: 0 };
}

/**
 * Add product to cart
 * @param productId - Product ID
 * @param qty - Quantity to add (default: 1)
 * @param variantId - Optional variant ID
 * @returns Updated cart
 */
export async function addToCart(
  productId: string,
  qty: number = 1,
  variantId?: string,
): Promise<BackendCart> {
  const payload: any = { productId, qty };
  if (variantId) {
    payload.variantId = variantId;
  }
  return fetchWithAuth("/cart", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Update cart item quantity
 * @param productId - Product ID
 * @param qty - New quantity (0 or negative removes item)
 * @param variantId - Optional variant ID (required if item has variant)
 * @returns Updated cart
 */
export async function updateCartItem(
  productId: string,
  qty: number,
  variantId?: string,
): Promise<BackendCart> {
  const payload: any = { productId, qty };
  if (variantId) {
    payload.variantId = variantId;
  }
  return fetchWithAuth("/cart/item", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 * Remove item from cart
 * @param productId - Product ID to remove
 * @param variantId - Optional variant ID (required if item has variant)
 * @returns Updated cart
 */
export async function removeCartItem(
  productId: string,
  variantId?: string,
): Promise<BackendCart> {
  const payload: any = { productId };
  if (variantId) {
    payload.variantId = variantId;
  }
  return fetchWithAuth("/cart/item", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

/**
 * Clear all items from cart
 * @returns Empty cart
 */
export async function clearCart(): Promise<BackendCart> {
  return fetchWithAuth("/cart/clear", {
    method: "POST",
  });
}
