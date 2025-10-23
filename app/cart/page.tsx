"use client";
import React from "react";
import { useCart } from "@/components/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { items, count, removeItem, updateQty, clearCart } = useCart();

  if (!items || items.length === 0)
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <p className="mt-4">
          Your cart is empty. <Link href="/">Go shopping</Link>
        </p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Your Cart ({count})</h1>
      <div className="space-y-4 mt-4">
        {items.map((it) => (
          <div key={it.id} className="flex gap-4 items-center border p-4 rounded">
            <img
              src={it.image_url || "/placeholder.png"}
              alt={it.name}
              className="w-20 h-20 object-contain"
            />
            <div className="flex-1">
              <div className="font-semibold">{it.name}</div>
              <div className="text-gray-600">₹{it.price} x {it.qty}</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateQty(it.id, Math.max(1, (it.qty || 1) - 1))}
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <div className="px-3 py-1 border rounded">{it.qty}</div>
                <button
                  onClick={() => updateQty(it.id, (it.qty || 1) + 1)}
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <button onClick={() => removeItem(it.id)} className="text-red-600">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <button onClick={() => clearCart()} className="px-4 py-2 border rounded">
          Clear Cart
        </button>
        <button className="px-6 py-2 bg-green-600 text-white rounded">Checkout</button>
      </div>
    </div>
  );
}
