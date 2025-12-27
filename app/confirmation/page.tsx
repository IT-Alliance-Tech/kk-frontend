// app/confirmation/page.tsx
"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import GlobalLoader from "@/components/common/GlobalLoader";

function ConfirmationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();
    if (error) {
      console.error(error);
    } else {
      setOrder(data);
    }
    setLoading(false);
  }, [supabase, orderId]);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId, fetchOrder]);

  if (loading) return (
    <div className="p-8 flex justify-center">
      <GlobalLoader size="large" />
    </div>
  );
  if (!order) return <div className="p-8 text-center">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-emerald-600">
          Thank you — your order is confirmed!
        </h2>
        <p className="mb-4">
          Order ID: <strong>{order.id}</strong>
        </p>

        <div className="mb-4">
          <h3 className="font-semibold">Delivery Details</h3>
          <div className="text-sm text-gray-700">
            <div>{order.shipping_address?.name}</div>
            <div>{order.shipping_address?.address}</div>
            <div>
              {order.shipping_address?.city} {order.shipping_address?.pin}
            </div>
            <div>{order.shipping_address?.phone}</div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Items</h3>
          <ul className="divide-y">
            {order.items.map((it: any) => (
              <li key={it.id} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-gray-500">Qty: {it.qty}</div>
                </div>
                <div className="font-semibold">
                  ₹{(it.price * it.qty).toFixed(2)}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t mt-4 pt-3 flex justify-between font-semibold">
            <div>Total</div>
            <div>₹{order.total.toFixed(2)}</div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="bg-emerald-600 text-white px-4 py-2 rounded"
              onClick={() => router.push("/products")}
            >
              Continue Shopping
            </button>
            <button
              className="border px-4 py-2 rounded"
              onClick={() => router.push("/")}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
          <div className="text-center">Loading order confirmation...</div>
        </div>
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}
