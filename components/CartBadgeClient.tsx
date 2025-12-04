// kk-frontend/components/CartBadgeClient.tsx
"use client";
import React from "react";
import { useCart } from "@/components/CartContext";

export default function CartBadgeClient() {
  const { distinctCount } = useCart();
  const count = distinctCount ?? 0;
  if (!count) return null;

  return (
    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 pointer-events-none" aria-hidden="true">
      <span className="inline-flex items-center justify-center bg-emerald-600 text-white text-xs font-semibold rounded-full w-5 h-5 sm:w-6 sm:h-6">
        {count > 99 ? "99+" : count}
      </span>
    </span>
  );
}
