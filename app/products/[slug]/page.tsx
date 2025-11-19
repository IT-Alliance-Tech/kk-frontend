"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

    if (!slug) {
      setLoading(false);
      setProduct(null);
      setError("No product specified.");
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiGet(`/products/${encodeURIComponent(slug)}`);

        const p =
          data?.product ??
          data?.item ??
          data?.data ??
          data?.result ??
          data ??
          null;

        if (!p || typeof p !== "object" || Object.keys(p).length === 0) {
          throw new Error("Product not found");
        }

        if (!cancelled) setProduct(p);
      } catch (err: any) {
        console.error("Error loading product:", err);
        if (!cancelled)
          setError(err?.message ?? "Failed to load product.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [params?.slug]);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  if (error)
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/products")}
          className="bg-emerald-600 text-white px-4 py-2 rounded"
        >
          Back to products
        </button>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-20">
        <p className="text-slate-700">Product not found</p>
        <div className="mt-4">
          <button
            onClick={() => router.push("/products")}
            className="bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Back to products
          </button>
        </div>
      </div>
    );

  const imageUrl = product.images?.[0]
    ? product.images[0].includes("via.placeholder.com")
      ? product.images[0].replace("via.placeholder.com", "placehold.co")
      : product.images[0]
    : `https://placehold.co/400x400?text=${encodeURIComponent(
        product.title || "Product"
      )}`;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded shadow">
      <div className="flex flex-col items-center">
        <img
          src={imageUrl}
          alt={product.title || "Product image"}
          className="w-80 h-80 object-contain border rounded p-4"
        />

        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => router.push("/cart")}
            className="bg-emerald-600 text-white px-6 py-2 rounded font-medium hover:bg-emerald-700"
          >
            Go to Cart
          </button>
          <button
            onClick={() => router.push("/products")}
            className="border px-4 py-2 rounded"
          >
            Back
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {product.title ?? "Untitled product"}
        </h1>

        {product.brand?.name && (
          <p className="text-gray-600 mt-2">Brand: {product.brand.name}</p>
        )}

        {product.category?.name && (
          <p className="text-gray-600">Category: {product.category.name}</p>
        )}

        <p className="text-3xl font-bold text-green-600 mt-4">
          ₹{product.price ?? "—"}
        </p>

        <div className="mt-4">
          <h2 className="font-semibold text-lg">Description</h2>
          <p className="text-gray-700 mt-2">
            {product.description ?? "No description available."}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-lg">Specifications</h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Brand: {product.brand?.name ?? "—"}</li>
            <li>Category: {product.category?.name ?? "—"}</li>
            <li>Price: ₹{product.price ?? "—"}</li>
            <li>
              Stock:{" "}
              {typeof product.stock === "number"
                ? product.stock > 0
                  ? "Available"
                  : "Out of Stock"
                : "—"}
            </li>
            {product.mrp !== undefined && <li>MRP: ₹{product.mrp}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
