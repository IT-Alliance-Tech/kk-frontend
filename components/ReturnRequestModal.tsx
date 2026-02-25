"use client";

import { useState, useEffect } from "react";
import { createReturnRequest, CreateReturnRequestPayload } from "@/lib/api/returns.api";
import { ApiError } from "@/lib/api";

interface ReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  itemId: string;
  productName: string;
  productImage?: string;
  productPrice?: number;
  maxQuantity?: number; // total quantity ordered minus already returned qty
  onSuccess?: () => void;
  isDemo?: boolean;
}

export default function ReturnRequestModal({
  isOpen,
  onClose,
  orderId,
  itemId,
  productName,
  productImage,
  productPrice,
  maxQuantity = 1,
  onSuccess,
  isDemo = false,
}: ReturnRequestModalProps) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQty(1);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (qty < 1 || qty > maxQuantity) {
      setError(`Quantity must be between 1 and ${maxQuantity}`);
      return;
    }

    try {
      setLoading(true);

      const payload: CreateReturnRequestPayload = {
        orderId,
        itemId,
        qty,
      };

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
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
              Return Requested Successfully!
            </h3>
            <p className="text-slate-600">
              We&apos;ll review your request and process it shortly.
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
                Item Details
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
                    <p>Order Number: #{orderId.slice(-8).toUpperCase()}</p>
                    {productPrice !== undefined && (
                      <p>Price: ₹{productPrice.toFixed(2)}</p>
                    )}
                    <p>Eligible Quantity: {maxQuantity}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-6 space-y-6">
              {/* Quantiy Selection */}
              <div>
                <label
                  htmlFor="qty"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Quantity to return
                </label>
                <select
                  id="qty"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100"
                >
                  {Array.from({ length: maxQuantity }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

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
                disabled={loading}
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
