"use client";
import { useCart } from "@/components/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
      {/* TODO: replace with next/image if src is static */}
      <img
        src={product.image_url || "/placeholder.png"}
        alt={product.name}
        className="w-full h-40 object-contain mb-3"
      />
      <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
      <p className="text-gray-600 mb-2">₹{product.price}</p>
      <button
        onClick={() => addItem(product, 1)} // ✅ this calls your context
        className="w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 transition"
      >
        Add
      </button>
    </div>
  );
}
