// components/ProductList.tsx
"use client";
import React, { useState } from "react";
import ProductCard from "./ProductCard";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image_url?: string;
  rating?: number;
  brand_name?: string;
  category_name?: string;
  is_active?: boolean;
};

type ProductListProps = {
  products: Product[];
  initialShown?: number; // how many items to show initially (for "Load more")
  onLoadMore?: () => Promise<Product[]> | Product[] | void; // optional handler to fetch more
};

export default function ProductList({
  products,
  initialShown = 12,
  onLoadMore,
}: ProductListProps) {
  const [visibleCount, setVisibleCount] = useState<number>(
    Math.min(initialShown, products.length),
  );
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [loadingMore, setLoadingMore] = useState(false);

  // If parent provides new product array, update local copy
  React.useEffect(() => {
    setLocalProducts(products);
    setVisibleCount(Math.min(initialShown, products.length));
  }, [products, initialShown]);

  const handleLoadMore = async () => {
    if (onLoadMore) {
      try {
        setLoadingMore(true);
        const more = await onLoadMore();
        if (Array.isArray(more) && more.length > 0) {
          setLocalProducts((p) => [...p, ...more]);
          setVisibleCount((v) => v + more.length);
        } else {
          // fallback: increase visible count from existing list
          setVisibleCount((v) =>
            Math.min(localProducts.length, v + initialShown),
          );
        }
      } finally {
        setLoadingMore(false);
      }
    } else {
      // No handler: just reveal more from existing array
      setVisibleCount((v) => Math.min(localProducts.length, v + initialShown));
    }
  };

  if (!localProducts || localProducts.length === 0) {
    return (
      <p className="p-4 sm:p-6 text-center text-gray-500 text-sm sm:text-base">
        No products found.
      </p>
    );
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {localProducts.slice(0, visibleCount).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load more */}
      {visibleCount < localProducts.length && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 text-sm sm:text-base transition"
          >
            {loadingMore ? "Loading..." : "Show more products"}
          </button>
        </div>
      )}
    </div>
  );
}
