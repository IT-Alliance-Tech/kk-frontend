"use client";

import React, { useEffect, useState } from "react";
import { apiGetAuth } from "@/lib/api";
import GlobalLoader from "@/components/common/GlobalLoader";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 🔥 FETCH REAL API DATA
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await apiGetAuth("/admin/orders");
        const ordersList =
          Array.isArray(res) ? res :
          Array.isArray(res?.orders) ? res.orders :
          Array.isArray(res?.items) ? res.items :
          Array.isArray(res?.data) ? res.data :
          [];
        console.log("admin orders response:", res);
        console.log("admin orders list:", ordersList);
        setOrders(ordersList);
      } catch (err) {
        console.error("Failed to load admin orders", err);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  const filteredOrders = orders
    .filter((order: any) => {
      const customerName = order?.shippingAddress?.name || "";
      const customerEmail = order?.shippingAddress?.email || "";

      const matchesSearch =
        order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <GlobalLoader size="large" />
    </div>
  );

  return (
    <div className="space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          View and manage customer orders
        </p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 border rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Order ID</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order: any) => {
                const customerName = order.shippingAddress?.name || "Unknown";
                const customerEmail =
                  order.shippingAddress?.email || "N/A";

                return (
                  <tr key={order._id} className="hover:bg-gray-50 border-b">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                      <span className="font-mono">{order._id}</span>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="font-medium text-xs sm:text-sm">{customerName}</div>
                      <div className="text-xs text-gray-500">
                        {customerEmail}
                      </div>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell text-xs sm:text-sm whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-xs sm:text-sm whitespace-nowrap">
                      ₹{(order.total || 0).toFixed(2)}
                    </td>

                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 text-xs sm:text-sm hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-4 sm:p-6 text-center text-gray-500 text-sm">No orders found</div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Order Details</h2>
            <p className="text-gray-600 text-center mb-6">
              Order details view coming soon
            </p>
            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
