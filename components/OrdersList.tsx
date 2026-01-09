/**
 * Orders List Component - REDESIGNED
 * Modern, premium order cards with enhanced visuals
 * Features gradient badges, smooth animations, and clean hierarchy
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/api/orders.api";
import type { Order } from "@/lib/types/order";
import {
  Loader2,
  Package,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
} from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";
import ReturnRequestModal from "@/components/ReturnRequestModal";

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load orders. Please try again.",
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
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Get status badge configuration - Modern gradients
  const getStatusBadge = (status?: string) => {
    const normalizedStatus = status?.toLowerCase() || "pending";

    switch (normalizedStatus) {
      case "delivered":
        return {
          color: "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Delivered",
        };
      case "shipped":
        return {
          color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30",
          icon: <Truck className="w-4 h-4" />,
          label: "Shipped",
        };
      case "processing":
        return {
          color: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30",
          icon: <Clock className="w-4 h-4" />,
          label: "Processing",
        };
      case "cancelled":
        return {
          color: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30",
          icon: <XCircle className="w-4 h-4" />,
          label: "Cancelled",
        };
      case "pending":
      default:
        return {
          color: "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/30",
          icon: <Clock className="w-4 h-4" />,
          label: "Pending",
        };
    }
  };

  // Calculate total items in order
  const getTotalItems = (order: Order) => {
    if (!order.items || !Array.isArray(order.items)) return 0;
    return order.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <GlobalLoader size="large" />
          <p className="text-slate-600 mt-4 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error State - Modern
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Failed to Load Orders
          </h3>
          <p className="text-slate-600 mb-6 max-w-md">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-3 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/20"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State - Modern
  if (!orders || orders.length === 0) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No orders yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start shopping to see your orders here!
            </p>

            {/* Demo Button */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 mx-auto max-w-sm">
              <h4 className="font-semibold text-blue-900 mb-1 text-sm">
                Have questions about Return / Refund?
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                Try our demo to see how the return process works
              </p>
              <button
                onClick={() => setShowDemoModal(true)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                Try Demo
              </button>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Products
            </Link>
          </div>
        </div>

        {/* Demo Modal */}
        <ReturnRequestModal
          isOpen={showDemoModal}
          onClose={() => setShowDemoModal(false)}
          orderId="DEMO-ORDER-001"
          productId="DEMO-PRODUCT-001"
          productName="Prestige Pressure Cooker (Demo)"
          productPrice={1999}
          quantity={1}
          onSuccess={fetchOrders}
          isDemo={true}
        />
      </>
    );
  }

  // Orders List - Modern Premium Design
  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const orderId = order._id || order.id || "unknown";
        const statusBadge = getStatusBadge(order.status);
        const totalItems = getTotalItems(order);
        const total = order.total || order.subtotal || 0;

        return (
          <Link
            key={orderId}
            href={`/account/orders/${orderId}`}
            className="block group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden"
          >
            <div className="p-6">
              {/* Header Row - Modern */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:from-emerald-100 group-hover:to-emerald-200 transition-all duration-300">
                      <Package className="w-7 h-7 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
                      Order #{orderId.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${statusBadge.color}`}
                >
                  {statusBadge.icon}
                  <span>{statusBadge.label}</span>
                </div>
              </div>

              {/* Order Details - Modern */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Items</span>
                      <span className="font-bold text-slate-900">{totalItems}</span>
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-600">$</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Total</span>
                      <span className="font-bold text-emerald-600">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                  <span>View Details</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
