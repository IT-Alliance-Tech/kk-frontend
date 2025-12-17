"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";
import { useState } from "react";
import Image from "next/image";
import { normalizeSrc } from "@/lib/normalizeSrc";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

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

  return (
    <Card className="group flex flex-col overflow-hidden border border-slate-200 rounded-lg bg-white">
      {/* Image Area - Fixed aspect ratio */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
          <Image
            src={imgSrc}
            alt={productTitle}
            fill
            className="object-cover"
            loading="lazy"
            unoptimized={typeof imgSrc === "string" && imgSrc.startsWith("http")}
          />
        </div>
      </Link>

      {/* Content Area - Denser spacing, left-aligned */}
      <div className="flex flex-col p-2.5 gap-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-normal text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
            {productTitle}
          </h3>
        </Link>

        {product.brand?.name && (
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {product.brand.name}
          </p>
        )}

        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-lg font-bold text-slate-900">
            ₹{product.price || 0}
          </span>
          {product.mrp && product.mrp > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.mrp}
            </span>
          )}
        </div>
      </div>

      {/* Action Area - Fixed height slot */}
      <div className="px-2.5 pb-2.5">
        <div className="h-12 flex items-center justify-center">
          {currentQty === 0 ? (
            <button
              onClick={onAdd}
              disabled={adding || product.stock === 0}
              className="w-full h-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-normal rounded-full shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} className="shrink-0" />
              <span>{adding ? "Adding..." : "Add to Cart"}</span>
            </button>
          ) : (
            <div className="w-full h-full flex items-center gap-2">
              <Link
                href="/cart"
                className="flex-1 h-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-normal rounded-full flex items-center justify-center transition-colors"
              >
                Go to Cart
              </Link>
              <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-10">
                <button
                  onClick={decreaseQty}
                  className="w-10 h-full flex items-center justify-center text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <div className="w-10 flex items-center justify-center font-semibold text-gray-800 text-base">
                  {currentQty}
                </div>
                <button
                  onClick={increaseQty}
                  className="w-10 h-full flex items-center justify-center text-red-500 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 5v14m7-7H5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
