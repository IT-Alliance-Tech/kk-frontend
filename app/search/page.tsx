"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, bRes, cRes] = await Promise.all([
        supabase.from("products").select("*").ilike("name", `%${q}%`),
        supabase.from("brands").select("*").ilike("name", `%${q}%`),
        supabase.from("categories").select("*").ilike("name", `%${q}%`),
      ]);
      setProducts(pRes.data ?? []);
      setBrands(bRes.data ?? []);
      setCategories(cRes.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    if (q.trim()) fetchSearchResults();
  }, [q, fetchSearchResults]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search results for “{q}”</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Products */}
          {products.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )}

          {/* Brands */}
          {brands.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Brands</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/brands/${b.slug}`}
                    className="p-4 bg-white rounded shadow flex items-center justify-center"
                  >
                    {b.logo_url ? (
                      /* TODO: replace with next/image if src is static */
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        className="h-12 object-contain"
                      />
                    ) : (
                      <span>{b.name}</span>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="p-4 bg-emerald-50 rounded shadow text-center font-medium"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </>
          )}

          {products.length === 0 && brands.length === 0 && categories.length === 0 && (
            <p>No results found.</p>
          )}
        </>
      )}
    </div>
  );
}
