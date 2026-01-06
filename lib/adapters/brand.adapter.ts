/**
 * Brand Response Adapter
 * Normalizes backend brand responses to frontend-expected shapes
 * Generated: 2025-11-10
 */

import type { Brand } from "@/lib/types/brand";

/**
 * Normalize brand list response
 * Backend returns: Brand[] or { data: Brand[] }
 * Frontend expects: Brand[]
 */
export function normalizeBrandsResponse(response: any): Brand[] {
  // Already an array
  if (Array.isArray(response)) {
    return response;
  }

  // Wrapped in data
  if (response && "data" in response && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

/**
 * Normalize single brand response
 * Backend returns: Brand or { data: Brand }
 * Frontend expects: Brand
 */
export function normalizeBrandResponse(response: any): Brand {
  // Direct brand object
  if (response && "_id" in response) {
    return response as Brand;
  }

  // Wrapped in data
  if (response && "data" in response) {
    return response.data as Brand;
  }

  throw new Error("Invalid brand response format");
}
