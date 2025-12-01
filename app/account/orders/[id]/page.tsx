/**
 * Order Detail Page
 * Shows detailed information about a specific order
 */

"use client";

import { use } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderDetail from "@/components/OrderDetail";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  // Unwrap the params promise using React.use()
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order Details
            </h2>
            <p className="text-gray-600 mt-2">Order ID: {id}</p>
          </div>

          {/* Order Detail Component */}
          <OrderDetail orderId={id} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
