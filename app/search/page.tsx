"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import FilterPanel from "@/components/FilterPanel";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { normalizeSrc } from "@/lib/normalizeSrc";
import GlobalLoader from "@/components/common/GlobalLoader";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<any[]>([]); // All brands from master list
  const [allCategories, setAllCategories] = useState<any[]>([]); // All categories from master list
  const [brands, setBrands] = useState<any[]>([]); // Brands from search results (for display)
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all brands and categories once on mount
  useEffect(() => {
    const fetchAllFilters = async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([
          apiGet('/brands'),
          apiGet('/categories')
        ]);
        // apiGet already unwraps envelope and returns data array directly
        setAllBrands(Array.isArray(brandsResponse) ? brandsResponse : []);
        setAllCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      } catch (err) {
        setAllBrands([]);
        setAllCategories([]);
      }
    };

    fetchAllFilters();
  }, []); // Run only once on mount

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);

    try {
      // Use unified search endpoint
      const response = await apiGet(`/search?q=${encodeURIComponent(q)}`);

      // Backend returns { products, brands, categories } already deduplicated
      const fetchedProducts = response?.products || [];
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts); // Initialize filtered products
      setBrands(response?.brands || []);
      setCategories(response?.categories || []);
    } catch (err) {
      console.error("Search error:", err);
      setProducts([]);
      setFilteredProducts([]);
      setBrands([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    if (q.trim()) {
      fetchSearchResults();
    } else {
      // If no query, set loading to false and clear results
      setLoading(false);
      setProducts([]);
      setFilteredProducts([]);
    }
  }, [q, fetchSearchResults]);

  const handleFilterChange = useCallback((filtered: any[]) => {
    setFilteredProducts(filtered);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Search results for &quot;{q}&quot;
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <GlobalLoader size="large" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Filter Panel - Right Side */}
          <FilterPanel
            products={products}
            brands={allBrands.length > 0 ? allBrands : brands}
            categories={allCategories.length > 0 ? allCategories : categories}
            onFilterChange={handleFilterChange}
          />

          {/* Main Content */}
          <div className="flex-1">
            {filteredProducts.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold">Products</h2>
                  <span className="text-sm text-gray-600">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
                  </span>
                </div>
                <div className="flex flex-col divide-y divide-gray-200 md:divide-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 mb-8">
                  {filteredProducts.map((p) => (
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
                          loading="lazy"
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

            {filteredProducts.length === 0 &&
              brands.length === 0 &&
              categories.length === 0 && <p>No results found.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Searching...</h1>
        <div className="text-center">Loading search results...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
