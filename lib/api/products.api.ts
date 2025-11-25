/**
 * Products API client
 * Handles all product-related API calls
 */

import { apiFetch } from "@/lib/api";

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
 * @returns Products API response with items array
 * @throws Error if API request fails
 */
export async function getProductsByBrand(brandId: string): Promise<ProductsApiResponse> {
  try {
    const response = await apiFetch<ProductsApiResponse>(`/products?brand=${encodeURIComponent(brandId)}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch products for brand "${brandId}":`, error);
    throw error;
  }
}

/**
 * Fetch all products with optional filters
 * @param params - Query parameters (q, brand, category, page, limit)
 * @returns Products API response with items array
 * @throws Error if API request fails
 */
export async function getProducts(params?: Record<string, string | number>): Promise<ProductsApiResponse> {
  try {
    const queryString = params 
      ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
      : '';
    
    const response = await apiFetch<ProductsApiResponse>(`/products${queryString}`);
    return response;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
}
