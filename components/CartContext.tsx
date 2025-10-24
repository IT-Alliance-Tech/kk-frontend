"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty?: number;
  image_url?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem, qty?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateQty: (id: string, qty: number) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kk_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kk_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem, qty: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty = (copy[idx].qty || 1) + qty;
        return copy;
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setItems([]);

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };

  const count = items.reduce((s, it) => s + (it.qty || 0), 0);
  const total = items.reduce((s, it) => s + (it.qty || 0) * it.price, 0);

  const value: CartContextValue = {
    items,
    count,
    total,
    addItem,
    removeItem,
    clearCart,
    updateQty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
