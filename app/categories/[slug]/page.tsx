"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductList from "@/components/Products";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchProductsForCategory() {
      try {
        setLoading(true);
        setError(null);

        // 1) Fetch categories so we can map slug -> _id
        const catRes = await fetch("/api/categories");
        if (!catRes.ok) throw new Error(`Failed to load categories (${catRes.status})`);
        const categories = await catRes.json();

        // Find category by slug (support both string and possible array)
        const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;
        const category = Array.isArray(categories)
          ? categories.find((c: any) => c.slug === normalizedSlug || c._id === normalizedSlug)
          : null;

        if (!category) {
          // If we can't find a matching category, show helpful message
          throw new Error(`Category "${normalizedSlug}" not found`);
        }

        // Save pretty name for UI
        if (!cancelled) setCategoryName(category.name ?? normalizedSlug);

        // 2) Use the category _id to fetch products (backend expects id)
        const productsRes = await fetch(`/api/products?category=${encodeURIComponent(category._id)}`);
        if (!productsRes.ok) {
          // Try to provide a useful message (server may return 404/500)
          throw new Error(`Failed to load products (${productsRes.status})`);
        }
        const data = await productsRes.json();

        if (!cancelled) {
          setProducts(Array.isArray(data.items) ? data.items : data.items ?? data?.items ?? []);
        }
      } catch (err: any) {
        console.error("Category page error:", err);
        if (!cancelled) setError(err.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProductsForCategory();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Loading products...</h1>
        <p>Fetching products for category…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">
          Products in "{categoryName ?? slug}" category
        </h1>
        <p>No products found for "{categoryName ?? slug}".</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Products in "{categoryName ?? slug}" category
      </h1>
      <ProductList products={products} />
    </div>
  );
}
