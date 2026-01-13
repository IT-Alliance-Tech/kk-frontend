/**
 * Admin Orders Page - Redesigned
 * Modern order management with status badges, filters, and detail view
 */
"use client";

import React, { useEffect, useState } from "react";
import { apiGetAuth } from "@/lib/api";
import Link from "next/link";
import { Eye, Package, Calendar, User, CreditCard, Truck, X } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminTable, TableActionMenu, TableActionButton } from "@/components/admin/ui/AdminTable";
import { AdminBadge, StatusBadge } from "@/components/admin/ui/AdminBadge";
import { AdminEmptyState } from "@/components/admin/ui/AdminEmptyState";
import { AdminFilterBar, AdminFilterSelect } from "@/components/admin/ui/AdminFilterBar";
import { AdminLoadingState } from "@/components/admin/ui/AdminLoadingState";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import ReturnStatusBadge from "@/components/ReturnStatusBadge";

interface ReturnRequest {
  _id: string;
  productId: string | { _id: string; name: string };
  status: string;
  actionType: "return" | "return_refund";
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [returnRequests, setReturnRequests] = useState<Record<string, ReturnRequest[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
        setOrders(ordersList);
        await loadReturnRequests();
      } catch (err) {
        console.error("Failed to load admin orders", err);
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  async function loadReturnRequests() {
    try {
      const res = await apiGetAuth("/admin/returns");
      const returns = res?.returnRequests || [];
      
      const grouped: Record<string, ReturnRequest[]> = {};
      returns.forEach((ret: ReturnRequest) => {
        const orderId = typeof ret.productId === 'object' ? ret.productId._id : ret.productId;
        if (!grouped[orderId]) {
          grouped[orderId] = [];
        }
        grouped[orderId].push(ret);
      });
      
      setReturnRequests(grouped);
    } catch (err) {
      console.error("Failed to load return requests", err);
    }
  }

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(price || 0);
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  // Table columns
  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      render: (order: any) => (
        <span className="font-mono text-sm text-slate-900">
          #{order._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: any) => (
        <div>
          <p className="font-medium text-slate-900">{order.shippingAddress?.name || "Unknown"}</p>
          <p className="text-xs text-slate-500">{order.shippingAddress?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      className: "hidden lg:table-cell",
      render: (order: any) => (
        <span className="text-slate-600 text-sm whitespace-nowrap">
          {formatDate(order.createdAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: any) => {
        const orderReturns = returnRequests[order._id] || [];
        const hasReturns = orderReturns.length > 0;
        return (
          <div className="flex flex-col gap-1.5">
            <StatusBadge status={order.status} />
            {hasReturns && (
              <div className="flex flex-wrap gap-1">
                {orderReturns.slice(0, 2).map((ret: ReturnRequest) => (
                  <ReturnStatusBadge 
                    key={ret._id} 
                    status={ret.status}
                    size="sm"
                  />
                ))}
                {orderReturns.length > 2 && (
                  <AdminBadge variant="secondary" size="sm">
                    +{orderReturns.length - 2}
                  </AdminBadge>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "total",
      header: "Total",
      render: (order: any) => (
        <span className="font-semibold text-slate-900">
          {formatPrice(order.total)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[80px]",
      render: (order: any) => (
        <TableActionMenu>
          <TableActionButton 
            onClick={() => setSelectedOrder(order)} 
            icon={<Eye className="w-4 h-4" />} 
            label="View Details" 
          />
        </TableActionMenu>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <AdminLoadingState fullPage message="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        title="Orders"
        description="View and manage customer orders"
        badge={
          <AdminBadge variant="secondary" size="lg">
            {orders.length} orders
          </AdminBadge>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: orderStats.total, color: "bg-slate-100 text-slate-700" },
          { label: "Pending", value: orderStats.pending, color: "bg-amber-50 text-amber-700" },
          { label: "Processing", value: orderStats.processing, color: "bg-blue-50 text-blue-700" },
          { label: "Shipped", value: orderStats.shipped, color: "bg-purple-50 text-purple-700" },
          { label: "Delivered", value: orderStats.delivered, color: "bg-emerald-50 text-emerald-700" },
        ].map((stat) => (
          <div 
            key={stat.label}
            className={`${stat.color} rounded-xl p-3 sm:p-4 text-center`}
          >
            <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
            <p className="text-xs sm:text-sm font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <AdminCard>
        <AdminFilterBar
          searchValue={searchTerm}
          searchPlaceholder="Search by order ID, customer name, or email..."
          onSearchChange={setSearchTerm}
        >
          <AdminFilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
            options={statusOptions.slice(1)}
            className="w-full sm:w-44"
          />
        </AdminFilterBar>
      </AdminCard>

      {/* Orders Table */}
      <AdminCard padding="none">
        {filteredOrders.length === 0 ? (
          <AdminEmptyState
            type={searchTerm || statusFilter ? "no-results" : "no-data"}
            title={searchTerm || statusFilter ? "No orders found" : "No orders yet"}
            description={
              searchTerm || statusFilter
                ? "Try adjusting your search or filters."
                : "Orders will appear here once customers start purchasing."
            }
            action={
              searchTerm || statusFilter
                ? { label: "Clear Filters", onClick: () => { setSearchTerm(""); setStatusFilter(""); } }
                : undefined
            }
          />
        ) : (
          <AdminTable
            columns={columns}
            data={filteredOrders}
            keyExtractor={(order) => order._id}
            onRowClick={(order) => setSelectedOrder(order)}
          />
        )}
      </AdminCard>

      {/* Order Details Modal */}
      <AdminModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?._id.slice(-8).toUpperCase()}`}
        description={selectedOrder ? formatDate(selectedOrder.createdAt) : ""}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Order Status</p>
                  <StatusBadge status={selectedOrder.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total Amount</p>
                <p className="text-xl font-bold text-slate-900">
                  {formatPrice(selectedOrder.total)}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <h4 className="font-medium text-slate-900">Customer</h4>
                </div>
                <p className="text-sm text-slate-700">{selectedOrder.shippingAddress?.name}</p>
                <p className="text-sm text-slate-500">{selectedOrder.shippingAddress?.email}</p>
                <p className="text-sm text-slate-500">{selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <h4 className="font-medium text-slate-900">Shipping Address</h4>
                </div>
                <p className="text-sm text-slate-700">{selectedOrder.shippingAddress?.address}</p>
                <p className="text-sm text-slate-500">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}
                </p>
                <p className="text-sm text-slate-500">{selectedOrder.shippingAddress?.pincode}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {item.productId?.title || item.name || "Product"}
                      </p>
                      <p className="text-sm text-slate-500">
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatPrice(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-500">Payment Method</p>
                  <p className="font-medium text-slate-900 capitalize">
                    {selectedOrder.paymentMethod || "N/A"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Payment Status</p>
                <StatusBadge status={selectedOrder.paymentStatus || "pending"} />
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
