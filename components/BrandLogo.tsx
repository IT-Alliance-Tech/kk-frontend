/**
 * BrandLogo Component
 * 
 * Reusable component for displaying brand logos with:
 * - Automatic fallback to placeholder
 * - Error handling
 * - Consistent sizing
 * - Loading states
 * - Proper URL normalization
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeBrandLogoUrl } from "@/lib/supabaseUrls";

interface BrandLogoProps {
  /** Brand name for alt text */
  name: string;
  /** Brand slug for URL construction */
  slug: string;
  /** Logo URL from API (can be full URL, partial path, or null) */
  logoUrl?: string | null;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Additional CSS classes */
  className?: string;
  /** Priority loading for above-the-fold images */
  priority?: boolean;
  /** Custom fallback image path */
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "/brand-placeholder.svg";

export default function BrandLogo({
  name,
  slug,
  logoUrl,
  width = 120,
  height = 120,
  className = "object-contain",
  priority = false,
  fallbackSrc = DEFAULT_FALLBACK,
}: BrandLogoProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    // Normalize URL on mount
    const normalized = normalizeBrandLogoUrl(logoUrl, slug);
    return normalized || fallbackSrc;
  });
  
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      console.warn(`Failed to load brand logo for: ${name} (${slug})`);
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={`${name} logo`}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={handleError}
      // Disable optimization for placeholder to avoid warnings
      unoptimized={imgSrc === fallbackSrc}
    />
  );
}

/**
 * Compact variant for lists/grids
 */
export function BrandLogoCompact(props: BrandLogoProps) {
  return (
    <BrandLogo
      {...props}
      width={props.width || 80}
      height={props.height || 80}
      className={props.className || "object-contain p-2"}
    />
  );
}

/**
 * Large variant for detail pages
 */
export function BrandLogoLarge(props: BrandLogoProps) {
  return (
    <BrandLogo
      {...props}
      width={props.width || 200}
      height={props.height || 200}
      className={props.className || "object-contain p-4"}
    />
  );
}
