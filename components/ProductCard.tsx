"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useToast } from "@/components/ToastContext";
import { useState } from "react";
import Image from "next/image";
import QuantitySelector from "@/components/QuantitySelector";
import { normalizeSrc } from "@/lib/normalizeSrc";

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
  const productDescription = product.description || product.desc || "";

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

  return (
    <div className="bg-white border rounded-lg overflow-hidden flex flex-col h-full min-h-[320px] md:min-h-[360px] hover:shadow-lg transition-shadow">

      <Link href={`/products/${product.slug}`}>
        <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <Image
            src={imgSrc}
            alt={productTitle}
            width={300}
            height={300}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            unoptimized={imgSrc.startsWith("http")}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.png";
            }}
          />
        </div>
      </Link>

      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="font-medium line-clamp-2 text-xs sm:text-sm md:text-base">
            {productTitle}
          </h3>
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between gap-2">
          <div className="text-sm sm:text-base md:text-lg font-bold text-emerald-600">
            ₹{product.price || 0}
          </div>

          {currentQty > 0 ? (
            <QuantitySelector
              value={currentQty}
              onChange={handleQuantityChange}
              size="sm"
            />
          ) : (
            <button
              onClick={onAdd}
              disabled={adding}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs sm:text-sm hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
