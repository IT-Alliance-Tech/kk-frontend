"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUserDashboard, type DashboardData } from "@/lib/api/user.api";
import { ShoppingBag, DollarSign, Package, ShoppingCart, TrendingUp, Clock, CheckCircle } from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

/**
 * UserDashboardClient - REDESIGNED
 * Modern premium dashboard with gradient cards and enhanced visuals
 * Features animated stats, beautiful gradients, and clean data display
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

  // Stats configuration with modern gradients
  const statsConfig = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Spent",
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Cart Items",
      value: cart?.itemCount || 0,
      icon: ShoppingCart,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      iconColor: "text-purple-600",
    },
    {
      title: "Pending Orders",
      value: stats.byStatus?.pending || 0,
      icon: Clock,
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100/50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid - Modern Premium Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900">Overview</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp className="w-4 h-4" />
            <span>Your activity</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 p-6"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-${stat.gradient}/20 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders - Modern Design */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Recent Orders</h3>
            </div>
            <Link
              href="/account/orders"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div key={order.orderId} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                      <ShoppingBag className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Order #{order.orderId.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-lg">${order.total.toFixed(2)}</p>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === "delivered"
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm shadow-green-500/30"
                          : order.status === "shipped"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-500/30"
                            : order.status === "processing"
                              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-sm shadow-yellow-500/30"
                              : "bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-sm shadow-slate-500/30"
                      }`}
                    >
                      {order.status === "delivered" && <CheckCircle className="w-3 h-3" />}
                      {order.status === "shipped" && <Package className="w-3 h-3" />}
                      {order.status === "processing" && <Clock className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 pl-13">
                  {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Summary - Modern */}
      {cart && cart.itemCount > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cart Summary</h3>
                <p className="text-sm text-slate-600">Items ready to checkout</p>
              </div>
            </div>
            <a
              href="/cart"
              className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-white hover:bg-purple-50 rounded-xl border border-purple-200 transition-all duration-200"
            >
              View Cart →
            </a>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-slate-900">{cart.itemCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Subtotal</p>
              <p className="text-2xl font-bold text-emerald-600">${cart.subtotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
