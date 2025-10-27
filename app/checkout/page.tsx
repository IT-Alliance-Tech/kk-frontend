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

  // Prefill profile data if user logged in
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const uid = data.user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle();

        if (profile) {
          setName(profile.name || "");
          setPhone(profile.phone || "");
          setEmail(profile.email || data.user.email || "");
          setAddress(profile.address || "");
          setCity(profile.city || "");
          setState(profile.state || "");
          setPin(profile.pin || "");
        } else {
          setEmail(data.user.email || "");
        }
      }
    })();
  }, []);

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

      const orderPayload = {
        user_id,
        items: items.map((it) => ({
          product_id: it.id,
          name: it.name,
          price: it.price,
          qty: it.qty || 0,
          image_url: it.image_url || null,
        })),
        subtotal: Number(subtotal),
        discount_percent: Number(discount),
        total: Number(total),
        status: "created",
        shipping_address: {
          name,
          phone,
          email,
          address,
          city,
          state,
          pin,
        },
        coupon_code: coupon || null,
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderPayload]) // ✅ must be array
        .select()
        .single();

      if (error) {
        console.error("Supabase error inserting order:", error);
        throw new Error(error.message);
      }

      clearCart();
      router.push(`/payment?orderId=${order.id}`);
    } catch (err) {
      console.error("Order placement error:", err);
      alert("Failed to place order: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        {/* Left: Address & Order Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Address */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border rounded px-3 py-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="PIN code" value={pin} onChange={(e) => setPin(e.target.value)} />
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={it.image_url || "/placeholder.png"} className="w-16 h-16 object-cover rounded" />
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-500">Qty: {it.qty || 0}</div>
                    </div>
                  </div>
                  <div className="font-semibold">₹{(it.price * (it.qty || 0)).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="bg-white p-6 rounded shadow space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="flex justify-between text-sm">
              <div>Subtotal</div>
              <div>₹{subtotal.toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Discount</div>
              <div>{discount}%</div>
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <div>Total</div>
              <div>₹{total.toFixed(2)}</div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
            >
              {loading ? "Placing order..." : "Continue to Payment"}
            </button>

            <button
              onClick={() => router.push("/cart")}
              className="w-full mt-2 border py-2 rounded hover:bg-gray-50 transition"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
