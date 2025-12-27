"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { buildUrl } from "@/lib/api";
import type { Brand } from "@/lib/types/brand";
import { normalizeSrc } from "@/lib/normalizeSrc";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png";
import GlobalLoader from "@/components/common/GlobalLoader"; // use default placeholder when product has no image or to replace dummy imports

export default function BrandsPreview() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBrands() {
      try {
        // Use lightweight homepage-specific API
        const res = await fetch(buildUrl("/api/homepage/brands"), { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        
        const json = await res.json();
        const data = json?.data || [];
        
        if (!cancelled) {
          // Normalize logoUrl field
          const normalized = data.map((b: any) => ({
            ...b,
            logoUrl: b.logoUrl || b.logo_url || b.logo || null
          }));
          setBrands(normalized);
        }
      } catch (err) {
        // Silently handle error - hide section on failure
        if (!cancelled) {
          setError(true);
          setBrands([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBrands();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="max-w-8xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="relative py-4 mb-4">
          <div className="flex items-center justify-center">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">Brands</h2>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <GlobalLoader size="large" />
        </div>
      </section>
    );
  }

  // Hide section on error or when empty (graceful degradation)
  if (error || !brands.length) {
    return null;
  }

  return (
    <section className="max-w-8xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header row: centered title + right aligned Explore link */}
      <div className="relative py-4">
        <div className="flex items-center justify-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">Brands</h2>
        </div>

        {/* Explore link pinned to right on same horizontal band (desktop) */}
        <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 hidden sm:block">
          <Link href="/brands" className="text-emerald-600 hover:underline font-medium">
            Explore more →
          </Link>
        </div>

        {/* Mobile: show explore below title for small screens */}
        <div className="mt-3 sm:hidden text-right">
          <Link href="/brands" className="text-emerald-600 hover:underline font-medium">
            Explore more →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        {brands.map((brand) => (
          <Link
            key={brand.id || brand.slug}
            href={`/brands/${brand.slug || brand.id}`}
            className="p-4 sm:p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
            aria-label={`View ${brand.name} brand`}
            style={{ minHeight: 140 }}
          >
            {/* Image block: defensive rendering */}
            <div className="relative w-full h-16 sm:h-20">
              <Image
                src={brand.logoUrl ?? "/brand-placeholder.svg"}
                alt={`${brand.name} logo`}
                fill
                className="object-contain"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/brand-placeholder.svg";
                }}
              />
            </div>
            {/* Brand name centered below the image; visually in middle area */}
            <div className="mt-3 flex-1 w-full flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-800 text-center">{brand.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
