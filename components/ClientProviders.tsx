// components/ClientProviders.tsx
"use client";
import React from "react";
import { CartProvider } from "./CartContext";
import { AuthProvider } from "@/contexts/AuthProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
