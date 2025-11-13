/**
 * Orders listing page - Fully automated with robust error handling
 * Handles loading, empty state, 401 errors, and CORS/network errors
 */

"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMyOrders, type ApiError } from '@/lib/api/orders.api';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err as ApiError);
      
      // Auto-redirect to login on 401 after 1.5s
      if ((err as ApiError).status === 401) {
        setTimeout(() => {
          router.push('/auth/request');
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A';
    return `$${amount.toFixed(2)}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-slate-900">My Orders</h1>
          
          {/* Skeleton loading */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 text-slate-600">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // 401 Error - Not authenticated
  if (error?.status === 401 || error?.message === 'No token') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Authentication Required</h2>
          <p className="text-slate-600 mb-6">You must be logged in to view your orders.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/request')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Login Now
            </button>
            
            <button
              onClick={fetchOrders}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition"
            >
              Retry
            </button>
          </div>
          
          <p className="mt-4 text-sm text-slate-500">Redirecting to login in 1.5s...</p>
        </div>
      </div>
    );
  }

  // CORS or Network Error
  if (error?.status === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900 text-center">Network or CORS Error</h2>
          <p className="text-slate-600 mb-4 text-center">
            Unable to connect to the backend server. This might be a CORS issue or the backend is not running.
          </p>
          
          <div className="bg-slate-100 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-slate-700 mb-2">Check backend status:</p>
            <code className="block bg-slate-900 text-slate-100 p-3 rounded text-sm overflow-x-auto">
              curl -i http://localhost:5001
            </code>
            <p className="text-xs text-slate-500 mt-2">
              Expected: HTTP 200 response. If you get a connection error, start the backend.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-yellow-800 mb-2">CORS Fix (if needed):</p>
            <p className="text-xs text-yellow-700 mb-2">
              If backend is running but you see CORS errors in browser console, ensure CORS middleware is configured in <code>kk-backend/src/app.js</code>
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.open('http://localhost:5001', '_blank')}
              className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Check Backend
            </button>
            
            <button
              onClick={fetchOrders}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Other errors
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2 text-slate-900">Error Loading Orders</h2>
          <p className="text-slate-600 mb-2">Status: {error.status}</p>
          <p className="text-slate-600 mb-6">{error.message}</p>
          
          <button
            onClick={fetchOrders}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-slate-900">My Orders</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">No Orders Yet</h2>
            <p className="text-slate-600 mb-6">You haven&apos;t placed any orders. Start shopping!</p>
            
            <Link
              href="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success - Display orders
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
          <button
            onClick={fetchOrders}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Refresh
          </button>
        </div>
        
        {/* Orders grid - responsive */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order: any) => {
            const orderId = order._id || order.id || 'unknown';
            const shortId = orderId.toString().slice(0, 8).toUpperCase();
            const createdDate = formatDate(order.createdAt || order.created_at);
            const status = order.status || 'pending';
            const total = order.total || order.totalPrice || order.total_price || 0;
            const items = order.items || [];

            return (
              <div
                key={orderId}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                {/* Order header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">#{shortId}</h3>
                    <p className="text-xs text-slate-500 mt-1">{createdDate}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Order details */}
                <div className="border-t border-slate-200 pt-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">Items:</p>
                    <ul className="space-y-1">
                      {items.slice(0, 3).map((item: any, idx: number) => {
                        const itemName = item.title || item.name || item.product?.name || 'Unknown';
                        const qty = item.qty || item.quantity || 1;
                        
                        return (
                          <li key={idx} className="text-sm text-slate-600 flex justify-between">
                            <span className="truncate flex-1">{itemName}</span>
                            <span className="ml-2 text-slate-500">×{qty}</span>
                          </li>
                        );
                      })}
                      {items.length > 3 && (
                        <li className="text-xs text-slate-500 italic">
                          +{items.length - 3} more item(s)
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Total:</span>
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* View details link */}
                <Link
                  href={`/orders/${orderId}`}
                  className="mt-4 block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition"
                >
                  View Details
                </Link>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Showing {orders.length} order(s)</p>
        </div>
      </div>
    </div>
  );
}
