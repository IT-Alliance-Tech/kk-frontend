/**
 * Brands API client
 * Handles all brand-related API calls
 * Updated: 2025-11-29 - Added defensive fallback logic for slug lookup
 */

import { apiFetch } from "@/lib/api";
import type {
  Brand,
  BrandsApiResponse,
  BrandApiResponse,
} from "@/lib/types/brand";
import {
  normalizeBrandsResponse,
  normalizeBrandResponse,
} from "@/lib/adapters/brand.adapter";

/**
 * Fetch all brands from the API
 * @returns Array of Brand objects
 * @throws Error if API request fails
 */
export async function getBrands(): Promise<Brand[]> {
  try {
    const response = await apiFetch<BrandsApiResponse>("/brands");

    // ADAPTER: Normalize response using adapter
    return normalizeBrandsResponse(response);
  } catch (error) {
    console.error("Failed to fetch brands:", error);
    throw error;
  }
}

/**
 * Slugify a string for comparison (same logic as backend)
 */
export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Fetch a single brand by slug with robust fallback logic
 * 1. Try /brands/{slug} (backend now handles slug/id/variations)
 * 2. If 404, fetch all brands and match client-side
 * @param slug - Brand slug identifier
 * @returns Brand object or null if not found
 */
export async function getBrand(slug: string): Promise<Brand | null> {
  const encodedSlug = encodeURIComponent(slug);
  
  try {
    // Primary attempt: backend should handle slug/id/variations
    console.log(`🔍 Attempting to fetch brand: ${slug}`);
    const response = await apiFetch<BrandApiResponse>(`/brands/${encodedSlug}`);
    
    // ADAPTER: Normalize response using adapter
    const brand = normalizeBrandResponse(response);
    console.log(`✅ Brand found via direct API call: ${brand.name}`);
    return brand;
  } catch (primaryError: any) {
    console.log(`⚠️ Primary brand fetch failed for "${slug}":`, primaryError?.message || primaryError);
    
    // Fallback: fetch all brands and search client-side
    try {
      console.log(`🔄 Attempting client-side brand search for: ${slug}`);
      const allBrands = await getBrands();
      
      // Normalize the search slug
      const normalizedSearch = slug.toLowerCase().trim();
      const slugifiedSearch = slugify(slug);
      
      // Try multiple matching strategies
      const brand = allBrands.find(b => {
        // Exact slug match
        if (b.slug?.toLowerCase() === normalizedSearch) return true;
        
        // Exact ID match
        if (b._id === slug) return true;
        
        // Slugified name match
        const slugifiedName = slugify(b.name);
        if (slugifiedName === slugifiedSearch) return true;
        
        // Case-insensitive name match
        if (b.name.toLowerCase() === normalizedSearch) return true;
        
        return false;
      });
      
      if (brand) {
        console.log(`✅ Brand found via client-side search: ${brand.name}`);
        return brand;
      }
      
      console.log(`❌ Brand not found after all attempts: ${slug}`);
      return null;
    } catch (fallbackError) {
      console.error("❌ Fallback brand search failed:", fallbackError);
      return null;
    }
  }
}

