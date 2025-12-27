/**
 * Orders List Component
 * Displays a list of user's orders with status, dates, and totals
 * Features:
 * - Fetches orders from backend API
 * - Loading, error, and empty states
 * - Status badges with color coding
 * - Responsive grid layout
 * - Click to view order details
 * - Proper error handling
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
} from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Get status badge configuration
  const getStatusBadge = (status?: string) => {
    const normalizedStatus = status?.toLowerCase() || "pending";

    switch (normalizedStatus) {
      case "delivered":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Delivered",
        };
      case "shipped":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Truck className="w-4 h-4" />,
          label: "Shipped",
        };
      case "processing":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="w-4 h-4" />,
          label: "Processing",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="w-4 h-4" />,
          label: "Cancelled",
        };
      case "pending":
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <GlobalLoader size="large" />
          <p className="text-gray-600 mt-4">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Orders
          </h3>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start shopping to see your orders here!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Orders List
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
            className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="p-6">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Order #{orderId.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusBadge.color}`}
                >
                  {statusBadge.icon}
                  <span>{statusBadge.label}</span>
                </div>
              </div>

              {/* Order Details */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-gray-600">Items: </span>
                    <span className="font-medium text-gray-900">
                      {totalItems}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total: </span>
                    <span className="font-semibold text-red-600">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-red-600 font-medium text-sm">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
