"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductList from "@/components/Products";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?category=${slug}`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setProducts(data.items || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (products.length === 0) return <p>No products found for &quot;{slug}&quot;.</p>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Products in &quot;{slug}&quot; category
      </h1>
      <ProductList products={products} />
    </div>
  );
}
