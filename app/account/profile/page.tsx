/**
 * User Profile Page - REDESIGNED
 * Modern premium profile editing page
 */

"use client";

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserProfileForm from "@/components/UserProfileForm";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header - Premium */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                Profile Settings
              </h2>
            </div>
            <p className="text-slate-600 ml-15">
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
