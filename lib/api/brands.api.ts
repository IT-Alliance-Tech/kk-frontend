/**
 * Brands API client
 * Handles all brand-related API calls
 */

import { apiFetch } from '@/lib/api';
import type { Brand, BrandsApiResponse, BrandApiResponse } from '@/lib/types/brand';
import { normalizeBrandsResponse, normalizeBrandResponse } from '@/lib/adapters/brand.adapter';

/**
 * Fetch all brands from the API
 * @returns Array of Brand objects
 * @throws Error if API request fails
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await apiFetch<BrandsApiResponse>('/brands');
    
    // ADAPTER: Normalize response using adapter
    return normalizeBrandsResponse(response);
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    throw error;
  }
}

/**
 * Fetch a single brand by slug
 * @param slug - Brand slug identifier
 * @returns Brand object
 * @throws Error if API request fails or brand not found
 */
export async function getBrand(slug: string): Promise<Brand> {
  try {
    const response = await apiFetch<BrandApiResponse>(`/brands/${slug}`);
    
    // ADAPTER: Normalize response using adapter
    return normalizeBrandResponse(response);
  } catch (error) {
    console.error(`Failed to fetch brand with slug "${slug}":`, error);
    throw error;
  }
}
