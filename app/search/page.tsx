"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { normalizeSrc } from "@/lib/normalizeSrc";

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
      // Use unified search endpoint
      const response = await apiGet(`/search?q=${encodeURIComponent(q)}`);

      // Backend returns { products, brands, categories } already deduplicated
      setProducts(response?.products || []);
      setBrands(response?.brands || []);
      setCategories(response?.categories || []);
    } catch (err) {
      console.error("Search error:", err);
      setProducts([]);
      setBrands([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    if (q.trim()) fetchSearchResults();
  }, [q, fetchSearchResults]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Search results for &quot;{q}&quot;
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {products.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Products</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {products.map((p) => (
                  <ProductCard key={p._id || p.slug || p.id} product={p} />
                ))}
              </div>
            </>
          )}

          {brands.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Brands</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                {brands.map((b) => (
                  <Link
                    key={b._id || b.slug || b.id}
                    href={`/brands/${b.slug}`}
                    className="p-4 bg-white rounded shadow flex flex-col items-center justify-center gap-2"
                  >
                    {b.logoUrl && (
                      <Image
                        src={normalizeSrc(b.logoUrl)}
                        alt={b.name || "Brand"}
                        width={48}
                        height={48}
                        className="h-12 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <span className="text-sm font-medium text-center">
                      {b.name}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}

          {categories.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Categories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((c) => (
                  <Link
                    key={c._id || c.slug || c.id}
                    href={`/categories/${c.slug}`}
                    className="p-4 bg-emerald-50 rounded shadow text-center font-medium"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </>
          )}

          {products.length === 0 &&
            brands.length === 0 &&
            categories.length === 0 && <p>No results found.</p>}
        </>
      )}
    </div>
  );
}
