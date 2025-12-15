/**
 * Supabase URL Utility
 * 
 * Provides helper functions for constructing and validating Supabase storage URLs
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'product-images';

/**
 * Get the full Supabase public URL for a storage path
 * 
 * @param path - Storage path (e.g., "brands/home-essentials/logo.png")
 * @param bucket - Bucket name (defaults to SUPABASE_BUCKET env var)
 * @returns Full public URL with proper encoding
 * 
 * @example
 * getSupabasePublicUrl('brands/home-essentials/logo.png')
 * // Returns: https://xxx.supabase.co/storage/v1/object/public/product-images/brands/home-essentials/logo.png
 */
export function getSupabasePublicUrl(
  path: string,
  bucket: string = SUPABASE_BUCKET
): string | null {
  if (!path || !SUPABASE_URL) return null;

  // Remove leading slashes
  const normalizedPath = path.replace(/^\/+/, '');

  // Encode each path segment properly
  const encodedPath = normalizedPath
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodedPath}`;
}

/**
 * Check if a URL is a valid Supabase storage URL
 * 
 * @param url - URL to check
 * @returns true if URL points to Supabase storage
 */
export function isSupabaseUrl(url: string): boolean {
  if (!url || !SUPABASE_URL) return false;
  return url.startsWith(SUPABASE_URL) && url.includes('/storage/v1/object/public/');
}

/**
 * Extract the storage path from a Supabase URL
 * 
 * @param url - Full Supabase URL
 * @returns Storage path or null
 * 
 * @example
 * extractPathFromSupabaseUrl('https://xxx.supabase.co/storage/v1/object/public/product-images/brands/logo.png')
 * // Returns: 'product-images/brands/logo.png'
 */
export function extractPathFromSupabaseUrl(url: string): string | null {
  if (!isSupabaseUrl(url)) return null;

  try {
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/storage\/v1\/object\/public\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/**
 * Get brand logo URL from slug
 * 
 * @param slug - Brand slug
 * @param filename - Logo filename (defaults to 'logo.png')
 * @returns Full Supabase URL for brand logo
 */
export function getBrandLogoUrl(slug: string, filename: string = 'logo.png'): string | null {
  if (!slug) return null;
  return getSupabasePublicUrl(`brands/${slug}/${filename}`);
}

/**
 * Get category logo URL from slug
 * 
 * @param slug - Category slug
 * @param filename - Logo filename (defaults to 'logo.png')
 * @returns Full Supabase URL for category logo
 */
export function getCategoryLogoUrl(slug: string, filename: string = 'logo.png'): string | null {
  if (!slug) return null;
  return getSupabasePublicUrl(`categories/${slug}/${filename}`);
}

/**
 * Validate and normalize a brand logo URL
 * Converts relative paths, partial paths, or placeholders to proper Supabase URLs
 * 
 * @param logoUrl - Raw logo URL from API/database
 * @param brandSlug - Brand slug for fallback construction
 * @returns Valid absolute URL or null
 */
export function normalizeBrandLogoUrl(
  logoUrl: string | null | undefined,
  brandSlug: string
): string | null {
  // No URL provided - construct from slug
  if (!logoUrl) {
    return getBrandLogoUrl(brandSlug);
  }

  // Remove placeholder URLs
  if (logoUrl.includes('via.placeholder.com')) {
    return getBrandLogoUrl(brandSlug);
  }

  // Already a valid full URL
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    // If it's a Supabase URL, return as-is
    if (isSupabaseUrl(logoUrl)) {
      return logoUrl;
    }
    // If it's another valid URL, return it (could be external CDN)
    return logoUrl;
  }

  // Relative or partial path - construct full URL
  // Remove leading slashes and 'product-images/' prefix if present
  let path = logoUrl.replace(/^\/+/, '');
  if (path.startsWith('product-images/')) {
    path = path.replace('product-images/', '');
  }

  // If path doesn't start with 'brands/', add it with slug
  if (!path.startsWith('brands/')) {
    return getBrandLogoUrl(brandSlug);
  }

  // Construct full URL from path
  return getSupabasePublicUrl(path);
}

const supabaseUrlsExport = {
  getSupabasePublicUrl,
  isSupabaseUrl,
  extractPathFromSupabaseUrl,
  getBrandLogoUrl,
  getCategoryLogoUrl,
  normalizeBrandLogoUrl,
};

export default supabaseUrlsExport;
