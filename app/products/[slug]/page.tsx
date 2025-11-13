"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) return;

    const fetchProduct = async () => {
      try {
        const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
        const data = await apiGet(`/products/${slug}`);
        setProduct(data);
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (params?.slug) {
      fetchProduct();
    }
    fetchProduct();
  }, [params.slug]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  // Determine safe image URL
  const imageUrl = product.images?.[0]
    ? product.images[0].includes("via.placeholder.com")
      ? product.images[0].replace("via.placeholder.com", "placehold.co")
      : product.images[0]
    : `https://placehold.co/400x400?text=${encodeURIComponent(product.title)}`;

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded shadow">
      <div className="flex flex-col items-center">
        {/* Product Image */}
        <img
          src={imageUrl}
          alt={product.title}
          className="w-80 h-80 object-contain border rounded p-4"
        />
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => router.push("/cart")}
            className="bg-emerald-600 text-white px-6 py-2 rounded font-medium hover:bg-emerald-700"
          >
            Go to Cart
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <p className="text-gray-600 mt-2">Brand: {product.brand?.name}</p>
        <p className="text-gray-600">Category: {product.category?.name}</p>

        <p className="text-3xl font-bold text-green-600 mt-4">₹{product.price}</p>

        <div className="mt-4">
          <h2 className="font-semibold text-lg">Description</h2>
          <p className="text-gray-700 mt-2">{product.description}</p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-lg">Specifications</h2>
          <ul className="list-disc ml-6 text-gray-700">
            <li>Brand: {product.brand?.name}</li>
            <li>Category: {product.category?.name}</li>
            <li>Price: ₹{product.price}</li>
            <li>Stock: {product.stock > 0 ? "Available" : "Out of Stock"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
