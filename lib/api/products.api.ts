/**
 * Products API client
 * Handles all product-related API calls
 */

import { apiFetch, normalizeListResponse } from "@/lib/api";

export interface Product {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  price: number;
  mrp?: number;
  stock: number;
  brand?: any;
  category?: any;
  attributes?: any;
  isActive?: boolean;
}

export interface ProductsApiResponse {
  items: Product[];
  total: number;
  page: number;
  pages: number;
}

/**
 * Fetch products by brand ID or slug
 * @param brandId - Brand ObjectId or slug
 * @returns Array of products
 * @throws Error if API request fails
 */
export async function getProductsByBrand(brandId: string): Promise<Product[]> {
  try {
    const data = await apiFetch<any>(`/products?brand=${encodeURIComponent(brandId)}`);
    // Normalize to always return array
    return normalizeListResponse(data, ['items', 'products']);
  } catch (error) {
    console.error(`Failed to fetch products for brand "${brandId}":`, error);
    throw error;
  }
}

/**
 * Fetch all products with optional filters
 * @param params - Query parameters (q, brand, category, page, limit)
 * @returns Array of products
 * @throws Error if API request fails
 */
export async function getProducts(params?: Record<string, string | number>): Promise<Product[]> {
  try {
    const queryString = params 
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    
    const data = await apiFetch<any>(`/products${queryString}`);
    // Normalize to always return array
    return normalizeListResponse(data, ['items', 'products']);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}
