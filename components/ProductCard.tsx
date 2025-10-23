// components/ProductCard.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/SupabaseCartContext";
import { useToast } from "@/components/ToastContext";
import { useState } from "react";
import Image from "next/image";

export default function ProductCard({ product }: any) {
  const { addItem } = useCart();
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  const onAdd = async (e: any) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem({ id: product.id, name: product.name, price: product.price, image_url: product.images?.[0] ?? null }, 1);
    } catch (err) {
      toast.push({ message: "Failed to add", type: "error" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden flex flex-col">
      {/* added comment */}
      <Link href={`/products/${product.slug}`}>
        <div className="h-48 w-full overflow-hidden bg-gray-100">
          {product.images ? <Image src={product?.images} alt={product.name} width={100} height={100}  className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center">No Image</div>}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-lg font-bold">₹{product.price}</div>
          <button onClick={onAdd} disabled={adding} className="bg-emerald-600 text-white px-3 py-1 rounded">
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
