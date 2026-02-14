"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import GlobalLoader from "@/components/common/GlobalLoader";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "pending">("loading");
  const orderId = searchParams.get("orderId");

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/status/${orderId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}` // Simple way for now
        }
      });
      const data = await response.json();

       if (data.success && data.data.paymentStatus === "success") {
      clearCart();
      setStatus("success");
    } else if (data.data.paymentStatus === "failed") {
          setStatus("failed");
        } else if (data.data.paymentStatus === "pending") {
          setStatus("pending");
        }
       else {
        setStatus("failed");
      }
    } catch (error) {
      console.error("Failed to check payment status:", error);
      setStatus("failed");
    }
  }, [orderId, clearCart]);

useEffect(() => {
  if (!orderId) {
    router.push("/");
    return;
  }

  checkStatus();
}, [orderId, router, checkStatus]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <GlobalLoader size="large" />
        <p className="mt-4 text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden md:max-w-xl">
        <div className="p-8 text-center">
          {status === "success" ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. Your order has been placed successfully.
              </p>
            </>
          ) : status === "pending" ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h1>
              <p className="text-gray-600 mb-6">
                Your payment is being processed. We will update your order status once it&apos;s confirmed.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
              <p className="text-gray-600 mb-6">
                There was an issue processing your payment. Please try again or contact support.
              </p>
            </>
          )}

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-medium text-gray-900">{orderId}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/account/orders"
                className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><GlobalLoader /></div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
