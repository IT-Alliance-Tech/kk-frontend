// NEW - admin demo
"use client";

import React from "react";
import dynamic from "next/dynamic";
import ordersData from "../../data/mock/orders.json";
import productsData from "../../data/mock/products.json";

const KPI = dynamic(() => import("../../components/admin/KPI"), { ssr: false });
const RecentOrdersTable = dynamic(() => import("../../components/admin/RecentOrdersTable"), { ssr: false });

export default function AdminDashboard() {
  // Calculate KPIs from mock data
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter((o) => o.status === "pending").length;
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

      {/* Low Stock Alert - Full Width */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Low Stock Alert
        </h3>
        <div className="space-y-3">
          {productsData
            .filter((p) => p.stock < 20)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5)
            .map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-2"
              >
                <span className="text-xs sm:text-sm text-gray-900 truncate flex-1">{product.name}</span>
                <span
                  className={`text-xs sm:text-sm font-semibold flex-shrink-0 ${
                    product.stock === 0
                      ? "text-red-600"
                      : product.stock < 10
                        ? "text-orange-600"
                        : "text-yellow-600"
                  }`}
                >
                  {product.stock === 0
                    ? "Out of Stock"
                    : `${product.stock} left`}
                </span>
              </div>
            ))}
          {productsData.filter((p) => p.stock < 20).length === 0 && (
            <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
              All products are well stocked
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
