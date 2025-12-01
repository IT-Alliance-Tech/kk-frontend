// components/ProductList.tsx
"use client";
import React from "react";
import Image from "next/image";

export default function ProductList({ products }: { products: any[] }) {
  if (!products?.length) return <p>No products yet.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {products.map((p) => (
  <div key={p._id || p.id} className="border rounded p-4 shadow-sm">
          <Image
            src={p.images?.[0] ?? "/placeholder.png"}
            alt={p.title ?? p.name}
            width={600}
            height={400}
            className="w-full h-40 object-cover mb-2 rounded"
          />
          <h3 className="text-lg font-semibold">{p.title ?? p.name}</h3>
          <p className="text-sm text-gray-600">{p.category}</p>
          <p className="mt-2 font-bold">₹{p.price ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}
