"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartAPI,
  BackendCart,
  BackendCartItem,
} from "@/lib/api/cart.api";
import { applyCouponForUser } from "@/lib/api/coupons.api";
import { normalizeSrc } from "@/lib/normalizeSrc";
import QuantitySelector from "@/components/QuantitySelector";
import { getAccessToken } from "@/lib/utils/auth";

export default function CartClient() {
  const [cart, setCart] = useState<BackendCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponData, setAppliedCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const router = useRouter();

  // Load cart from backend on mount
  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      setError(null);
      const cartData = await getCart();
      setCart(cartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuantityChange(productId: string, newQty: number) {
    try {
      setActionLoading(true);
      const updatedCart = await updateCartItem(productId, newQty);
      setCart(updatedCart);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update quantity");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveItem(productId: string) {
    try {
      setActionLoading(true);
      const updatedCart = await removeCartItem(productId);
      setCart(updatedCart);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleClearCart() {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    try {
      setActionLoading(true);
      const updatedCart = await clearCartAPI();
      setCart(updatedCart);
      // Clear coupon when cart is cleared
      setCouponCode("");
      setDiscount(0);
      setDiscountAmount(0);
      setAppliedCouponData(null);
      setCouponError("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to clear cart");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setCouponError("Cart is empty");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      // Map cart items to the format expected by the API
      const cartItems = cart.items.map((item: BackendCartItem) => ({
        productId: item.productId,
        qty: item.qty,
        price: item.price,
      }));

      const result = await applyCouponForUser(couponCode, cartItems);

      if (result.success) {
        setDiscountAmount(result.discountAmount || 0);
        setAppliedCouponData(result.coupon);
        setDiscount(0); // Reset percentage discount since we're using flat discount amount
        setCouponError("");
        // Show success message
        alert(result.message || "Coupon applied successfully!");
      } else {
        setCouponError(result.error || "Failed to apply coupon");
        setDiscountAmount(0);
        setAppliedCouponData(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to apply coupon";
      setCouponError(errorMessage);
      setDiscountAmount(0);
      setAppliedCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function handleCheckout() {
    // Check if user is logged in
    const token = getAccessToken();
    if (!token) {
      // Redirect to login with return URL
      router.push("/login?next=/checkout");
      return;
    }

    // Pass coupon data to checkout
    const params = new URLSearchParams();
    if (appliedCouponData && discountAmount > 0) {
      params.append("couponCode", couponCode);
      params.append("discountAmount", discountAmount.toString());
    }
    router.push(`/checkout${params.toString() ? '?' + params.toString() : ''}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">
            You need to login to view your cart
          </div>
          <button
            onClick={() => router.push("/login?next=/cart")}
            className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 transition"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Your cart is empty 🛒
        </h2>
        <button
          onClick={() => router.push("/products")}
          className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded text-sm sm:text-base hover:bg-emerald-700 transition"
        >
          Shop Now
        </button>
      </div>
    );
  }

  const subtotal = cart.total;
  const finalDiscountAmount = appliedCouponData ? discountAmount : 0;
  const total = subtotal - finalDiscountAmount;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Your Items ({cart.items.length})
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {cart.items.map((item: BackendCartItem) => (
                <div
                  key={item.productId}
                  className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 flex-col sm:flex-row border-b pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    {item.image ? (
                      <Image
                        src={normalizeSrc(item.image)}
                        alt={item.title || "Product image"}
                        width={80}
                        height={80}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded flex-shrink-0"
                        unoptimized={item.image?.startsWith("http")}
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                        No Image
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm sm:text-base truncate">
                        {item.title}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {/* Removed duplicate quantity display beside unit price — quantity is controlled by the spinner control */}
                        ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                    <QuantitySelector
                      value={item.qty}
                      onChange={(newQty) =>
                        handleQuantityChange(item.productId, newQty)
                      }
                      size="sm"
                    />
                    <div className="text-base sm:text-lg font-semibold min-w-[80px] text-right">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      disabled={actionLoading}
                      className="text-red-600 hover:underline text-xs sm:text-sm disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded shadow">
            <h3 className="text-base sm:text-lg font-semibold mb-3">
              Have a coupon?
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponLoading}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || actionLoading}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {couponLoading ? "Applying..." : "Apply Coupon"}
              </button>
              <button
                onClick={() => router.push("/coupons")}
                className="bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded text-sm sm:text-base hover:bg-yellow-600 transition"
              >
                View Coupons
              </button>
            </div>
            {couponError && (
              <div className="text-red-500 mt-2 text-xs sm:text-sm">
                {couponError}
              </div>
            )}
            {appliedCouponData && discountAmount > 0 && (
              <div className="text-green-600 mt-2 text-xs sm:text-sm">
                ✓ Coupon {appliedCouponData.code} applied: ₹{discountAmount.toFixed(2)} off
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white p-4 sm:p-6 rounded shadow space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">
              Order Summary
            </h3>

            <div className="flex justify-between text-xs sm:text-sm">
              <div>Subtotal</div>
              <div>₹{subtotal.toFixed(2)}</div>
            </div>

            {appliedCouponData && discountAmount > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-green-600">
                <div>Discount ({appliedCouponData.code})</div>
                <div>-₹{discountAmount.toFixed(2)}</div>
              </div>
            )}

            <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-sm sm:text-base">
              <div>Total</div>
              <div>₹{total.toFixed(2)}</div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={actionLoading}
              className="w-full bg-emerald-600 text-white py-2 rounded text-sm sm:text-base hover:bg-emerald-700 transition disabled:opacity-50"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={handleClearCart}
              disabled={actionLoading}
              className="w-full border mt-2 py-2 rounded text-red-600 text-sm sm:text-base hover:bg-red-50 transition disabled:opacity-50"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
