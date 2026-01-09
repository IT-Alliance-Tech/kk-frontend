/**
 * Return Requests API client
 * Handles all return/replace/refund related API calls
 */

import { apiFetch, ApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/utils/auth";

const API_BASE_URL = "https://kk-backend-5c11.onrender.com";

/**
 * Fetch with authentication and envelope unwrapping
 */
async function fetchWithAuth(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError("No token", 401);
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
 * Return request payload type
 */
export interface CreateReturnRequestPayload {
  orderId: string;
  productId: string;
  actionType: "return" | "replace" | "refund";
  issueType: "damaged" | "wrong-item" | "quality-issue" | "late-delivery" | "others";
  issueDescription?: string;
  isDemo?: boolean;
}

/**
 * Return request response type
 */
export interface ReturnRequest {
  _id: string;
  userId: string;
  orderId: string;
  productId: any;
  actionType: "return" | "replace" | "refund";
  issueType: "damaged" | "wrong-item" | "quality-issue" | "late-delivery" | "others";
  issueDescription?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Paginated return requests response
 */
export interface PaginatedReturnRequests {
  returnRequests: ReturnRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a new return request
 * POST /api/returns
 */
export async function createReturnRequest(
  payload: CreateReturnRequestPayload
): Promise<ReturnRequest> {
  try {
    const data = await fetchWithAuth("/api/returns", {
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
 * Get all return requests for the logged-in user (paginated)
 * GET /api/returns/my?page=1&limit=10
 */
export async function getMyReturnRequests(
  page: number = 1,
  limit: number = 10
): Promise<PaginatedReturnRequests> {
  try {
    const data = await fetchWithAuth(`/api/returns/my?page=${page}&limit=${limit}`);
    return data;
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
 * Get return requests for a specific order
 * GET /api/returns/order/:orderId
 */
export async function getReturnRequestsByOrder(orderId: string): Promise<ReturnRequest[]> {
  try {
    const data = await fetchWithAuth(`/api/returns/order/${orderId}`);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to fetch order return requests",
      500
    );
  }
}

/**
 * Update return request status (admin only - future use)
 * PUT /api/returns/:id/status
 */
export async function updateReturnRequestStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "completed",
  adminNotes?: string,
  refundAmount?: number
): Promise<ReturnRequest> {
  try {
    const payload: any = { status };
    if (adminNotes) payload.adminNotes = adminNotes;
    if (refundAmount) payload.refundAmount = refundAmount;

    const data = await fetchWithAuth(`/api/returns/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Failed to update return request",
      500
    );
  }
}
