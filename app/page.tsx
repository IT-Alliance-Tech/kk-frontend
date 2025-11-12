"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, Product, Brand, Category } from "@/lib/supabase";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryBar from "@/components/CategoryBar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import HeroBanner from "@/components/HeroBanner";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [pRes, bRes, cRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, brands(*), categories(*)")
          .eq("is_active", true)
          .limit(12),
        supabase.from("brands").select("*").eq("is_active", true).limit(10),
        supabase.from("categories").select("*").eq("is_active", true).limit(10),
      ]);
      setProducts(pRes.data ?? []);
      setBrands(bRes.data ?? []);
      setCategories(cRes.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Category + Hero */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <CategoryBar categories={categories} />
          <HeroCarousel />
        </div>
      </section>

      {/* Top Products */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Top Picks for You</h2>
          <Link href="/products" className="text-xs sm:text-sm text-emerald-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border rounded p-3 sm:p-4 animate-pulse h-56 sm:h-64 md:h-72" />
              ))
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Brands */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-10 md:py-12 bg-slate-50 rounded-lg sm:rounded-xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Brands</h2>
          <Link href="/brands" className="text-xs sm:text-sm text-emerald-600 hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition flex items-center justify-center min-h-[80px] sm:min-h-[100px] md:min-h-[120px]"
            >
              {b.logo_url ? (
                /* TODO: replace with next/image if src is static */
                <img
                  src={b.logo_url}
                  alt={b.name}
                  className="h-12 sm:h-16 md:h-20 object-contain max-w-full"
                />
              ) : (
                <span className="font-semibold text-gray-700 text-xs sm:text-sm md:text-base text-center">{b.name}</span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
