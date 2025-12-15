/**
 * Account Dashboard Home Page
 * Main landing page for user account section
 * Shows welcome message and quick stats/overview
 */

"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ShoppingBag, User, MapPin, Heart } from "lucide-react";

const UserDashboardClient = dynamic(
  () => import("@/components/UserDashboardClient"),
  { ssr: false }
);

export default function AccountPage() {
  const { user } = useAuth();

  // Quick action cards
  const quickActions = [
    {
      title: "Profile",
      description: "Update your personal information",
      href: "/account/profile",
      icon: <User className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Orders",
      description: "View your order history",
      href: "/account/orders",
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Addresses",
      description: "Manage your addresses",
      href: "/account/addresses",
      icon: <MapPin className="w-6 h-6" />,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Wishlist",
      description: "View your saved items",
      href: "/account/wishlist",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 border border-gray-200">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || "there"}! 👋
            </h2>
            <p className="text-gray-600">
              Manage your account, track orders, and update your preferences.
            </p>
          </div>

          {/* User Dashboard Data */}
          <UserDashboardClient />

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900 font-medium">
                  {user?.email || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Name</span>
                <span className="text-gray-900 font-medium">
                  {user?.name || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Phone</span>
                <span className="text-gray-900 font-medium">
                  {user?.phone || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-900 font-medium">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "Recently"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
