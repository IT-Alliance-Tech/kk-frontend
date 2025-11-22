"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken } from "@/lib/utils/auth";
import {
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  getCart as apiGetCart,
  BackendCart,
} from "@/lib/api/cart.api";

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
  addItem: (item: CartItem, qty?: number) => Promise<void> | void;
  removeItem: (id: string) => Promise<void> | void;
  clearCart: () => Promise<void> | void;
  updateQty: (id: string, qty: number) => Promise<void> | void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

function backendToLocal(cart: BackendCart) {
  // map backend items to local CartItem shape
  return (cart.items || []).map((bi) => ({
    id: bi.productId,
    name: bi.title,
    price: bi.price,
    qty: bi.qty,
    image_url: bi.image,
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // On mount: load localStorage first, then if logged in, fetch backend cart to override
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kk_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // do not crash on parse errors
    }

    // If there's a token, fetch backend cart and replace local state with server snapshot
    (async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const remote: BackendCart = await apiGetCart();
          const mapped = backendToLocal(remote);
          setItems(mapped);
          localStorage.setItem("kk_cart", JSON.stringify(mapped));
        }
      } catch (e) {
        // silent: if backend fetch fails, keep localStorage state
      }
    })();
  }, []);

  // Whenever local items change, persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("kk_cart", JSON.stringify(items));
    } catch (e) {
      // ignore storage errors silently
    }
  }, [items]);

  // Helper to merge server snapshot into local items
  const applyServerCart = (serverCart?: BackendCart | null) => {
    if (!serverCart) return;
    const mapped = backendToLocal(serverCart);
    setItems(mapped);
    try {
      localStorage.setItem("kk_cart", JSON.stringify(mapped));
    } catch (e) {}
  };

  const addItem = (item: CartItem, qty: number = 1) => {
    // local update for instant UX
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].qty = (copy[idx].qty || 1) + qty;
        return copy;
      }
      return [...prev, { ...item, qty }];
    });

    // If logged in, persist to backend in background
    (async () => {
      try {
        const token = getAccessToken();
        if (!token) return;
        const serverCart = await apiAddToCart(item.id, qty);
        applyServerCart(serverCart);
      } catch (e) {
        // silent failure — do not break UX
      }
    })();
  };

  const removeItem = (id: string) => {
    // local update
    setItems((prev) => prev.filter((p) => p.id !== id));

    (async () => {
      try {
        const token = getAccessToken();
        if (!token) return;
        const serverCart = await apiRemoveCartItem(id);
        applyServerCart(serverCart);
      } catch (e) {}
    })();
  };

  const clearCart = () => {
    setItems([]);

    (async () => {
      try {
        const token = getAccessToken();
        if (!token) return;
        const serverCart = await apiClearCart();
        applyServerCart(serverCart);
      } catch (e) {}
    })();
  };

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));

    (async () => {
      try {
        const token = getAccessToken();
        if (!token) return;
        const serverCart = await apiUpdateCartItem(id, qty);
        applyServerCart(serverCart);
      } catch (e) {}
    })();
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
