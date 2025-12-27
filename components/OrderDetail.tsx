/**
 * Order Detail Component
 * Shows comprehensive information about a specific order
 * Features:
 * - Order status and timeline
 * - Item list with prices
 * - Shipping address
 * - Payment information
 * - Order summary with totals
 * - Loading and error states
 * - Responsive design
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOrder } from "@/lib/api/orders.api";
import type { Order, OrderItem } from "@/lib/types/order";
import {
  Loader2,
  Package,
  AlertCircle,
  MapPin,
  CreditCard,
  ChevronLeft,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

// DEMO PREVIEW MODE — REMOVE AFTER CLIENT DEMO
// Set to false to use real backend API.
const USE_MOCK_ORDER_DETAIL_PREVIEW = true;

// Mock order data for client demo preview
// This allows the client to see a fully populated order detail page without backend connectivity
const MOCK_ORDER = {
  _id: "MOCK-ORDER-0001",
  id: "MOCK-ORDER-0001",
  status: "paid",
  createdAt: new Date().toISOString(),
  items: [
    {
      _id: "prod_001",
      id: "prod_001",
      productId: "prod_001",
      name: "Stainless Steel Kettle 1.5L",
      qty: 1,
      quantity: 1,
      price: 2949,
      image: "/assets/images/kettle-demo.jpg",
    },
    {
      _id: "prod_002",
      id: "prod_002",
      productId: "prod_002",
      name: "Electric Kettle 1.8L",
      qty: 2,
      quantity: 2,
      price: 3499,
      image: "/assets/images/kettle-demo.jpg",
    },
  ],
  subtotal: 9947,
  tax: 0,
  shippingCost: 0,
  total: 9947,
  payment: {
    gateway: "Razorpay",
    method: "Razorpay",
    status: "paid",
    transactionId: "txn_demo_002_preview",
    paidAt: new Date().toISOString(),
  },
  shippingAddress: {
    name: "Demo User",
    line1: "123 Demo Street",
    line2: "Suite 4B",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560087",
    country: "India",
    phone: "+91 98765 43210",
  },
  user: {
    name: "Demo User",
    email: "demo@demo.com",
  },
} as const;

interface OrderDetailProps {
  orderId: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details on mount
  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // DEMO MODE: Use mock data instead of real API call
      if (USE_MOCK_ORDER_DETAIL_PREVIEW) {
        // Simulate network delay for realistic demo experience
        await new Promise((resolve) => setTimeout(resolve, 350));
        setOrder(MOCK_ORDER as any);
        setLoading(false);
        return;
      }

      // REAL MODE: Fetch from backend API
      const data = await getOrder(orderId);
      if (data) {
        setOrder(data);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load order details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Get status badge configuration
  const getStatusBadge = (status?: string) => {
    const normalizedStatus = status?.toLowerCase() || "pending";

    switch (normalizedStatus) {
      case "delivered":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-5 h-5" />,
          label: "Delivered",
        };
      case "shipped":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Truck className="w-5 h-5" />,
          label: "Shipped",
        };
      case "processing":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="w-5 h-5" />,
          label: "Processing",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="w-5 h-5" />,
          label: "Cancelled",
        };
      case "pending":
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Clock className="w-5 h-5" />,
          label: "Pending",
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <GlobalLoader size="large" />
          <p className="text-gray-600 mt-4">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </Link>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Order
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {error || "Order not found"}
            </p>
            <button
              onClick={fetchOrderDetail}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  const subtotal = order.subtotal || 0;
  const tax = order.tax || 0;
  const shippingCost = order.shippingCost || 0;
  const total = order.total || subtotal + tax + shippingCost;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order #{(order._id || order.id || "").slice(-8).toUpperCase()}
            </h2>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${statusBadge.color}`}
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Items and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: OrderItem, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.name || `Product ${index + 1}`}
                      </h4>
                      <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${((item.price || 0) * item.qty).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${(item.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No items found</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="text-gray-700 space-y-1">
                {order.shippingAddress.line1 && (
                  <p>{order.shippingAddress.line1}</p>
                )}
                {order.shippingAddress.line2 && (
                  <p>{order.shippingAddress.line2}</p>
                )}
                <p>
                  {[
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.shippingAddress.country && (
                  <p>{order.shippingAddress.country}</p>
                )}
                {order.shippingAddress.phone && (
                  <p className="mt-2 text-gray-600">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          {order.payment && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              <div className="space-y-2">
                {order.payment.method && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {order.payment.method}
                    </span>
                  </div>
                )}
                {order.payment.status && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {order.payment.status}
                    </span>
                  </div>
                )}
                {order.payment.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-gray-900">
                      {order.payment.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-red-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
