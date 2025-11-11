// components/ProductList.tsx
"use client";
import React from "react";

export default function ProductList({ products }: { products: any[] }) {
  if (!products?.length) return <p>No products yet.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {products.map(p => (
        <div key={p.id ?? p._id} className="border rounded p-4 shadow-sm">
          <img src={p.images?.[0] ?? "/placeholder.png"} alt={p.title ?? p.name} className="w-full h-40 object-cover mb-2 rounded" />
          <h3 className="text-lg font-semibold">{p.title ?? p.name}</h3>
          <p className="text-sm text-gray-600">{p.category}</p>
          <p className="mt-2 font-bold">₹{p.price ?? "—"}</p>
        </div>
      ))}
    </div>
  );
}
