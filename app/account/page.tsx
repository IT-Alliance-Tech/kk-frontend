/**
 * Account Dashboard Home Page - REDESIGNED
 * Modern, premium dashboard with enhanced visuals
 * Features gradient cards, smooth animations, and clean hierarchy
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ShoppingBag, User, MapPin, TrendingUp, Package, Star } from "lucide-react";

const UserDashboardClient = dynamic(
  () => import("@/components/UserDashboardClient"),
  { ssr: false }
);

export default function AccountPage() {
  const { user } = useAuth();

  // Quick action cards with modern gradients
  const quickActions = [
    {
      title: "Profile",
      description: "Update your personal information",
      href: "/account/profile",
      icon: <User className="w-6 h-6" />,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-500",
    },
    {
      title: "Orders",
      description: "View your order history",
      href: "/account/orders",
      icon: <ShoppingBag className="w-6 h-6" />,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100/50",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Addresses",
      description: "Manage your addresses",
      href: "/account/addresses",
      icon: <MapPin className="w-6 h-6" />,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-500",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section - Premium Design */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-600 rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white">
                    Welcome back, {user?.name?.split(' ')[0] || "there"}! 👋
                  </h2>
                  <p className="text-emerald-100 text-sm sm:text-base mt-1">
                    Manage your account, track orders, and discover more
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Dashboard Data (Stats) */}
          <UserDashboardClient />

          {/* Quick Actions Grid - Modern Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Quick Actions</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <TrendingUp className="w-4 h-4" />
                <span>Get started</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 p-6"
                >
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div
                      className={`w-14 h-14 rounded-2xl ${action.iconBg} bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg shadow-${action.iconBg}/20 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-white">{action.icon}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-slate-800">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-600 group-hover:text-slate-700">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Account Info Card - Premium Design */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Account Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-600">Email</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.email || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-600">Name</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.name || "Not set"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-600">Phone</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.phone || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-sm font-medium text-slate-600">Member Since</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
