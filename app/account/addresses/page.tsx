/**
 * Addresses Page
 * Manage shipping and billing addresses
 * Currently a placeholder with basic structure
 */

"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MapPin, Plus } from "lucide-react";

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                My Addresses
              </h2>
              <p className="text-gray-600 mt-2">
                Manage your shipping and billing addresses
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm">
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Address</span>
            </button>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 border border-gray-200">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No addresses yet
              </h3>
              <p className="text-gray-600 mb-6">
                Add your shipping addresses to make checkout faster and easier.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm">
                <Plus className="w-5 h-5" />
                Add Your First Address
              </button>
            </div>
          </div>

          {/* Example Address Card (commented out for now) */}
          {/* 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">Home</h3>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  Default
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>John Doe</p>
                <p>123 Main Street</p>
                <p>Apartment 4B</p>
                <p>New York, NY 10001</p>
                <p>Phone: (555) 123-4567</p>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Edit
                </button>
                <button className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
          */}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
