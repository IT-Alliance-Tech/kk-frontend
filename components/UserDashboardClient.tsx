"use client";

import React, { useEffect, useState } from "react";
import { getUserDashboard, type DashboardData } from "@/lib/api/user.api";
import { ShoppingBag, DollarSign, Package, ShoppingCart } from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

/**
 * UserDashboardClient
 * Client-side component that fetches and displays comprehensive user dashboard data
 * Includes stats, recent orders, cart summary, and user profile
 */
export default function UserDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const dashboardData = await getUserDashboard(1, 5);
        setData(dashboardData);
      } catch (err) {
        // Error silently handled - no UI display
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <GlobalLoader size="large" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { profile, stats, recentOrders, cart, recentActivity } = data;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Cart Items</h3>
            <ShoppingCart className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{cart?.itemCount || 0}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending Orders</h3>
            <Package className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.byStatus?.pending || 0}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <div key={order.orderId} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.orderId.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Summary */}
      {cart && cart.itemCount > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cart Summary</h3>
            <a
              href="/cart"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Cart
            </a>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Items</span>
              <span className="font-medium text-gray-900">{cart.itemCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">${cart.subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Name</span>
            <span className="font-medium text-gray-900">{profile.name || "Not set"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{profile.email}</span>
          </div>
          {profile.phone && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium text-gray-900">{profile.phone}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Member Since</span>
            <span className="font-medium text-gray-900">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
