// NEW - admin demo
"use client";

import React from "react";
import dynamic from "next/dynamic";
import ordersData from "../../data/mock/orders.json";
import productsData from "../../data/mock/products.json";

const KPI = dynamic(() => import("../../components/admin/KPI"), { ssr: false });
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
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
    } catch (e) {
      return `₹${value}`; // fallback
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
        <KPI
          title="Total Orders"
          value={totalOrders}
          icon="📦"
          trend={{ value: 12.5, isPositive: true }}
          subtitle="All time"
        />
        <KPI
          title="Revenue"
          value={formatINR(totalRevenue)}
          icon="💰"
          trend={{ value: 8.3, isPositive: true }}
          subtitle="Excluding cancelled"
        />
        <KPI
          title="Products"
          value={totalProducts}
          icon="🛍️"
          subtitle="Active products"
        />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={recentOrders} maxRows={5} />

      {/* Recent Contact Submissions */}
      <RecentContactSubmissions />
    </div>
  );
}
