// NEW - admin demo
import React from "react";
import KPI from "../../components/admin/KPI";
import RecentOrdersTable from "../../components/admin/RecentOrdersTable";
import ordersData from "../../data/mock/orders.json";
import productsData from "../../data/mock/products.json";

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

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI
          title="Total Orders"
          value={totalOrders}
          icon="📦"
          trend={{ value: 12.5, isPositive: true }}
          subtitle="All time"
        />
        <KPI
          title="Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
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
        <KPI
          title="Pending Orders"
          value={pendingOrders}
          icon="⏳"
          trend={{ value: 3.2, isPositive: false }}
          subtitle="Awaiting processing"
        />
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={recentOrders} maxRows={5} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order Status Breakdown
          </h3>
          <div className="space-y-3">
            {["pending", "processing", "shipped", "delivered", "cancelled"].map(
              (status) => {
                const count = ordersData.filter(
                  (o) => o.status === status,
                ).length;
                const percentage = ((count / totalOrders) * 100).toFixed(1);
                return (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 capitalize">
                      {status}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-900">{product.name}</span>
                  <span
                    className={`text-sm font-semibold ${
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
              <p className="text-sm text-gray-500 text-center py-4">
                All products are well stocked
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
