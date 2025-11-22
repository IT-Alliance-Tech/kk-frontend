"use client";

import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 🔥 FETCH REAL API DATA
  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await apiGet("/admin/orders");

        // Backend gives: { ok: true, data: [...] }
        const ordersList = res.data || [];

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

  if (loading) return <p className="text-center py-10">Loading orders...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
        <p className="text-sm text-gray-600 mt-1">
          View and manage customer orders
        </p>
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
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
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs">Order ID</th>
                <th className="px-6 py-3 text-left text-xs">Customer</th>
                <th className="px-6 py-3 text-left text-xs hidden lg:table-cell">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs">Status</th>
                <th className="px-6 py-3 text-left text-xs">Total</th>
                <th className="px-6 py-3 text-left text-xs">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order: any) => {
                const customerName = order.shippingAddress?.name || "Unknown";
                const customerEmail =
                  order.shippingAddress?.email || "N/A";

                return (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{order._id}</td>

                    <td className="px-6 py-4">
                      <div className="font-medium">{customerName}</div>
                      <div className="text-xs text-gray-500">
                        {customerEmail}
                      </div>
                    </td>

                    <td className="px-6 py-4 hidden lg:table-cell">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold">
                      ₹{(order.total || 0).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 text-sm"
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
          <div className="p-6 text-center text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
}
