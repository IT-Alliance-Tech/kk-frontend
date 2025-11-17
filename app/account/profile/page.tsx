/**
 * User Profile Page
 * Allows users to view and edit their profile information
 */

"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfileForm from "@/components/UserProfileForm";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Profile Settings
            </h2>
            <p className="text-gray-600 mt-2">
              Update your personal information and preferences
            </p>
          </div>

          {/* Profile Form */}
          <UserProfileForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
