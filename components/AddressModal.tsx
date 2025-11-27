"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { addAddress, updateAddress } from "@/lib/api/user.api";
import { useToast } from "@/hooks/use-toast";

interface AddressModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: {
    index?: number;
    name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    isDefault?: boolean;
  } | null;
}

interface FormErrors {
  name?: string;
  phone?: string;
  line1?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export default function AddressModal({ open, onClose, onSaved, initialData }: AddressModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    isDefault: false,
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          phone: initialData.phone || "",
          line1: initialData.line1 || "",
          line2: initialData.line2 || "",
          city: initialData.city || "",
          state: initialData.state || "",
          country: initialData.country || "India",
          pincode: initialData.pincode || "",
          isDefault: initialData.isDefault || false,
        });
      } else {
        setFormData({
          name: "",
          phone: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
          isDefault: false,
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }

    if (!formData.line1.trim()) {
      newErrors.line1 = "Address line 1 is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        line1: formData.line1.trim(),
        line2: formData.line2.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        pincode: formData.pincode.trim(),
        isDefault: formData.isDefault,
      };

      if (initialData && typeof initialData.index === "number") {
        // Edit mode
        await updateAddress(initialData.index, payload);
        toast({ title: "Address updated successfully" });
      } else {
        // Add mode
        await addAddress(payload);
        toast({ title: "Address added successfully" });
      }

      onSaved();
      onClose();
    } catch (error: any) {
      console.error("Error saving address:", error);
      const errorMessage = error?.message || "Failed to save address. Please try again.";
      toast({ 
        title: "Error saving address", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData && typeof initialData.index === "number" ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.line1}
              onChange={(e) => handleChange("line1", e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.line1 ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="House No., Building Name"
            />
            {errors.line1 && <p className="text-red-500 text-sm mt-1">{errors.line1}</p>}
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.line2}
              onChange={(e) => handleChange("line2", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Road, Area, Colony (Optional)"
            />
          </div>

          {/* City, State, Pincode - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="City"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.state ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="State"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.pincode ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="6-digit pincode"
                maxLength={6}
              />
              {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Country"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>

          {/* Is Default Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => handleChange("isDefault", e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : initialData && typeof initialData.index === "number" ? "Update Address" : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
