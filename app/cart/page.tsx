// app/cart/page.tsx
"use client";

import dynamic from "next/dynamic";

const CartClient = dynamic(() => import("@/components/CartClient"), {
  ssr: false,
});

export default function CartPage() {
  return <CartClient />;
}
