"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, CartItem, Product } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface CartContextType {
  cartItems: CartItem[];
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  loading: true,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
  cartTotal: 0,
  cartCount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // Guarded Supabase client usage to prevent TypeScript errors
    if (!supabase) {
      // Supabase not configured at build-time — return fallback value.
      // This prevents build-time crashes while preserving runtime behavior when envs are set.
      setCartItems([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          product:products(
            *,
            brand:brands(*),
            category:categories(*)
          )
        `,
        )
        .eq("user_id", user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    try {
      const existingItem = cartItems.find(
        (item) => item.product_id === productId,
      );

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        // Guarded Supabase client usage to prevent TypeScript errors
        if (!supabase) {
          console.warn("Supabase client not initialized — skipping add to cart.");
          return;
        }
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        });

        if (error) throw error;
        await refreshCart();
        toast.success("Added to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      // Guarded Supabase client usage to prevent TypeScript errors
      if (!supabase) {
        console.warn("Supabase client not initialized — skipping update quantity.");
        return;
      }
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", cartItemId);

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      // Guarded Supabase client usage to prevent TypeScript errors
      if (!supabase) {
        console.warn("Supabase client not initialized — skipping remove from cart.");
        return;
      }
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;
      await refreshCart();
      toast.success("Removed from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove from cart");
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      // Guarded Supabase client usage to prevent TypeScript errors
      if (!supabase) {
        console.warn("Supabase client not initialized — skipping clear cart.");
        return;
      }
      const { error } = await supabase
        .from("cart_items")
        .delete();

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + ((item.product as Product)?.price || 0) * item.quantity;
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
