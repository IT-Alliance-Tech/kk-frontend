"use client";
import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from "react";
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
  productId?: string; // alias for id
  name: string;
  price: number;
  qty: number; // always a number, never undefined
  image_url?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  distinctCount: number;
  total: number;
  addItem: (item: Partial<CartItem>, qty?: number) => Promise<void> | void;
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

// Normalize any raw cart item to consistent shape
function normalizeCartItem(raw: any): CartItem {
  const id = raw.id || raw.productId || raw._id || '';
  return {
    id,
    productId: id, // alias
    name: raw.name || raw.title || 'Product',
    price: Number(raw.price) || 0,
    qty: Number(raw.qty) || Number(raw.quantity) || 1,
    image_url: raw.image_url || raw.image || '',
  };
}

function backendToLocal(cart: BackendCart): CartItem[] {
  return (cart.items || []).map((bi) => normalizeCartItem({
    id: bi.productId,
    name: bi.title,
    price: bi.price,
    qty: bi.qty,
    image_url: bi.image,
  }));
}

// Read initial cart synchronously from localStorage
function readInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem("kk_cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : [];
  } catch (e) {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize synchronously so product cards see cart items immediately
  const [items, setItems] = useState<CartItem[]>(readInitialCart);
  const itemsRef = useRef<CartItem[]>(items);

  // Keep ref in sync for storage listener
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Keep ref in sync for storage listener
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // On mount: if logged in, fetch backend cart to merge/override
  useEffect(() => {
    (async () => {
      try {
        const token = getAccessToken();
        if (token) {
          const remote: BackendCart = await apiGetCart();
          const mapped = backendToLocal(remote);
          setItems(mapped);
        }
      } catch (e) {
        // silent: if backend fetch fails, keep localStorage state
      }
    })();
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem("kk_cart", JSON.stringify(items));
    } catch (e) {
      // ignore storage errors
    }
  }, [items]);

  // Listen for cross-tab storage changes - use ref to avoid recreating handler
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== 'kk_cart' || !e.newValue) return;
      
      try {
        // Use functional update with ref to avoid stale closure
        setItems(prev => {
          const prevJson = JSON.stringify(prev);
          if (prevJson === e.newValue) return prev; // prevent loop
          const parsed = JSON.parse(e.newValue!);
          return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : prev;
        });
      } catch (err) {
        // ignore parse errors
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []); // Empty deps - handler uses functional update

  // Helper to merge server snapshot into local items
  const applyServerCart = (serverCart?: BackendCart | null) => {
    if (!serverCart) return;
    const mapped = backendToLocal(serverCart);
    setItems(mapped);
  };

  const addItem = (item: Partial<CartItem>, qty: number = 1) => {
    const normalized = normalizeCartItem({ ...item, qty });
    
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === normalized.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
        return copy;
      }
      return [...prev, normalized];
    });

    // If logged in, persist to backend in background
    (async () => {
      try {
        const token = getAccessToken();
        if (!token) return;
        const serverCart = await apiAddToCart(normalized.id, qty);
        applyServerCart(serverCart);
      } catch (e) {
        // silent failure
      }
    })();
  };

  const removeItem = (id: string) => {
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

  // Memoized count to avoid recalculation
  const count = useMemo(() => items.reduce((s, it) => s + (Number(it.qty) || 0), 0), [items]);
  const distinctCount = useMemo(() => items.length, [items]);
  const total = useMemo(() => items.reduce((s, it) => s + (Number(it.qty) || 0) * it.price, 0), [items]);

  const value: CartContextValue = {
    items,
    count,
    distinctCount,
    total,
    addItem,
    removeItem,
    clearCart,
    updateQty,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
