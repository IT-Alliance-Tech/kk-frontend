/**
 * Orders List Page
 * Shows all orders for the authenticated user
 */

"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrdersList from "@/components/OrdersList";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Orders
            </h2>
            <p className="text-gray-600 mt-2">
              Track and manage your order history
            </p>
          </div>

          {/* Orders List Component */}
          <OrdersList />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
