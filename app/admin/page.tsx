/**
 * Admin Dashboard - Redesigned
 * Modern dashboard with stats, recent orders, and quick actions
 */
"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Users,
  RotateCcw,
  Ticket,
} from "lucide-react";
import ordersData from "../../data/mock/orders.json";
import productsData from "../../data/mock/products.json";

import { AdminStatsCard, AdminStatsGrid } from "@/components/admin/ui/AdminStats";
import { AdminCard, AdminCardHeader } from "@/components/admin/ui/AdminCard";

const RecentOrdersTable = dynamic(() => import("../../components/admin/RecentOrdersTable"), { ssr: false });
const RecentContactSubmissions = dynamic(() => import("../../components/admin/RecentContactSubmissions"), { ssr: false });

export default function AdminDashboard() {
  // Calculate KPIs from mock data
  const totalOrders = ordersData.length;
  const totalProducts = productsData.length;

  // Calculate total revenue
  const totalRevenue = ordersData
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  // Sort orders by date (most recent first)
  const recentOrders = [...ordersData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Helper to format numbers as Indian Rupees
  const formatINR = (value: number): string => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
    } catch (e) {
      return `₹${value}`;
    }
  };

  // Quick action cards
  const quickActions = [
    { label: "Add Product", href: "/admin/products/new", icon: Package },
    { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Manage Returns", href: "/admin/returns", icon: RotateCcw },
    { label: "Create Coupon", href: "/admin/coupons", icon: Ticket },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome section */}
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
      <AdminStatsGrid columns={4}>
        <AdminStatsCard
          title="Total Revenue"
          value={formatINR(totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: 12.5, label: "vs last month" }}
          variant="success"
        />
        <AdminStatsCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={{ value: 8.3, label: "vs last month" }}
          variant="info"
        />
        <AdminStatsCard
          title="Products"
          value={totalProducts.toString()}
          icon={<Package className="w-6 h-6" />}
          description="Active products"
          variant="default"
        />
        <AdminStatsCard
          title="Conversion Rate"
          value="3.2%"
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 2.1, label: "vs last month" }}
          variant="warning"
        />
      </AdminStatsGrid>

      {/* Quick Actions */}
      <AdminCard padding="md">
        <AdminCardHeader 
          title="Quick Actions" 
          description="Common tasks and shortcuts"
        />
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

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Orders */}
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
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-0">
            <RecentOrdersTable orders={recentOrders} maxRows={5} />
          </div>
        </AdminCard>
      </div>

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
              View all
              <ArrowRight className="w-4 h-4" />
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
