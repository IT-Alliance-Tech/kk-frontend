// NEW - admin demo
import React from "react";
import Link from "next/link";

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: string;
  total: number;
}

interface RecentOrdersTableProps {
  orders: Order[];
  maxRows?: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function RecentOrdersTable({
  orders,
  maxRows = 5,
}: RecentOrdersTableProps) {
  const displayOrders = orders.slice(0, maxRows);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="kk-admin-orders-table bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
      <div className="px-3 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
        <Link
          href="/admin/orders"
          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
        >
          View All →
        </Link>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Date
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 block truncate">
                    {order.id}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4">
                  <div className="text-xs sm:text-sm">
                    <div className="font-medium text-gray-900 truncate">
                      {order.customer}
                    </div>
                    <div className="text-gray-500 hidden lg:block text-xs truncate">
                      {order.email}
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="text-xs sm:text-sm text-gray-900">
                    {formatDate(order.date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(order.date)}
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </td>
                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                  <button className="text-blue-600 hover:text-blue-900 font-medium truncate">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {displayOrders.length === 0 && (
        <div className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500 text-xs sm:text-sm">
          No recent orders
        </div>
      )}
    </div>
  );
}
