"use client";

import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { createOrder } from "@/lib/api/orders.api";
import { getAddresses } from "@/lib/api/user.api";
import { getAccessToken } from "@/lib/utils/auth";
import DefaultProductImage from "@/assets/images/ChatGPT Image Nov 28, 2025, 10_33_10 PM.png";
import GlobalLoader from "@/components/common/GlobalLoader"; // use default placeholder when product has no image or to replace dummy imports
import { useToast } from "@/components/ToastContext";
import { getErrorMessage } from "@/lib/utils/errorHandler";

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { items, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");
  const [line2, setLine2] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("ONLINE");
  const [mounted, setMounted] = useState(false);
  const [orderTaxInfo, setOrderTaxInfo] = useState<{
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    discountAmount: number;
  } | null>(null);



  useEffect(() => {
    setMounted(true);
  }, []);

  // Get coupon data from URL params
  const couponCode = searchParams.get("couponCode") || "";
  const discountAmount = Number(searchParams.get("discountAmount") || 0);

  // Pre-order estimate (client-side, for display before order creation)
  const estimatedSubtotal = items.reduce((s, it) => s + it.price * (it.qty || 0), 0);
  const estimatedTax = Math.round(estimatedSubtotal * 0.18);
  const estimatedTotal = estimatedSubtotal + estimatedTax - discountAmount;

  // Check authentication and load addresses on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      // Redirect to login with return URL
      router.push("/auth/login?next=/checkout");
      return;
    }

    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAddresses() {
    try {
      setAddressesLoading(true);
      const userAddresses = await getAddresses();
      setAddresses(userAddresses || []);

      // Auto-select default address if available
      if (userAddresses && userAddresses.length > 0) {
        const defaultIndex = userAddresses.findIndex((addr: any) => addr.isDefault);
        const indexToSelect = defaultIndex >= 0 ? defaultIndex : 0;
        setSelectedAddressIndex(indexToSelect);
        prefillAddress(userAddresses[indexToSelect]);
      }
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setAddressesLoading(false);
    }
  }

  function prefillAddress(addr: any) {
    if (!addr) return;
    setName(addr.name || "");
    setPhone(addr.phone || "");
    setAddress(addr.line1 || "");
    setLine2(addr.line2 || "");
    setCity(addr.city || "");
    setState(addr.state || "");
    setPin(addr.pincode || "");
  }

  function handleAddressSelect(index: number) {
    setSelectedAddressIndex(index);
    if (index === -1) {
      // User wants to enter new address - clear form
      setName("");
      setPhone("");
      setAddress("");
      setLine2("");
      setCity("");
      setState("");
      setPin("");
    } else {
      // Pre-fill with selected address
      prefillAddress(addresses[index]);
    }
  }

  // 🛒 Handle order placement
  async function handlePlaceOrder() {
    if (!items || items.length === 0) {
      showToast("Your cart is empty", "info");
      return;
    }
    if (!name || !phone || !address || !city || !pin) {
      showToast("Please fill all required address fields", "error");
      return;
    }

    setLoading(true);
    try {
      // Prepare order payload for backend API
      const orderPayload: any = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.qty || 1,
        })),
        address: {
          name,
          phone,
          line1: address,
          line2: line2 || "",
          city,
          state: state || "",
          country: "India",
          pincode: pin,
        },
        paymentMethod: paymentMethod,
      };

      // Add coupon if applied
      if (couponCode) {
        orderPayload.couponCode = couponCode;
      }

      // Call backend API to create order
      const order = await createOrder(orderPayload as any);

      // Extract tax info from the created order for display
      setOrderTaxInfo({
        subtotal: (order as any).subtotal || estimatedSubtotal,
        taxAmount: (order as any).taxAmount || (order as any).tax || estimatedTax,
        totalAmount: (order as any).totalAmount || (order as any).finalTotal || (order as any).total || estimatedTotal,
        discountAmount: (order as any).discountAmount || 0,
      });

      if (paymentMethod === "ONLINE") {
        // Initiate PhonePe payment — SECURITY: do NOT send amount, backend fetches from DB
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/initiate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getAccessToken()}`
          },
          body: JSON.stringify({
            orderId: (order as any)._id || (order as any).id
          })
        });

        const data = await response.json();
        if (data.success && data.data.redirectUrl) {
          window.location.href = data.data.redirectUrl;
          return;
        } else {
          showToast(data.message || "Failed to initiate payment", "error");
        }
      } else {
        // COD - Clear cart and redirect to success
        clearCart();
        router.push(`/checkout/success?orderId=${order._id || order.id}`);
      }
    } catch (err: any) {
      console.error("Order placement error:", err);
      const message = getErrorMessage(err, "Failed to place order. Please try again.");
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Left: Address + Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Address Section */}
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Delivery Address
            </h2>

            {/* Address Selection Dropdown - Only show when user has multiple addresses */}
            {addressesLoading ? (
              <div className="mb-4 flex justify-center py-4">
                <GlobalLoader size="medium" />
              </div>
            ) : addresses.length > 1 ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Delivery Address
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                  value={selectedAddressIndex}
                  onChange={(e) => handleAddressSelect(Number(e.target.value))}
                >
                  {addresses.map((addr: any, idx: number) => (
                    <option key={idx} value={idx}>
                      {addr.name} - {addr.line1}, {addr.city} ({addr.pincode})
                      {addr.isDefault ? " [Default]" : ""}
                    </option>
                  ))}
                  <option value={-1}>+ Enter New Address</option>
                </select>
              </div>
            ) : addresses.length === 1 ? (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-700">
                  <span className="font-medium">Using saved address:</span> {addresses[0]?.name} - {addresses[0]?.city}
                </p>
              </div>
            ) : null}

            {/* Form Fields - Always editable */}
            {addresses.length === 0 && !addressesLoading && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  No saved addresses found. Please enter your delivery address below.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="Full name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="Phone *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2 sm:col-span-2 text-sm sm:text-base"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <textarea
                className="border rounded px-3 py-2 sm:col-span-2 text-sm sm:text-base"
                placeholder="Address Line 1 *"
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2 sm:col-span-2 text-sm sm:text-base"
                placeholder="Address Line 2 (Optional)"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 text-sm sm:text-base"
                placeholder="PIN code *"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "ONLINE" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-sm sm:text-base">Online Payment</div>
                  <div className="text-xs text-gray-500">Fast & Secure (Cards, UPI, Netbanking)</div>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "COD" ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="ml-3">
                  <div className="font-medium text-sm sm:text-base">Cash on Delivery</div>
                  <div className="text-xs text-gray-500">Pay when you receive your order</div>
                </div>
              </label>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-4 sm:p-6 rounded shadow">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Order Details
            </h2>
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* use default placeholder when no product image or when replacing dummy import */}
                    <Image
                      src={it.image_url || DefaultProductImage}
                      alt={it.name || 'Product image'}
                      width={64}
                      height={64}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = typeof DefaultProductImage === 'string' ? DefaultProductImage : DefaultProductImage.src;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">
                        {it.name}
                      </div>
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
            <h3 className="text-base sm:text-lg font-semibold">
              Order Summary
            </h3>
            <div className="flex justify-between text-xs sm:text-sm">
              <div>Subtotal</div>
              <div>₹{(orderTaxInfo?.subtotal ?? estimatedSubtotal).toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <div>Tax (18% GST)</div>
              <div>₹{(orderTaxInfo?.taxAmount ?? estimatedTax).toFixed(2)}</div>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-green-600">
                <div>Discount {couponCode && `(${couponCode})`}</div>
                <div>-₹{discountAmount.toFixed(2)}</div>
              </div>
            )}
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-sm sm:text-base">
              <div>Total</div>
              <div>₹{(orderTaxInfo?.totalAmount ?? estimatedTotal).toFixed(2)}</div>
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          <div className="text-center">Loading checkout...</div>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
