/**
 * Reviews API
 * Handles fetching and submitting product reviews
 */

import { apiGet, apiPost, ApiError } from "@/lib/api";
import { getAccessToken } from "@/lib/utils/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface Review {
  _id: string;
  product: string;
  name: string;
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  productId: string;
  name: string;
  rating: number;
  comment: string;
}

export interface CreateVerifiedReviewData {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

export interface PaginatedReviewsResponse {
  reviews: Review[];
  totalReviews: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface OrderReviewStatusResponse {
  reviewStatus: Record<string, string | null>;
  canReview: boolean;
}

/**
 * Authenticated fetch helper (matches orders.api.ts pattern)
 * Uses getAccessToken which checks accessToken/access/token/adminToken keys
 */
async function fetchWithAuth(path: string, opts: RequestInit = {}): Promise<any> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiError("No token", 401);
  }

  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(opts.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...opts, headers });

  const text = await response.text().catch(() => null);
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
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
      throw new ApiError(errMsg, statusCode);
    }

    return body.data;
  }

  if (!response.ok) {
    const errMsg = (body && (body.message || JSON.stringify(body))) ||
      response.statusText || `Request failed with status ${response.status}`;
    throw new ApiError(errMsg, response.status);
  }

  return body;
}

/**
 * Fetch paginated reviews for a specific product (limit = 3 per page)
 * This is lazy-loaded only when the product detail page is opened
 */
export async function getProductReviews(
  productId: string,
  page: number = 1
): Promise<PaginatedReviewsResponse> {
  try {
    const data = await apiGet<PaginatedReviewsResponse>(
      `/reviews/products/${productId}/reviews?page=${page}`
    );
    return data || {
      reviews: [],
      totalReviews: 0,
      currentPage: 1,
      totalPages: 0,
      hasNextPage: false
    };
  } catch (error) {
    console.error(`Failed to fetch reviews for product "${productId}":`, error);
    return {
      reviews: [],
      totalReviews: 0,
      currentPage: 1,
      totalPages: 0,
      hasNextPage: false
    };
  }
}

/**
 * Submit a new review for a product (public, no auth)
 */
export async function submitReview(reviewData: CreateReviewData): Promise<Review> {
  try {
    const data = await apiPost<Review>('/reviews', reviewData);
    return data;
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
}

/**
 * Submit a verified purchase review (auth required)
 * Uses fetchWithAuth with getAccessToken for proper token resolution
 */
export async function submitVerifiedReview(reviewData: CreateVerifiedReviewData): Promise<Review> {
  const data = await fetchWithAuth('/reviews/verified', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
  return data;
}

/**
 * Get review status for all items in an order (auth required)
 * Returns which products have been reviewed and whether reviews are allowed
 */
export async function getOrderReviewStatus(orderId: string): Promise<OrderReviewStatusResponse> {
  try {
    const data = await fetchWithAuth(`/reviews/order/${orderId}/status`);
    return data || { reviewStatus: {}, canReview: false };
  } catch (error) {
    console.error(`Failed to fetch review status for order "${orderId}":`, error);
    return { reviewStatus: {}, canReview: false };
  }
}
