/**
 * User Profile Form Component - REDESIGNED
 * Modern, premium form with enhanced UX
 * Features floating labels, smooth animations, and clean validation
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateProfile } from "@/lib/api/user.api";
import {
  Loader2,
  Save,
  Check,
  AlertCircle,
  User as UserIcon,
  Mail,
  Phone,
  Camera,
} from "lucide-react";
import GlobalLoader from "@/components/common/GlobalLoader";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export default function UserProfileForm() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    // Clear success and API error messages
    setSuccess(false);
    setApiError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError(null);
    setSuccess(false);

    try {
      // Call real API to update profile
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      // Refresh user data from server to sync auth context
      if (refreshUser) {
        await refreshUser();
      }

      setSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setApiError(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Section with Premium Design */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-6 sm:p-8 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Profile Settings</h2>
            <p className="text-sm text-slate-600">
              Update your personal information and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Profile Picture Section - Premium */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-8 mb-8 border-b border-slate-200">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border-2 border-slate-200 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-500 transition-all duration-200">
              <Camera className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Profile Picture
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Upload a profile photo to personalize your account
            </p>
            <button className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all duration-200">
              Change Photo
            </button>
          </div>
        </div>

        {/* Success Message - Modern */}
        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-l-4 border-emerald-500 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">Success!</p>
              <p className="text-sm text-emerald-700">Profile updated successfully</p>
            </div>
          </div>
        )}

        {/* Error Message - Modern */}
        {apiError && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100/50 border-l-4 border-red-500 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700">{apiError}</p>
            </div>
          </div>
        )}

        {/* Profile Form - Modern Floating Labels */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field - Modern */}
          <div className="relative">
            <label
              htmlFor="name"
              className="absolute -top-2.5 left-3 px-2 text-xs font-medium text-slate-700 bg-white z-10"
            >
              Full Name *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 bg-red-50/50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field - Modern */}
          <div className="relative">
            <label
              htmlFor="email"
              className="absolute -top-2.5 left-3 px-2 text-xs font-medium text-slate-700 bg-white z-10"
            >
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.email
                    ? "border-red-300 bg-red-50/50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field - Modern */}
          <div className="relative">
            <label
              htmlFor="phone"
              className="absolute -top-2.5 left-3 px-2 text-xs font-medium text-slate-700 bg-white z-10"
            >
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.phone
                    ? "border-red-300 bg-red-50/50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.phone}
              </p>
            )}
            {!errors.phone && (
              <p className="mt-2 text-xs text-slate-500">
                Optional. Include country code for international numbers.
              </p>
            )}
          </div>

          {/* Submit Button - Premium */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <GlobalLoader size="small" className="mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
