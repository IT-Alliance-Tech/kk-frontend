/**
 * Orders List Page - REDESIGNED
 * Modern premium page for viewing order history
 */

"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrdersList from "@/components/OrdersList";
import { Package } from "lucide-react";

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header - Premium */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent">
                My Orders
              </h2>
            </div>
            <p className="text-slate-600 ml-15">
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
