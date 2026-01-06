"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductList from "@/components/Products";
import { buildUrl } from "@/lib/api";

// Helper: normalize API response to an array (handles nested data.items)
function unwrapArray<T = any>(json: any): T[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as T[];
  // common wrappers:
  if (Array.isArray(json.data)) return json.data as T[];
  if (Array.isArray(json.items)) return json.items as T[];
  if (Array.isArray(json.data?.items)) return json.data.items as T[];
  // sometimes API returns { data: { items: [...] } }
  if (Array.isArray(json.data?.results)) return json.data.results as T[];
  // try to find first array property on object
  for (const k of Object.keys(json)) {
    if (Array.isArray(json[k])) return json[k] as T[];
  }
  return [];
}

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
        const catRes = await fetch(buildUrl("/api/categories"));
        if (!catRes.ok) throw new Error(`Failed to load categories`);
        const catJson = await catRes.json();
        
        const categoryList = unwrapArray(catJson);

        const category = categoryList.find(
          (c: any) => (c.slug ?? c.name)?.toLowerCase?.() === normalizedSlug?.toLowerCase?.()
        );

        if (!category) {
          throw new Error("Category not found");
        }

        setCategoryName(category.name);

        // Fetch products for this category
        const prodRes = await fetch(
          buildUrl(`/api/products?category=${encodeURIComponent(category._id ?? category.id ?? category._id)}`),
          { cache: "no-store" }
        );
        if (!prodRes.ok) throw new Error("Failed to load products");
        const prodJson = await prodRes.json();
        
        // Backend returns multiple shapes; normalize into `items` array
        const items = unwrapArray(prodJson);                 // handles plain array
        const itemsFromDataItems = Array.isArray(prodJson?.data?.items) ? prodJson.data.items : null;
        const finalItems = items.length ? items : (itemsFromDataItems ?? unwrapArray(prodJson?.data));

        setProducts(finalItems);
      } catch (err: any) {
        console.error("Category page load error", err);
        setError(err instanceof Error ? err.message : String(err));
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
