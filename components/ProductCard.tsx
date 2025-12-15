"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";
import { useState } from "react";
import Image from "next/image";
import { normalizeSrc } from "@/lib/normalizeSrc";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png";
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

  const productIdKey = product._id || product.id || product.productId || "";
  const cartItem = items.find(
    (item) => item.id === productIdKey || item.productId === productIdKey
  );
  const currentQty = Math.max(0, Number(cartItem?.qty) || 0);

  const productTitle = product.title || product.name || "Untitled Product";

  const imgSrc = (() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return normalizeSrc(product.images[0]);
    }
    if (typeof product.images === "string") {
      return normalizeSrc(product.images);
    }
    if (product.image_url) {
      return normalizeSrc(product.image_url);
    }
    return DefaultProductImage;
  })();

  const handleQuantityChange = (newQty: number) => {
    const safeQty = Math.max(0, Number(newQty) || 0);

    try {
      if (safeQty === 0) {
        removeItem(productIdKey);
        showToast("Removed from cart", "success");
      } else if (currentQty === 0) {
        addItem(
          {
            id: productIdKey,
            name: productTitle,
            price: product.price || 0,
            image_url: typeof imgSrc === "string" ? imgSrc : imgSrc.src,
          },
          safeQty
        );
        showToast("Added to cart!", "success");
      } else {
        updateQty(productIdKey, safeQty);
      }
    } catch {
      showToast("Failed to update cart", "error");
    }
  };

  const onAdd = (e: any) => {
    e.stopPropagation();
    setAdding(true);

    try {
      addItem({
        id: productIdKey,
        name: productTitle,
        price: product.price || 0,
        image_url: typeof imgSrc === "string" ? imgSrc : imgSrc.src,
      });
      showToast("Added to cart!", "success");
    } catch {
      showToast("Failed to add", "error");
    } finally {
      setAdding(false);
    }
  };

  const increaseQty = () => handleQuantityChange(currentQty + 1);
  const decreaseQty = () => handleQuantityChange(currentQty - 1);

  // h-full intentionally removed to avoid mobile grid stretch
  return (
    <Card className="group hover:shadow-lg transition flex flex-col">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={productTitle}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
            unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("http")}
          />
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

      {/* Fixed-height Swiggy-style action slot */}
      <CardFooter className="mt-auto h-[4.5rem] flex items-center">
        {currentQty === 0 ? (
          <button
            onClick={onAdd}
            disabled={adding || product.stock === 0}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2.5 px-4 rounded-md hover:bg-gray-900 transition text-sm disabled:bg-gray-300"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        ) : (
          // 🔽 UPDATED: vertical layout (Go to Cart above quantity)
          <div className="flex flex-col gap-2 w-full items-center">
            <Link
              href="/cart"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-center text-sm font-medium"
            >
              Go to Cart
            </Link>

            <div className="flex items-center gap-3 border rounded-full px-4 py-1.5">
              <button
                onClick={decreaseQty}
                className="text-red-500 text-base font-semibold"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-[1.25rem] text-center text-sm font-medium">
                {currentQty}
              </span>
              <button
                onClick={increaseQty}
                className="text-red-500 text-base font-semibold"
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
