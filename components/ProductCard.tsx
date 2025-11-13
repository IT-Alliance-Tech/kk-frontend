"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext"; // ✅ fixed import
import { useToast } from "@/components/ToastContext";
import { useState } from "react";
import Image from "next/image";

export default function ProductCard({ product }: any) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);

  const onAdd = async (e: any) => {
    e.stopPropagation();
    setAdding(true);
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.images?.[0] ?? null,
      });
      showToast("Added to cart!", "success");
    } catch (err) {
      showToast("Failed to add", "error");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.slug}`}>
        <div className="h-36 sm:h-40 md:h-48 w-full overflow-hidden bg-gray-100">
          {product.images ? (
            <Image
              src={product?.images}
              alt={product.name}
              width={100}
              height={100}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-xs sm:text-sm text-gray-400">
              No Image
            </div>
          )}
        </div>
      </Link>
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="font-medium line-clamp-2 text-xs sm:text-sm md:text-base">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="text-sm sm:text-base md:text-lg font-bold text-emerald-600">₹{product.price}</div>
          <button
            onClick={onAdd}
            disabled={adding}
            className="bg-emerald-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
