/**
 * Admin Dashboard - Real-time analytics
 * Fetches KPIs + recent orders from backend.
 * Recent orders are lazy-loaded with pagination.
 */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Ticket,
  Loader2,
  ChevronDown,
} from "lucide-react";

import { AdminStatsCard, AdminStatsGrid } from "@/components/admin/ui/AdminStats";
import { AdminCard, AdminCardHeader } from "@/components/admin/ui/AdminCard";
import {
  fetchDashboardSummary,
  fetchRecentOrders,
  type DashboardSummary,
  type DashboardOrder,
} from "@/lib/api/admin.dashboard.api";

const RecentContactSubmissions = dynamic(
  () => import("../../components/admin/RecentContactSubmissions"),
  { ssr: false }
);

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatINR(value: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  accepted:   "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  packed:     "bg-indigo-100 text-indigo-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-green-100 text-green-800",
  cancelled:  "bg-red-100 text-red-800",
  rejected:   "bg-red-100 text-red-800",
};

// ── Quick actions ──────────────────────────────────────────────────────────────

const quickActions = [
  { label: "Add Product",    href: "/admin/products/new", icon: Package },
  { label: "View Orders",    href: "/admin/orders",       icon: ShoppingCart },
  { label: "Manage Returns", href: "/admin/returns",      icon: RotateCcw },
  { label: "Create Coupon",  href: "/admin/coupons",      icon: Ticket },
];

// ── Skeleton card ──────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-sm animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
      <div className="h-8 w-32 bg-slate-200 rounded" />
    </div>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersHasMore, setOrdersHasMore] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // ── Load summary KPIs ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setSummaryLoading(true);
    setSummaryError(null);

    fetchDashboardSummary()
      .then((data) => { if (!cancelled) setSummary(data); })
      .catch((err) => { if (!cancelled) setSummaryError(err?.message ?? "Failed to load stats"); })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Lazy-load recent orders ────────────────────────────────────────────────
  const loadOrders = useCallback(async (page: number) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const result = await fetchRecentOrders(page, 5);
      setOrders((prev) => page === 1 ? result.data : [...prev, ...result.data]);
      setOrdersHasMore(result.hasMore);
      setOrdersPage(page);
    } catch (err: any) {
      setOrdersError(err?.message ?? "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(1); }, [loadOrders]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Package className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      {summaryError ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          {summaryError}
        </div>
      ) : (
        <AdminStatsGrid columns={4}>
          {summaryLoading ? (
            <>
              <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
            </>
          ) : (
            <>
              <AdminStatsCard
                title="Total Revenue"
                value={formatINR(summary?.totalRevenue ?? 0)}
                icon={<DollarSign className="w-6 h-6" />}
                variant="success"
              />
              <AdminStatsCard
                title="Total Orders"
                value={(summary?.totalOrders ?? 0).toString()}
                icon={<ShoppingCart className="w-6 h-6" />}
                variant="info"
              />
              <AdminStatsCard
                title="Products"
                value={(summary?.totalProducts ?? 0).toString()}
                icon={<Package className="w-6 h-6" />}
                description="Active products"
                variant="default"
              />
              <AdminStatsCard
                title="Conversion Rate"
                value={`${summary?.conversionRate ?? 0}%`}
                icon={<TrendingUp className="w-6 h-6" />}
                description="Orders / Users"
                variant="warning"
              />
            </>
          )}
        </AdminStatsGrid>
      )}

      {/* Quick Actions */}
      <AdminCard padding="md">
        <AdminCardHeader title="Quick Actions" description="Common tasks and shortcuts" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all group"
            >
              <action.icon className="w-6 h-6 text-slate-500 group-hover:text-emerald-600 mb-2 transition-colors" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </AdminCard>

      {/* Recent Orders — lazy loaded */}
      <AdminCard padding="none">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
              <p className="text-sm text-slate-500 mt-0.5">Latest customer orders</p>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {ordersError ? (
            <p className="p-5 text-sm text-red-600">{ordersError}</p>
          ) : orders.length === 0 && !ordersLoading ? (
            <p className="p-5 text-sm text-slate-500">No orders yet.</p>
          ) : (
            <>
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate">{order.customerName}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <span className="text-sm font-semibold text-slate-800">{formatINR(order.total)}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.status}
                    </span>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}

              {(ordersHasMore || ordersLoading) && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => loadOrders(ordersPage + 1)}
                    disabled={ordersLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {ordersLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {ordersLoading ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </AdminCard>

      {/* Recent Contact Submissions */}
      <AdminCard padding="none">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Contact Submissions</h3>
              <p className="text-sm text-slate-500 mt-0.5">Latest customer inquiries</p>
            </div>
            <Link
              href="/admin/contact-submissions"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <RecentContactSubmissions />
        </div>
      </AdminCard>

    </div>
  );
}
