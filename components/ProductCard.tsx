"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";
import { useState } from "react";
import Image from "next/image";
import { normalizeSrc } from "@/lib/normalizeSrc";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProductCard({ product }: any) {
  const { addItem, updateQty, removeItem, items } = useCart();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  // Support both _id and id for MongoDB compatibility
  const productId = product._id || product.id;
  const cartItem = items.find((item) => item.id === productId);
  const currentQty = cartItem?.qty || 0;

  // Support both title (MongoDB) and name (legacy) fields
  const productTitle = product.title || product.name || "Untitled Product";

  // Handle images - support arrays or single string
  let imgSrc = "/placeholder.png";
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    imgSrc = normalizeSrc(product.images[0]);
  } else if (product.images && typeof product.images === "string") {
    imgSrc = normalizeSrc(product.images);
  } else if (product.image_url) {
    imgSrc = normalizeSrc(product.image_url);
  }

  const handleQuantityChange = (newQty: number) => {
    try {
      if (newQty === 0) {
        removeItem(productId);
        showToast("Removed from cart", "success");
      } else if (currentQty === 0) {
        addItem(
          {
            id: productId,
            name: productTitle,
            price: product.price || 0,
            image_url: imgSrc,
          },
          newQty
        );
        showToast("Added to cart!", "success");
      } else {
        updateQty(productId, newQty);
      }
    } catch {
      showToast("Failed to update cart", "error");
    }
  };

  const onAdd = async (e: any) => {
    e.stopPropagation();
    setAdding(true);

    try {
      addItem({
        id: productId,
        name: productTitle,
        price: product.price || 0,
        image_url: imgSrc,
      });
      showToast("Added to cart!", "success");
    } catch {
      showToast("Failed to add", "error");
    } finally {
      setAdding(false);
    }
  };

  const increaseQty = () => {
    handleQuantityChange(currentQty + 1);
  };

  const decreaseQty = () => {
    handleQuantityChange(currentQty - 1);
  };

  // unified product card layout — match /products page
  return (
    <Card className="group hover:shadow-lg transition flex flex-col h-full">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={productTitle}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            unoptimized={imgSrc.startsWith("http")}
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23cbd5e1'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />

          {/* removed Sale badge (per new design) */}
        </div>
      </Link>

      <div className="flex-1 flex flex-col">
        <CardHeader>
          <Link href={`/products/${product.slug}`}>
            <CardTitle className="text-base line-clamp-2 group-hover:text-emerald-600">
              {productTitle}
            </CardTitle>
          </Link>

          {product.brand?.name && (
            <p className="text-sm text-slate-500">{product.brand.name}</p>
          )}
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">₹{product.price || 0}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-sm text-slate-500 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      <CardFooter className="mt-auto">
        {currentQty === 0 ? (
          <button
            onClick={onAdd}
            disabled={adding || product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-900 transition disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            aria-label={`Add ${productTitle} to cart`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {adding ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        ) : (
          <div className="flex items-center justify-between gap-2 w-full">
            <Link
              href="/cart"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition text-center text-sm font-medium"
              aria-label={`Go to cart for ${productTitle}`}
            >
              Go to Cart
            </Link>
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full px-3 py-1.5 shadow-sm">
              <button
                onClick={decreaseQty}
                className="text-red-500 text-lg px-1"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="text-gray-900 text-base font-medium min-w-[1.5rem] text-center">{currentQty}</span>
              <button
                onClick={increaseQty}
                className="text-red-500 text-lg px-1"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
