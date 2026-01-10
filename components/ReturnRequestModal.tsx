/**
 * Return Request Modal Component
 * Allows users to request return (with or without refund) for order items
 */

"use client";

import { useState, useEffect } from "react";
import { createReturnRequest, CreateReturnRequestPayload } from "@/lib/api/returns.api";
import { ApiError } from "@/lib/api";

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  quantity?: number;
  onSuccess?: () => void;
  isDemo?: boolean;
}

export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  productId,
  productName,
  productImage,
  productPrice,
  quantity = 1,
  onSuccess,
  isDemo = false,
}: ReturnRequestModalProps) {
  const [actionType, setActionType] = useState<"return" | "return_refund">("return");
  const [issueType, setIssueType] = useState<
    "damaged" | "wrong-item" | "quality-issue" | "late-delivery" | "others"
  >("damaged");
  const [issueDescription, setIssueDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActionType("return");
      setIssueType("damaged");
      setIssueDescription("");
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  // Validation: Issue description is required when issueType is 'others'
  const isFormValid = () => {
    if (issueType === "others") {
      return issueDescription.trim().length > 0;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid()) {
      setError("Please provide a description when selecting 'Others' as the issue type");
      return;
    }

    try {
      setLoading(true);

      const payload: CreateReturnRequestPayload = {
        orderId,
        productId,
        actionType,
        issueType,
      };

      // Only include description if issueType is 'others'
      if (issueType === "others") {
        payload.issueDescription = issueDescription.trim();
      }

      // Pass isDemo flag if this is a demo request
      if (isDemo) {
        payload.isDemo = true;
      }

      await createReturnRequest(payload);
      setSuccess(true);

      // Auto-close and callback after 1.5s
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to submit return request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Request Return
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold disabled:opacity-50"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="px-6 py-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              Request Submitted Successfully!
            </h3>
            <p className="text-slate-600">
              We&apos;ll review your request and get back to you soon.
            </p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit}>
            {/* Demo Banner */}
            {isDemo && (
              <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
                <p className="text-sm text-amber-800 font-medium text-center">
                  🎯 Demo Preview – No real order will be created
                </p>
              </div>
            )}

            {/* Product Details */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Product Details
              </h3>
              <div className="flex items-center gap-4">
                {productImage && (
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-16 h-16 object-cover rounded border border-slate-200"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{productName}</p>
                  <div className="text-sm text-slate-600 mt-1 space-y-1">
                    <p>Order ID: {orderId.slice(0, 8).toUpperCase()}</p>
                    {productPrice && (
                      <p>Price: ${productPrice.toFixed(2)}</p>
                    )}
                    <p>Quantity: {quantity}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-6 space-y-6">
              {/* Action Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  What would you like to do?
                </label>
                <div className="space-y-2">
                  {[
                    { value: "return", label: "Return Only" },
                    { value: "return_refund", label: "Return + Refund" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition"
                    >
                      <input
                        type="radio"
                        name="actionType"
                        value={option.value}
                        checked={actionType === option.value}
                        onChange={(e) =>
                          setActionType(e.target.value as "return" | "return_refund")
                        }
                        disabled={loading}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-slate-900">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Issue Type Selection */}
              <div>
                <label
                  htmlFor="issueType"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  What&apos;s the issue?
                </label>
                <select
                  id="issueType"
                  value={issueType}
                  onChange={(e) =>
                    setIssueType(
                      e.target.value as
                        | "damaged"
                        | "wrong-item"
                        | "quality-issue"
                        | "late-delivery"
                        | "others"
                    )
                  }
                  disabled={loading}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                >
                  <option value="damaged">Damaged product</option>
                  <option value="wrong-item">Wrong item received</option>
                  <option value="quality-issue">Quality not as expected</option>
                  <option value="late-delivery">Late delivery</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Issue Description (conditional) */}
              {issueType === "others" && (
                <div>
                  <label
                    htmlFor="issueDescription"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Please describe the issue *
                  </label>
                  <textarea
                    id="issueDescription"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    disabled={loading}
                    placeholder="Provide details about the issue..."
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    * Required when issue type is &quot;Others&quot;
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
