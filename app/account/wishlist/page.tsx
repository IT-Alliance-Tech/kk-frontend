/**
 * Wishlist Page
 * Shows user's saved/favorited items
 * Currently a placeholder with basic structure
 */

"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Wishlist
            </h2>
            <p className="text-gray-600 mt-2">
              Save your favorite items to purchase later
            </p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 border border-gray-200">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-6">
                Save items you love to your wishlist and buy them later.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Example Wishlist Grid (commented out for future implementation) */}
          {/* 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                    <Heart className="w-5 h-5 text-red-600 fill-current" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-red-600 font-bold mb-3">
                    ${item.price.toFixed(2)}
                  </p>
                  <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          */}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
