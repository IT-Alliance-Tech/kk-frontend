// app/payment/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  async function fetchOrder() {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (error || !data) {
      alert("Order not found");
      setLoading(false);
      return;
    }
    setOrder(data);
    setLoading(false);
  }

  async function handlePay() {
    if (!order) return;
    // Create Razorpay order server-side
    try {
      const amountPaise = Math.round(order.total * 100); // paise
      const resp = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt: order.id }),
      });
      const data = await resp.json();
      if (!resp.ok) throw data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "KitchenKettles",
        description: `Order ${order.id}`,
        order_id: data.id,
        handler: async function (response: any) {
          // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
          // Update order status in Supabase
          await supabase.from("orders").update({ status: "paid", payment_info: response }).eq("id", order.id);
          router.push(`/confirmation?orderId=${order.id}`);
        },
        prefill: {
          name: order.shipping_address?.name || "",
          email: order.shipping_address?.email || "",
          contact: order.shipping_address?.phone || "",
        },
        theme: { color: "#059669" },
      };

      // Load Razorpay script if not present
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed");
    }
  }

  function loadRazorpayScript() {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.body.appendChild(script);
    });
  }

  if (loading) return <div className="p-8 text-center">Loading order...</div>;
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        <div className="mb-4">
          <div className="flex justify-between">
            <span>Order ID</span>
            <span>{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={handlePay} className="bg-emerald-600 text-white px-4 py-2 rounded">
          Pay Now
        </button>
        <button onClick={() => router.push("/cart")} className="ml-2 border px-4 py-2 rounded">
          Back to Cart
        </button>
      </div>
    </div>
  );
}
