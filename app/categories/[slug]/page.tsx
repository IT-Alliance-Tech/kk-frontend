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

    async function loadCategoryProducts() {
      try {
        setLoading(true);
        setError(null);

        const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

        // Fetch category list to get _id
        const catRes = await fetch("/api/categories");
        if (!catRes.ok) throw new Error(`Failed to load categories`);
        const categoryList = await catRes.json();

        const category = categoryList.find(
          (c: any) => c.slug === normalizedSlug
        );

        if (!category) throw new Error(`Category "${normalizedSlug}" not found`);

        setCategoryName(category.name);

        // Fetch products using category._id
        const prodRes = await fetch(
          `/api/products?category=${encodeURIComponent(category._id)}`
        );
        if (!prodRes.ok) throw new Error(`Failed to load products`);

        const data = await prodRes.json();

        // Backend returns:  { items: [...] }
        const items = Array.isArray(data.items) ? data.items : [];

        setProducts(items);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadCategoryProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Loading products...</h1>
        <p>Fetching products for this category…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Products in &quot;{categoryName ?? slug}&quot; category
      </h1>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
