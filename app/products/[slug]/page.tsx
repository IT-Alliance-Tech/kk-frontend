"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { useCart } from "@/components/CartContext";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, removeItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qty, setQty] = useState(0);

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
        if (!cancelled) setError(err?.message ?? "Failed to load product.");
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
        <button
          onClick={() => router.push("/products")}
          className="bg-emerald-600 text-white px-4 py-2 rounded mt-4"
        >
          Back
        </button>
      </div>
    );

  const imageUrl = product.images?.[0]
    ? product.images[0].includes("via.placeholder.com")
      ? product.images[0].replace("via.placeholder.com", "placehold.co")
      : product.images[0]
    : `https://placehold.co/400x400?text=${encodeURIComponent(
        product.title || "Product"
      )}`;

  const increaseQty = () => {
    const newQty = qty + 1;
    setQty(newQty);
    addItem(
      {
        id: product._id,
        name: product.title,
        price: product.price,
        image_url: imageUrl,
      },
      1
    );
  };

  const decreaseQty = () => {
    if (qty === 0) return;
    const newQty = qty - 1;
    setQty(newQty);
    removeItem(product._id);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* LEFT IMAGE SECTION */}
        <div className="flex flex-col items-center">
          <div className="border rounded-xl p-4 shadow-sm bg-gray-50">
            <Image
              src={imageUrl}
              alt={product.title || "Product image"}
              width={400}
              height={400}
              className="w-80 h-80 object-contain"
            />
          </div>

          <div className="mt-6 flex gap-3">
            {/* ADD TO CART BUTTON */}
            <button
              onClick={increaseQty}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg shadow hover:bg-emerald-700"
            >
              Add to Cart
            </button>

            <button
              onClick={() => router.push("/products")}
              className="border px-6 py-2 rounded-lg shadow-sm"
            >
              Back
            </button>
          </div>

          {/* NEW QTY BUTTONS — RED — CLOSE SPACING */}
          {qty > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={decreaseQty}
                className="bg-red-500 text-white w-10 h-10 rounded-full text-xl shadow"
              >
                -
              </button>

              <span className="text-xl font-bold">{qty}</span>

              <button
                onClick={increaseQty}
                className="bg-red-500 text-white w-10 h-10 rounded-full text-xl shadow"
              >
                +
              </button>
            </div>
          )}
        </div>

        {/* RIGHT DETAILS SECTION */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {product.title}
          </h1>

          <div className="mt-3 text-slate-600 space-y-1">
            {product.brand?.name && (
              <p>Brand: <span className="font-medium">{product.brand.name}</span></p>
            )}
            {product.category?.name && (
              <p>Category: <span className="font-medium">{product.category.name}</span></p>
            )}
          </div>

          <div className="mt-6 flex items-end gap-3">
            <p className="text-4xl font-bold text-emerald-600">₹{product.price}</p>

            {product.mrp && product.mrp > product.price && (
              <span className="line-through text-slate-400 text-xl">
                ₹{product.mrp}
              </span>
            )}
          </div>

          {/* ❌ DELETED OLD QTY SECTION FROM HERE */}

          <div className="mt-10">
            <h2 className="text-xl font-semibold border-b pb-2">Description</h2>
            <p className="text-slate-700 mt-3 leading-relaxed">
              {product.description ?? "No description available."}
            </p>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold border-b pb-2">Specifications</h2>
            <ul className="list-disc ml-6 mt-3 space-y-1 text-slate-700">
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
    </div>
  );
}
