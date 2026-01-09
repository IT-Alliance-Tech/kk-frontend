/**
 * Wishlist Page - REDESIGNED
 * Modern premium wishlist with enhanced visuals
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
          {/* Page Header - Premium */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-pink-600 bg-clip-text text-transparent">
                My Wishlist
              </h2>
            </div>
            <p className="text-slate-600 ml-15">
              Save your favorite items to purchase later
            </p>
          </div>

          {/* Empty State - Modern */}
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 border border-slate-200">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-slate-600 mb-6">
                Save items you love to your wishlist and buy them later.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/20"
              >
                <Heart className="w-5 h-5" />
                Browse Products
              </Link>
            </div>
          </div>

          {/* Example Wishlist Grid (commented out for future implementation) */}
          {/* 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-xl hover:border-slate-300 transition-all duration-300">
                <div className="aspect-square relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all duration-200">
                    <Heart className="w-5 h-5 text-pink-600 fill-current" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-emerald-600 font-bold text-lg mb-4">
                    ${item.price.toFixed(2)}
                  </p>
                  <button className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20">
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
