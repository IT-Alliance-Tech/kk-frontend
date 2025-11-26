"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/supabase";
import { getProducts, Product } from "@/lib/api/products.api";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import HeroBanner from "@/components/HeroBanner";
import { normalizeSrc } from "@/lib/normalizeSrc";
import BrandsPreview from "@/components/BrandsPreview";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch 8 products for homepage preview using API
      const response = await getProducts({ limit: 8 });
      const items = response.items || [];
      setProducts(items.slice(0, 8));
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Category + Hero */}
      <section className="bg-white">
        <div className="max-w-8xl mx-auto px-3 sm:px-4">
          {/* homepage categories strip removed */}
          <HeroCarousel />
        </div>
      </section>

      {/* Brands Preview */}
      <BrandsPreview />

      {/* Top Products */}
      <section className="max-w-8xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        {/* Centered title */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center">
            Top Picks for You
          </h2>
        </div>

        {/* Products preview grid: 8 items, 4 per row on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 sm:p-4 animate-pulse h-[320px] md:h-[360px] bg-gray-100"
                />
              ))
            : products.map((p) => <ProductCard key={p._id || p.id} product={p} />)}
        </div>

        {/* See more link placed below the grid, right-aligned */}
        <div className="mt-6 flex justify-end">
          <Link href="/products" className="text-xs sm:text-sm text-emerald-600 hover:underline whitespace-nowrap">
            See more products →
          </Link>
        </div>
      </section>
    </div>
  );
}
