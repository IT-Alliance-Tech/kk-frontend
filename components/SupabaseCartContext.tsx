// // components/SupabaseCartContext.tsx
// "use client";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { useRouter } from "next/navigation";

// type CartItem = {
//   id: string; // cart_items.id
//   product_id: string;
//   qty: number;
//   product_snapshot: any;
// };

// type CartContextValue = {
//   items: CartItem[];
//   count: number;
//   loading: boolean;
//   refresh: () => Promise<void>;
//   addItem: (product: { id: string; name: string; price: number; image_url?: string }, qty?: number) => Promise<void>;
//   removeItem: (cartItemId: string) => Promise<void>;
//   updateQty: (cartItemId: string, qty: number) => Promise<void>;
//   clearCart: () => Promise<void>;
// };

// const CartContext = createContext<CartContextValue | undefined>(undefined);

// export function useCart() {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error("useCart must be used within SupabaseCartProvider");
//   return ctx;
// }

// export function SupabaseCartProvider({ children }: { children: React.ReactNode }) {
//   const supabase = createClientComponentClient();
//   const router = useRouter();

//   const [userId, setUserId] = useState<string | null>(null);
//   const [items, setItems] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   // get user on mount and listen for auth changes
//   useEffect(() => {
//     let mounted = true;
//     (async () => {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();
//       if (!mounted) return;
//       setUserId(user?.id ?? null);
//       setLoading(false);
//       if (user?.id) {
//         await fetchCart(user.id);
//       } else {
//         setItems([]);
//       }
//     })();

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       const id = session?.user?.id ?? null;
//       setUserId(id);
//       if (id) fetchCart(id);
//       else setItems([]);
//     });

//     return () => {
//       mounted = false;
//       listener.subscription.unsubscribe();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function fetchCart(uid?: string) {
//     setLoading(true);
//     try {
//       const idToUse = uid ?? userId;
//       if (!idToUse) {
//         setItems([]);
//         setLoading(false);
//         return;
//       }
//       const { data, error } = await supabase
//         .from("cart_items")
//         .select("*")
//         .eq("user_id", idToUse)
//         .order("created_at", { ascending: false });

//       if (error) {
//         console.error("fetchCart error", error);
//         setItems([]);
//       } else {
//         setItems((data ?? []) as CartItem[]);
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const refresh = async () => {
//     if (!userId) return;
//     await fetchCart(userId);
//   };

//   const addItem = async (product: { id: string; name: string; price: number; image_url?: string }, qty = 1) => {
//     const sup = supabase;
//     // require login
//     const {
//       data: { user },
//     } = await sup.auth.getUser();
//     if (!user) {
//       // redirect to login
//       router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
//       return;
//     }
//     const uid = user.id;
//     // Check if product already in cart (same product_id)
//     const { data: existing, error: fetchErr } = await sup
//       .from("cart_items")
//       .select("*")
//       .eq("user_id", uid)
//       .eq("product_id", product.id)
//       .limit(1)
//       .maybeSingle();

//     if (fetchErr) {
//       console.error("cart fetch err", fetchErr);
//     }

//     if (existing) {
//       // update qty
//       const newQty = (existing.qty ?? 1) + qty;
//       const { error: updErr } = await sup
//         .from("cart_items")
//         .update({ qty: newQty, updated_at: new Date().toISOString() })
//         .eq("id", existing.id);
//       if (updErr) console.error("cart update error", updErr);
//     } else {
//       // insert new row with product snapshot
//       const { error: insertErr } = await sup.from("cart_items").insert([
//         {
//           user_id: uid,
//           product_id: product.id,
//           qty,
//           product_snapshot: {
//             id: product.id,
//             name: product.name,
//             price: product.price,
//             image_url: product.image_url ?? null,
//           },
//         },
//       ]);
//       if (insertErr) console.error("cart insert error", insertErr);
//     }

//     await fetchCart(uid);
//   };

//   const removeItem = async (cartItemId: string) => {
//     const sup = supabase;
//     const { data: { user } } = await sup.auth.getUser();
//     if (!user) return;
//     const { error } = await sup.from("cart_items").delete().eq("id", cartItemId).eq("user_id", user.id);
//     if (error) console.error("removeItem error", error);
//     await fetchCart(user.id);
//   };

//   const updateQty = async (cartItemId: string, qty: number) => {
//     const sup = supabase;
//     const { data: { user } } = await sup.auth.getUser();
//     if (!user) return;
//     const { error } = await sup.from("cart_items").update({ qty, updated_at: new Date().toISOString() }).eq("id", cartItemId).eq("user_id", user.id);
//     if (error) console.error("updateQty error", error);
//     await fetchCart(user.id);
//   };

//   const clearCart = async () => {
//     const sup = supabase;
//     const { data: { user } } = await sup.auth.getUser();
//     if (!user) return;
//     const { error } = await sup.from("cart_items").delete().eq("user_id", user.id);
//     if (error) console.error("clearCart error", error);
//     await fetchCart(user.id);
//   };

//   const value: CartContextValue = {
//     items,
//     count: items.reduce((s, it) => s + (it.qty ?? 0), 0),
//     loading,
//     refresh,
//     addItem,
//     removeItem,
//     updateQty,
//     clearCart,
//   };

//   return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
// }
