"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const { items, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");

  const discount = Number(searchParams.get("discount") || 0);
  const coupon = searchParams.get("coupon") || "";

  const subtotal = items.reduce((s, it) => s + it.price * (it.qty || 0), 0);
  const total = subtotal - (subtotal * discount) / 100;

    // 🧠 Prefill user data if logged in
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
        if (profile) {
          setName(profile.full_name || "");
          setEmail(data.user.email || "");
        }
      }
    })();
    // supabase client is stable, safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🛒 Handle order placement
  async function handlePlaceOrder() {
    if (!items || items.length === 0) {
      alert("Cart is empty");
      return;
    }
    if (!name || !phone || !address) {
      alert("Please fill name, phone, and address");
      return;
    }

    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user_id = auth?.user?.id || null;

      // ✅ Order payload matching your DB schema
      const orderPayload = {
        user_id,
        order_number: "ORD-" + Date.now(), // unique order number
        subtotal: Number(subtotal),
        discount_amount: Number((subtotal * discount) / 100),
        total: Number(total),
        status: "pending",
        payment_status: "pending",
        payment_method: "cod", // can be dynamic later
        shipping_address: {
          name,
          phone,
          email,
          address,
          city,
          state,
          pin,
        },
        billing_address: {
          name,
          phone,
          email,
          address,
          city,
          state,
          pin,
        },
        coupons: coupon || null, // ✅ matches your DB column
      };

      // ✅ Insert into Supabase
      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select()
        .single();

      if (error) {
        console.error("Supabase error inserting order:", error);
        throw new Error(error.message);
      }

      clearCart();
      router.push(`/payment?orderId=${order.id}`);
    } catch (err: any) {
      console.error("Order placement error:", err);
      alert("Failed to place order: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left: Address + Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Address Section */}
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 sm:col-span-2 text-sm sm:text-base"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                className="border rounded px-3 py-2 sm:col-span-2 text-sm sm:text-base"
                placeholder="Address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="PIN code"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Order Details</h2>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* TODO: replace with next/image if src is static */}
                    <img
                      src={it.image_url || "/placeholder.png"}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                      alt={it.name}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{it.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Qty: {it.qty || 0}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-sm sm:text-base self-end sm:self-auto">
                    ₹{(it.price * (it.qty || 0)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-white p-4 sm:p-6 rounded shadow space-y-3 sm:space-y-4 sticky top-20">
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

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition text-sm sm:text-base disabled:opacity-50"
            >
              {loading ? "Placing order..." : "Continue to Payment"}
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="w-full mt-2 border py-2 rounded hover:bg-gray-50 transition text-sm sm:text-base"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
