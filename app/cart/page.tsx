// app/cart/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const subtotal = items.reduce((sum, item) => sum + item.price * (item.qty || 0), 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setLoading(true);
    setCouponError("");

    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_percent, is_active, expires_at")
      .eq("code", couponCode.trim())
      .maybeSingle();

    if (error || !data || !data.is_active) {
      setCouponError("Invalid or inactive coupon.");
      setDiscount(0);
    } else {
      // Optionally check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponError("Coupon expired.");
        setDiscount(0);
      } else {
        setDiscount(data.discount_percent || 0);
        setCouponError("");
      }
    }
    setLoading(false);
  }

  function handleCheckout() {
    // pass discount info via query or state — we'll pass via router push with query params
    router.push(`/checkout?discount=${discount}&coupon=${encodeURIComponent(couponCode || "")}`);
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Your cart is empty 🛒</h2>
        <button
          onClick={() => router.push("/products")}
          className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded text-sm sm:text-base hover:bg-emerald-700 transition"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Items</h3>
            <div className="space-y-3 sm:space-y-4">
              {items.map((it) => (
                <div key={it.id} className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    {/* TODO: replace with next/image if src is static */}
                    <img src={it.image_url || "/placeholder.png"} alt={it.name} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">{it.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">₹{it.price} × {it.qty || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="text-base sm:text-lg font-semibold">₹{((it.price) * (it.qty || 0)).toFixed(2)}</div>
                    <button onClick={() => removeItem(it.id)} className="text-red-600 hover:underline text-xs sm:text-sm">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3">Have a coupon?</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input className="flex-1 border rounded px-3 py-2 text-sm sm:text-base" placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
              <button onClick={handleApplyCoupon} disabled={loading} className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-blue-700 transition">
                {loading ? "Checking..." : "Apply Coupon"}
              </button>
              <button onClick={() => router.push("/coupons")} className="bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-yellow-600 transition">View Coupons</button>
            </div>
            {couponError && <div className="text-red-500 mt-2 text-xs sm:text-sm">{couponError}</div>}
            {discount > 0 && <div className="text-green-600 mt-2 text-xs sm:text-sm">Coupon applied: {discount}% off</div>}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white p-4 sm:p-6 rounded shadow space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Order Summary</h3>

            <div className="flex justify-between text-xs sm:text-sm">
              <div>Subtotal</div>
              <div>₹{subtotal.toFixed(2)}</div>
            </div>

            <div className="flex justify-between text-xs sm:text-sm">
              <div>Discount</div>
              <div>{discount}%</div>
            </div>

            <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-sm sm:text-base">
              <div>Total</div>
              <div>₹{total.toFixed(2)}</div>
            </div>

            <button onClick={handleCheckout} className="w-full bg-emerald-600 text-white py-2 rounded text-sm sm:text-base hover:bg-emerald-700 transition">Proceed to Checkout</button>

            <button onClick={() => { clearCart(); }} className="w-full border mt-2 py-2 rounded text-red-600 text-sm sm:text-base hover:bg-red-50 transition">Clear Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
