/**
 * Return API client (Item-Level)
 * Handles return requests inline on Order items.
 */

import { apiFetch, ApiError } from "@/lib/api";
import { API_BASE, buildUrl, getAuthToken } from "@/lib/api";

/**
 * Fetch with authentication and envelope unwrapping
 */
async function fetchWithAuth(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError("No token", 401);
  }

  const url = buildUrl(path);
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...opts.headers,
  };

  const response = await fetch(url, {
    ...opts,
    headers,
  });

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
      const errMsg =
        (body.error && (body.error.message || JSON.stringify(body.error))) ||
        body.message ||
        body.error ||
        `Request failed with status ${statusCode}`;
      const details = body.error?.details ?? body.details ?? null;
      throw new ApiError(errMsg, statusCode, details);
    }

    // If the envelope contains pagination fields alongside data,
    // return the full body so callers can access page/totalPages/totalCount.
    if ("page" in body || "totalPages" in body || "totalCount" in body) {
      return body;
    }

    return body.data;
  }

  if (!response.ok) {
    const errMsg =
      (body && (body.message || JSON.stringify(body))) ||
      response.statusText ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errMsg, response.status, body);
  }

  return body;
}

/**
 * Return request payload type mappings for the Item-Level API
 */
export interface CreateReturnRequestPayload {
  orderId: string;
  itemId: string;
  qty: number;
}

export type ReturnStatus = 'none' | 'requested' | 'initiated' | 'in_process' | 'completed';

export interface AdminReturnItem {
  orderId: string;
  itemId: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  qtyOrdered: number;
  returnRequestedQty: number;
  returnStatus: ReturnStatus;
  returnRequestedAt: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: any;
  createdAt: string;
}

export interface PaginatedAdminReturns {
  returnRequests: AdminReturnItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a new return request
 * POST /api/returns/request
 */
export async function createReturnRequest(
  payload: CreateReturnRequestPayload
): Promise<any> {
  try {
    const data = await fetchWithAuth("/api/returns/request", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to create return request",
      500
    );
  }
}

/**
 * ========================================
 * ADMIN API FUNCTIONS
 * ========================================
 */

/**
 * Get all return requests (Admin only)
 * GET /api/admin/returns?returnStatus=&page=&limit=
 */
export async function adminGetAllReturnRequests(
  filters?: {
    returnStatus?: ReturnStatus;
    page?: number;
    limit?: number;
  }
): Promise<PaginatedAdminReturns> {
  try {
    const params = new URLSearchParams();
    if (filters?.returnStatus) params.append("returnStatus", filters.returnStatus);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const path = queryString ? `/api/admin/returns?${queryString}` : "/api/admin/returns";

    // The backend returns:
    // { data: [...], page, totalPages, totalCount }
    const res = await fetchWithAuth(path);

    // Map backend response shape to what the UI expects (PaginatedAdminReturns)
    return {
      returnRequests: res.data || res || [],
      pagination: {
        page: res.page || 1,
        limit: filters?.limit || 10,
        total: res.totalCount || 0,
        totalPages: res.totalPages || 1
      }
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to fetch return requests",
      500
    );
  }
}

/**
 * Update return request status (Admin only)
 * PATCH /api/admin/returns/:orderId/:itemId
 */
export async function adminUpdateReturnStatus(
  orderId: string,
  itemId: string,
  returnStatus: ReturnStatus
): Promise<any> {
  try {
    const data = await fetchWithAuth(`/api/admin/returns/${orderId}/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ returnStatus }),
    });
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to update return status",
      500
    );
  }
}
