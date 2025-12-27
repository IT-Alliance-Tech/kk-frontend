/**
 * User Profile Form Component
 * Allows users to view and edit their profile information
 * Features:
 * - Form fields for name, email, phone
 * - Real-time validation
 * - Loading and error states
 * - Success notifications
 * - Responsive design
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 sm:p-8">
        {/* Profile Picture Section */}
        <div className="flex items-center gap-6 pb-6 mb-6 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Profile Picture
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Update your profile photo
            </p>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Change Photo
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              Profile updated successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{apiError}</p>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.name
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.email
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                errors.phone
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-white"
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Optional. Include country code for international numbers.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
